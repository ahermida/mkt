/**
 *  take in IPFS rooms and dataChannels, spit out common format for signaling channel
 */
import EventEmitter from 'events';

export default class Channel extends EventEmitter {

  //take in an object with id and either a room or data channel
  constructor({ room, dc }) {
    super();
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
}
