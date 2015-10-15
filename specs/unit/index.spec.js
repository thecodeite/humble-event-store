const chai = require('chai');
const should = chai.should();

const index = require('../../src/index.js');

describe('index', ()=>{

  it('should have EventStore', ()=>{
    should.exist(index.EventStore);
  });

  it('should have MemoryObjectStore', ()=>{
    should.exist(index.MemoryObjectStore);
  });

  it('should have MemoryEventPersistence', ()=>{
    should.exist(index.MemoryEventPersistence);
  });

  it('should have createEventProjection', ()=>{
    should.exist(index.createEventProjection);
  });

  it('should have FileEventPersistence', ()=>{
    should.exist(index.FileEventPersistence);
  });

  it('should have FileObjectStore', ()=>{
    should.exist(index.FileObjectStore);
  });

});
