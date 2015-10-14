const EventStore = require('./eventStore');
const MemoryObjectStore = require('./memoryObjectStore');
const MemoryEventPersistence = require('./memoryEventPersistence');
const eventProjection = require('./eventProjection');

module.exports = {
  EventStore: EventStore,
  MemoryObjectStore: MemoryObjectStore,
  MemoryEventPersistence: MemoryEventPersistence,
  createEventProjection: eventProjection
};
