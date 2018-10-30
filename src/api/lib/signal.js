/**
 *  take in IPFS rooms and dataChannels, spit out common format for signaling channel
 */
import EventEmitter from 'events';

export default class Channel extends EventEmitter {

  //take in an object with id and either a room or data channel
  constructor({ room, dc }) {
    super();
    this.isRoom = !!room;

    this.room = this.isRoom ? room : dc;
    if (room) {
      room.on('message', m => {
        this.emit('message', m);
      });
    } else if (dc) {
      dc.on('message', m => {
        this.emit('message', m);
      });
    } else {
      throw new Error("You must provide a room or dataChannel to do signaling");
    }
  }

  //can handle either pubsub rooms or data channels, to do signaling through a peer
  send(message) {
    this.isRoom ? this.room.broadcast(message) :
                  this.room.send('message', message);
  }
}
