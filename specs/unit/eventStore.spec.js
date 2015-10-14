const chai = require('chai');
chai.should();
const sinon = require('sinon');

const MemoryEventPersistence = require('../../src/MemoryEventPersistence');
const EventStore = require('../../src/EventStore');

describe('EventStore', ()=> {
  describe('EventStore creation', ()=> {
    describe('should expect EventPersistence object to have relevent methods', () => {

      var fakeEventPersistance;
      beforeEach(() => {
        fakeEventPersistance = {
          nextVersion: ()=>null,
          storeEvent: ()=>null,
          forEach: ()=>null,
        };
      });

      it('should have a nextVersion method', ()=> {
        delete fakeEventPersistance.nextVersion;
        eventStoreCreate = () => new EventStore('test', fakeEventPersistance);
        eventStoreCreate.should.throw(Error, /nextVersion/);
      });

      it('should have a storeEvent method', ()=> {
        delete fakeEventPersistance.storeEvent;
        eventStoreCreate = () => new EventStore('test', fakeEventPersistance);
        eventStoreCreate.should.throw(Error, /storeEvent/);
      });

      it('should have a forEach method', ()=> {
        delete fakeEventPersistance.forEach;
        eventStoreCreate = () => new EventStore('test', fakeEventPersistance);
        eventStoreCreate.should.throw(Error, /forEach/);
      });
    });
  });

  describe('EventStore object', ()=> {

    var spy;
    var eventStore;
    var endTracker;

    beforeEach(() => {
      spy = sinon.spy();
      eventStore = new EventStore('test', new MemoryEventPersistence());
      endTracker = eventStore.getTracker();
    });

    it('should allow registration of a tracking id', done => {
      eventStore.logEvent('0', 'testEvent', {}, endTracker);

      eventStore.on(endTracker, () => done());
    });

    it('should emit event when an event is logged', done => {

      eventStore.on('eventAdded', spy);

      eventStore.logEvent('123', 'testEvent', {}, endTracker);

      eventStore.on(endTracker, () => {
        sinon.assert.calledOnce(spy);
        sinon.assert.calledWith(spy, sinon.match.has('event', sinon.match.has('id', '123')));
        done();
      });
    });

    it('should emit all events again when replay is triggered', done => {
      const tracker = eventStore.getTracker();
      eventStore.on('eventAdded', spy);

      eventStore.logEvent('456', 'testEvent', {}, tracker);
      eventStore.on(tracker, () => eventStore.replay(endTracker));

      eventStore.on(endTracker, () => {
        sinon.assert.calledTwice(spy);
        sinon.assert.calledWith(spy, sinon.match.has('event', sinon.match.has('id', '456')));
        done();
      });
    });
  });
});
