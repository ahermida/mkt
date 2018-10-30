/**
 * Peers packaged in a simple way
 */
import EventEmitter from 'events';
import sjcl from 'sjcl';

export default class Peer extends EventEmitter {

  //pass in id, shared key, channel, and optionally WebRTC (as a module) in case we're in Node.
  constructor(id, user, sk, channel, wrtc) {
    super();
    this.id = id;
    this.user = user; // their id, not ours
    this.channel = channel;
    this.wrtc = wrtc ? wrtc : { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription };
    this.rtc = null;
    this.dataChannel = null;
    this.sk = sk;
    this.mq = [];
    this.RTCSettings = {
      'iceServers': [
        {
          'urls': [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302',
          ],
        },
      ],
    };

    if (!(wrtc || window)) {
      throw new Error(`If you're in Node.js, you need to supply WebRTC!`);
    }

    //let's empty the queue on connection
    this.on('connection', () => {
      if (this.connected()) {
        while(this.mq.length)
          this.send(this.mq.shift());
      }
    });

    //listen to channel for responses, create connections from them
    this.channel.on('message', m => {
      let parsed;
      try {
        parsed = JSON.parse(m.data.toString());
      } catch (e) {
        console.log('Malformed JSON on signaling message.', JSON.stringify(m.data.toString()));
        return;
      }

      //hop out if this is our message
      if (parsed.id == this.id)
        return;

      if (parsed.answer && !this.answered) {
        console.log(`GOT ANSWER AS ${this.id} FROM ${this.user}`);
        this.answered = true;
        this.getAnswer(parsed.answer);
      } else if (parsed.offer) {
        console.log(`GOT OFFER AS ${this.id} FROM ${this.user}`);
        this.respond(parsed.offer);
      }
    });
  }

  //send messages
  send(message) {
    if (!this.connected) {
      this.mq.push(message);
    }
    this.dataChannel.send(message);
    this.emit('sent', message);
  }

  //hanle incoming data
  handleMessage(message) {
    this.emit('message', message);
  }

  //booted from automerge, thought it was elegant
  connected() {
    return this.dataChannel && this.dataChannel.readyState == 'open';
  }

  //send off connection data and connect
  initialize() {
    this.rtc = new this.wrtc.RTCPeerConnection(this.RTCSettings);
    this.makeDataChannel();
    this.rtc.createOffer(desc => {
      this.rtc.setLocalDescription(desc, () => {}, this.handleErr);
    }, this.handleErr);
    this.rtc.onicecandidate = c => {
      if (c.candidate == null) {
        this.sendOffer();
      }
    }
    this.rtc.oniceconnectionstatechange = () => {
      if (this.rtc.iceConnectionState == "disconnected") {
        this.emit('disconnect')
      }
      if (this.rtc.iceConnectionState == "failed" || this.rtc.iceConnectionState == "closed") {
        this.emit('disconnect')
      }
    }

    //for chaining methods
    return this;
  }

  //respond to an offer
  respond(parsed) {

    //get offer text
    let offer = this.decrypt(parsed);

    //ensure that we're listening
    let desc = new this.wrtc.RTCSessionDescription(offer);
    this.rtc = new this.wrtc.RTCPeerConnection(this.RTCSettings);
    this.rtc.onicecandidate = e => {
      if (e.candidate == null) {
        this.sendAnswer();
      }
    };
    this.handleDataChannel(desc);

    //again, for chaining
    return this;
  }

  handleDataChannel(desc) {
    this.rtc.ondatachannel = e => {
      this.dataChannel = e.channel;
      this.dataChannel.onopen = () => this.emit('connection');
      this.dataChannel.onmessage = m => this.handleMessage(m.data);
      this.dataChannel.onerror = this.handleErr;
    };

    this.rtc.setRemoteDescription(desc, this.createAnswer.bind(this), this.handleErr);
  }

  makeDataChannel() {

    //data channels apparently need to be made before doing anything important
    this.dataChannel = this.rtc.createDataChannel('mkt');
    this.dataChannel.onopen = () => this.emit('connection')
    this.dataChannel.onmessage = m => this.handleMessage(m.data);
    this.dataChannel.onerror = this.handleErr;

  }

  //send over the answer
  sendAnswer() {
    console.log(`SENDING ANSWER FROM ${this.id} to ${this.user}`);
    let answer = this.rtc.localDescription;
    answer = sjcl.encrypt(this.sk, JSON.stringify(answer));
    this.channel.send(JSON.stringify({
      answer: answer,
      id: this.id,
    }));
  }

  sendOffer() {
    console.log(`SENDING OFFER FROM ${this.id} to ${this.user}`);
    let offer = this.rtc.localDescription;
    offer = sjcl.encrypt(this.sk, JSON.stringify(offer));
    this.channel.send(JSON.stringify({
      offer: offer,
      id: this.id,
    }));
  }

  createAnswer() {
    this.rtc.createAnswer(this.setLocalDesc.bind(this), this.handleErr);
  }

  setLocalDesc(desc) {
    this.rtc.setLocalDescription(desc, () => {}, this.handeErr);
  }

  getAnswer(parsed) {
    let data = this.decrypt(parsed);
    let answer = new this.wrtc.RTCSessionDescription(data);
    this.rtc.setRemoteDescription(answer);
  }

  handleErr(e) {
    console.log('Error in signaling', this.id, e);
  }

  //decrypt a stringified object and return it
  decrypt(obj) {
    let parsed;
    try {
      let str = sjcl.decrypt(this.sk, obj);
      parsed = JSON.parse(str);
    } catch (e) {
      console.log('Error in trying to decrypt signaling data. Did you use the proper shared key?');
    }
    return parsed;
  }
}
