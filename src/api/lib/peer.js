/**
 * Peers packaged in a simple way
 */
import EventEmitter from 'events';
import sjcl from 'sjcl';

export default class Peer extends EventEmitter {

  //pass in id, shared key, channel, and optionally WebRTC (as a module) in case we're in Node.
  constructor(id, sk, channel, wrtc) {
    super();
    this.id = id;
    this.channel = channel;
    this.wrtc = wrtc ? wrtc : { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription };
    this.rtc = null;
    this.dataChannel = null;
    this.sk = sk;
    this.mq = [];
    this.RTCSettings = {
      iceServers: [
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
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
        parsed = JSON.parse(m);
      } catch (e) {
        console.log('Malformed JSON on signaling message.');
        return;
      }
      if (parsed.offer) {
        let offer = decrypt(parsed.offer);
        if (offer) {
          this.respond(offer);
        }
      } else if (parsed.answer) {
        let answer = decrypt(parsed.answer);
        if (answer) {
          this.getAnswer(answer);
        }
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
      this.rtc.setLocalDescription(desc, function () {}, this.handleErr);
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
  respond(data) {

    //ensure that we're listening
    let desc = new this.wrtc.RTCSessionDescription(data);
    this.rtc = new this.wrtc.RTCPeerConnection(this.RTCSettings);
    this.rtc.onicecandidate = e => {
      if (e.candidate == null) {
        this.sendAnswer();
      }
    }
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

    this.rtc.setRemoteDescription(desc, this.createAnswer, this.handleErr);
  }

  makeDataChannel() {

    // data channels apparently need to be made before doing anything important
    this.dataChannel = this.rtc.createDataChannel('mkt');
    this.dataChannel.onopen = () => this.emit('connection')
    this.dataChannel.onmessage = m => this.handleMessage(m.data);
    this.dataChannel.onerror = this.handleErr;

  }

  //send over the answer
  sendAnswer() {
    let answer = this.rtc.localDescription;
    answer = sjcl.encrypt(this.sk, JSON.stringify(answer));
    this.channel.send(JSON.stringify({
      answer: answer,
      id: this.id,
    }));
  }

  sendOffer() {
    let offer = this.rtc.localDescription;
    offer = sjcl.encrypt(this.sk, JSON.stringify(offer));
    this.channel.send(JSON.stringify({
      offer: offer,
      id: this.id,
    }));
  }

  createAnswer() {
    this.rtc.createAnswer(this.setLocalDesc, this.handleErr);
  }

  setLocalDesc(desc) {
    this.rtc.setLocalDescription(desc, () => {}, this.handeErr);
  }

  getAnswer(data) {
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
      let str = sjcl.decrypt(sk, obj);
      parsed = JSON.parse(str);
    } catch (e) {
      console.log('Error in trying to decrypt signaling data. Did you use the proper shared key?');
    }
    return parsed;
  }
}
