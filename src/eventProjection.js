'strict mode';

module.exports = createEventProjection;

const util = require('util');
const EventEmitter = require("events").EventEmitter;
const moment = require('moment');

function createEventProjection(eventProjectionName, eventStore, objectStore) {
  if(!eventStore) throw new Error('tried to createEventProjection but passed invalid eventStore');
  if(!objectStore) throw new Error('tried to createEventProjection but passed invalid objectStore');

  if(typeof(objectStore.getById) !== 'function')
    throw new Error('Can not create EventProjection without objectStore that supports "getById"');

  if(typeof(objectStore.set) !== 'function')
    throw new Error('Can not create EventStore without eventPersistence that supports "set"');

  function EventProjection() {}
  util.inherits(EventProjection, EventEmitter);

  const eventProjection = new EventProjection();
  const name = eventProjectionName;
  const eventHandlers = [];
  const hooks = {};
  const eventQueue = [];
  var processing = false;

  var currentVersion = 0;

  eventStore.on('eventAdded', e => {
    eventQueue.push(e);
    process.nextTick(processEvent);
  });

  function processEvent() {
    if(processing || eventQueue.length === 0) return;
    const envelope = eventQueue.shift();
    // console.log('EventProjection processEvent->envelope:', envelope);
    const e = envelope.event;

    if(e.version <= currentVersion) {
      if(envelope.tracker) eventProjection.emit(envelope.tracker);
      return process.nextTick(processEvent);
    }
    currentVersion = e.version;
    var hook = hooks[e.eventName];

    if(!hook) {
      if(envelope.tracker) eventProjection.emit(envelope.tracker);
      return process.nextTick(processEvent);
    }

    processing = true;
    objectStore.getById(e.id)
      .then(existing => {
        existing = existing || {id: e.id};
        //console.log('existing:', existing);
        return Promise.resolve(existing);
      })
      .then(existing => hook(existing, e.payload))
      .then(newLook => {
        newLook.id = e.id;

        return objectStore.set(e.id, newLook)
          .then(() => Promise.resolve(newLook));
      })
      .then(newLook => {

        if(envelope.tracker) eventProjection.emit(envelope.tracker, newLook);
        processing = false;
        process.nextTick(processEvent);
      })
      .catch(err => {
        console.error(`Error while trying to fire event on entity with id ${e.id}`, err);
        processing = false;
        processEvent();
        return Promise.rejcet(err);
      });

  }

  Object.defineProperty(EventProjection.prototype, "currentVersion", {
    get: () => currentVersion
  });

  EventProjection.prototype.addHook = function(id, func) {
    hooks[id] = func;
  };

  EventProjection.prototype.defaultStoreAction = (existing, payload) => {
    return Promise.resolve(Object.assign({}, existing, payload));
  };

  EventProjection.prototype.reset = function() {
    currentVersion = 0;
  };

  EventProjection.prototype.dump = function() {
    console.log('EventProjection.dump:', {
      eventHandlers: eventHandlers.length,
      hooks: Object.keys(hooks),
      eventQueue: eventQueue
    });
  };

  return eventProjection;
}
