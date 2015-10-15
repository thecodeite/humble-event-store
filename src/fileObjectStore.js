module.exports = FileObjectStore;

const fs = require('fs');
const path = require('path');

const filenameCreator = require('./filenameCreator');

function FileObjectStore(objectFolder) {
  this.objectFolder = objectFolder;
}

FileObjectStore.prototype.getById = function (id) {
  return new Promise((resolve, reject) => {
    const fileName = filenameCreator(id)+'.json';
    const filePath = path.join(this.objectFolder, fileName);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if(err) {
        if(err.code == 'ENOENT') return resolve(null);
        return reject(err);
      }

      resolve(JSON.parse(data));
    });
  });
};

FileObjectStore.prototype.set = function(id, object) {
  return new Promise((resolve, reject) => {
    const fileName = filenameCreator(id)+'.json';
    const filePath = path.join(this.objectFolder, fileName);
    const data = JSON.stringify(object);

    fs.writeFile(filePath, data, 'utf8', (err) => {
      if(err) return reject(err);
      resolve();
    });
  });
};
