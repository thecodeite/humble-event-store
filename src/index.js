const EventStore = require('./eventStore');
const ObjectStore = require('./objectStore');
const MemoryObjectStore = require('./memoryObjectStore');
const MemoryEventPersistence = require('./memoryEventPersistence');
const eventProjection = require('./eventProjection');

module.exports = {
  EventStore: EventStore,
  ObjectStore: ObjectStore,
  MemoryObjectStore: MemoryObjectStore,
  MemoryEventPersistence: MemoryEventPersistence,
  createEventProjection: createEventProjection
};
