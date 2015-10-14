module.exports = FileEventPersistence;

const fs = require('fs');
const constants = require('constants');
const ndjson = require('ndjson');

const processingQueues = {};

const readWriteCreateFlag = constants.O_RDWR | constants.O_CREAT;

function FileEventPersistence(versionFilePath, eventFilePath) {
  this.versionFilePath = versionFilePath;
  this.eventFilePath = eventFilePath;
}

FileEventPersistence.prototype.nextVersion = function () {

  return new Promise((resolve, reject) => {
    var thisProcessingQueues = processingQueues[this.versionFilePath];
    if(!thisProcessingQueues) thisProcessingQueues = processingQueues[this.versionFilePath] = [];

    thisProcessingQueues.push({resolve: resolve, reject:reject});
    if(thisProcessingQueues.length > 1) {
      return;
    } else {
        process.nextTick(() => doGetNextVersion(this.versionFilePath, resolve, reject, onDone));
    }
  });
};

function onDone(versionFilePath) {
  const thisProcessingQueues = processingQueues[versionFilePath];
  thisProcessingQueues.shift();
  if(thisProcessingQueues.length > 0) {
    const next = thisProcessingQueues[0];
      process.nextTick(() => doGetNextVersion(versionFilePath, next.resolve, next.reject, onDone));
  }
}

function doGetNextVersion(versionFilePath, presolve, preject, done) {
  resolve = x=>{presolve(x); done(versionFilePath);};
  reject = e=>{preject(e); done(versionFilePath);};

  fs.open(versionFilePath, readWriteCreateFlag, (err, fd) =>{
    if(err) return reject(err);

    const readBuf = new Buffer(6);
    fs.read(fd, readBuf, 0, readBuf.length, 0, (err, bytesRead) => {
      if(err) return reject(err);
      const currentVersion = (bytesRead > 0?readBuf.readUIntLE(0, bytesRead):1);
      const nextVersion = currentVersion+1;

      const writeBuf = new Buffer(6);
      writeBuf.writeUIntLE(nextVersion, 0, 6);
      fs.write(fd, writeBuf, 0, 6, (err, written) => {
        if(err) return reject(err);
        fs.close(fd, err=>{
          if(err) return reject(err);
          resolve(currentVersion);
        });
      });
    });
  });
}

FileEventPersistence.prototype.storeEvent = function (event) {
  return new Promise((resolve, reject) => {

    fs.open(this.eventFilePath, 'a', (err, fd) =>{
      if(err) return reject(err);

      const eventBuffer = new Buffer(JSON.stringify(event)+'\n');
      fs.write(fd, eventBuffer, 0, eventBuffer.length, err => {
        if(err) return reject(err);
        fs.close(fd, err=>{
          if(err) return reject(err);
          resolve();
        });
      });
    });
  });
};

FileEventPersistence.prototype.forEach = function(cb) {
  var count = 0;
  var prevEvent = null;
  return new Promise((resolve, reject) => {
    fs.createReadStream(this.eventFilePath)
      .pipe(ndjson.parse())
      .on('data', event => {
        //console.log('event:', event);
        if(prevEvent) {
          cb({
            index: count++,
            event: prevEvent,
            hasMore: true
          });
        }
        prevEvent = event;
      })
      .on('err', reject)
      .on('end', ()=>{
        if(prevEvent) cb({
          index: count++,
          event: prevEvent,
          hasMore: false
        });
        resolve();
      });
  });
};
