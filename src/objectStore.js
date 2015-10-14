module.exports = ObjectStore;

const util = require('util');
const EventEmitter = require("events").EventEmitter;

function ObjectStore(name) {
}
util.inherits(ObjectStore, EventEmitter);

ObjectStore.prototype.getById = function (id) {

};

ObjectStore.prototype.set = function(id, object, tracker) {

};
