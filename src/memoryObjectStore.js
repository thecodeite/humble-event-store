module.exports = MemoryObjectStore;

const entities = [];

function MemoryObjectStore() {
}

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
