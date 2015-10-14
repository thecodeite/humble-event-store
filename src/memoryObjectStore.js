module.exports = MemoryObjectStore;

const util = require('util');
const EventEmitter = require("events").EventEmitter;

const entities = [];

function MemoryObjectStore() {
}
util.inherits(MemoryObjectStore, EventEmitter);

MemoryObjectStore.prototype.getById = function (id) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      resolve(entities[id]);
    });
  });
};

MemoryObjectStore.prototype.set = function(id, object) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      entities[id] = object;
      resolve();
    });
  });
};
