const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const sinon = require('sinon');

chai.use(chaiAsPromised);
chai.should();

const EventStore = require('../../src/EventStore');
const MemoryObjectStore = require('../../src/MemoryObjectStore');
const MemoryEventPersistence = require('../../src/MemoryEventPersistence');
const createEventProjection = require('../../src/EventProjection');

describe('EventProjection object', ()=>{

  var eventStore;
  var memoryObjectStore;
  var projection;

  beforeEach(() => {
    eventStore = new EventStore('test', new MemoryEventPersistence());
    memoryObjectStore = new MemoryObjectStore();
    projection = createEventProjection('projection', eventStore, memoryObjectStore);
  });

  it('should keep a record of all events', done=>{

    const tracker = eventStore.getTracker();

    eventStore.logEvent('55', 'testEvent1', {});
    eventStore.logEvent('55', 'testEvent2', {});
    eventStore.logEvent('55', 'testEvent3', {}, tracker);

    projection.on(tracker, ()=>{
      projection.currentVersion.should.eq(3);
      done();
    });
  });

  it('should ignore old events', done=>{
    var assertCount = 0;
    const spy = sinon.spy();
    const endTracker = eventStore.getTracker();

    eventStore.emit('eventAdded', {event: {id: '55', version: 1}, tracker: 'a'});
    eventStore.emit('eventAdded', {event: {id: '55', version: 2}, tracker: 'b'});
    eventStore.emit('eventAdded', {event: {id: '55', version: 1}, tracker: 'c'});

    projection.on('a', ()=>{projection.currentVersion.should.eq(1); assertCount++;});
    projection.on('b', ()=>{projection.currentVersion.should.eq(2); assertCount++;});
    projection.on('c', ()=>{projection.currentVersion.should.eq(2); assertCount++;});

    eventStore.emit('eventAdded', {event: {id: '55', version: 3}, tracker: endTracker});

    projection.on(endTracker, ()=>{
      projection.currentVersion.should.eq(3);
      assertCount.should.equal(3);
      done();
    });
  });

  it('should create given relevent events', done=>{
    const createEventName = 'create';
    const id = '55';
    const endTracker = eventStore.getTracker();

    projection.addHook(createEventName, projection.defaultStoreAction);
    eventStore.logEvent(id, createEventName, {name: 'My Testify'}, endTracker);

    projection.on(endTracker, entity => {
      entity.should.deep.equal({
        id: id,
        name: 'My Testify'
      });
      done();
    });
  });

  it('should update given relevent events', done=>{
    const createEventName = 'create';
    const updateEventName = 'update';
    const id = '55';
    const endTracker = eventStore.getTracker();


    projection.addHook(createEventName, projection.defaultStoreAction);
    projection.addHook(updateEventName, projection.defaultStoreAction);
    eventStore.logEvent(id, createEventName, {name: 'Miss Testify', age: 25});
    eventStore.logEvent(id, updateEventName, {name: 'Mrs Testify'}, endTracker);

    projection.on(endTracker, entity => {
      entity.should.deep.equal({
        id: id,
        name: 'Mrs Testify',
        age: 25
      });
      done();
    });
  });

  it('should know when a replay is completed', done => {
    const tracker = eventStore.getTracker();
    const id = '55';
    const createEventName = 'create';
    const endTracker = eventStore.getTracker();

    eventStore.logEvent(id, createEventName, {name: 'My Testify'}, tracker);

    projection.on(tracker, () => {
      eventStore.replay(endTracker);
    });

    projection.on(endTracker, () => {
      done();
    });
  });
});
