module.exports = MemoryEventPersistence;

//const util = require('util');
//const EventEmitter = require("events").EventEmitter;



function MemoryEventPersistence() {
  this.events = [];
  this.nextVersionToHandOut = 1;
}
//util.inherits(MemoryObjectStore, EventEmitter);

MemoryEventPersistence.prototype.nextVersion = function () {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      const nextVersionResult = this.nextVersionToHandOut;
      this.nextVersionToHandOut++;
      resolve(nextVersionResult);
    });
  });
};

MemoryEventPersistence.prototype.storeEvent = function (event) {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      this.events.push(event);
      resolve();
    });
  });
};

MemoryEventPersistence.prototype.forEach = function(cb) {

  return new Promise((resolve, reject) => {
    var i = 0;
    var length = this.events.length;

    var callNext = () => {
      const curentIndex = i;
      const current = this.events[curentIndex];
      if(!current) return resolve();
      i++;
      process.nextTick(() => {
        cb({
          index: curentIndex,
          event: current,
          hasMore: curentIndex < length-1
        });
        callNext();
      });
    };

    callNext();
  });
};
