module.exports = MemoryObjectStore;



function MemoryObjectStore() {
  this.entities = [];
}

MemoryObjectStore.prototype.getById = function (id) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      resolve(this.entities[id]);
    });
  });
};

MemoryObjectStore.prototype.set = function(id, object) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      this.entities[id] = object;
      resolve();
    });
  });
};
