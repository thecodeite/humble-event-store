module.exports = EventStore;

const util = require('util');
const EventEmitter = require("events").EventEmitter;
const moment = require('moment');
const flake = new (require('flake-idgen'))();

function EventStore(name, eventPersistence) {
  if(!eventPersistence) throw new Error('Can not create EventStore without event persistance');
  this.name = name;
  this.eventPersistence = eventPersistence;
}
util.inherits(EventStore, EventEmitter);

EventStore.prototype.logEvent = function (id, eventName, payload, tracker) {
  this.eventPersistence.nextVersion()
    .then(thisVersion => {

    payload = JSON.parse(JSON.stringify(payload));

    const event = {
      id: id,
      version: thisVersion,
      eventName: eventName,
      createdAt: moment().format(),
      payload: payload,
    };
    Object.freeze(event);

    const eventEnvelope = {
      event: event,
      tracker: tracker
    };

    this.eventPersistence.storeEvent(event)
      .then(()=>{
        this.emit('eventAdded', eventEnvelope);
        if(tracker) this.emit(tracker, eventEnvelope);
      });
  });
};

EventStore.prototype.replay = function(tracker) {


  this.eventPersistence.forEach(x => {
    const eventEnvelope = { event: x.event };
    if(tracker && !x.hasMore) eventEnvelope.tracker = tracker;
    this.emit('eventAdded', eventEnvelope);
  }).then(()=> {
    if(tracker){ this.emit(tracker);}
  });
};

EventStore.prototype.getTracker = function() {
  return flake.next().toString('hex');
};
