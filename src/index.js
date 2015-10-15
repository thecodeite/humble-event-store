const EventStore = require('./eventStore');
const MemoryObjectStore = require('./memoryObjectStore');
const MemoryEventPersistence = require('./memoryEventPersistence');
const FileObjectStore = require('./fileObjectStore');
const FileEventPersistence = require('./fileEventPersistence');
const eventProjection = require('./eventProjection');

module.exports = {
  EventStore: EventStore,
  MemoryObjectStore: MemoryObjectStore,
  MemoryEventPersistence: MemoryEventPersistence,
  createEventProjection: eventProjection,
  FileEventPersistence: FileEventPersistence,
  FileObjectStore: FileObjectStore
};
