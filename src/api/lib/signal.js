/**
 *  take in IPFS rooms and dataChannels, spit out common format for signaling channel
 */
export default class Channel {

  //take in an object with id and either a room or data channel
  constructor({ room, dc, id }) {
    if (room) {
      room.on('message', m => {

      });
    } else if (dc) {
      dc.on('message', m => {

      });
    } else {
      throw new Error("You must provide a room or dataChannel to do signaling");
    }
  }
}
