const chai = require('chai');
chai.should();
const sinon = require('sinon');

const MemoryEventPersistence = require('../../src/MemoryEventPersistence');


describe('MemoryEventPersistence object', ()=> {
  it('should allow storing of event', done => {
    const mep = new MemoryEventPersistence();

    mep.storeEvent({id: 1})
      .then(() => mep.storeEvent({id: 2}))
      .then(() => mep.storeEvent({id: 3}))
      .then(() => {
        mep.events.should.deep.equal([{id: 1}, {id: 2}, {id: 3}]);
        done();
      })
      .catch(done);
  });

  it('should allow replay of event', done => {
    const mep = new MemoryEventPersistence();
    const spy = sinon.spy();

    mep.storeEvent({id: 'alpha'})
      .then(() => mep.storeEvent({id: 'bravo'}))
      .then(() => mep.storeEvent({id: 'charlie'}))
      .then(() => mep.forEach(spy))
      .then(() => {
        sinon.assert.calledThrice(spy);
        sinon.assert.calledWith(spy, sinon.match.has('event', sinon.match.has('id', 'alpha')));
        sinon.assert.calledWith(spy, sinon.match.has('event', sinon.match.has('id', 'bravo')));
        sinon.assert.calledWith(spy, sinon.match.has('event', sinon.match.has('id', 'charlie')));
        done();
      })
      .catch(done);
  });

  it('should identify last event of replay', done => {
    const mep = new MemoryEventPersistence();
    const spy = sinon.spy();

    mep.storeEvent({id: 'alpha'})
      .then(() => mep.storeEvent({id: 'bravo'}))
      .then(() => mep.storeEvent({id: 'charlie'}))
      .then(() => mep.forEach(spy))
      .then(() => {
        sinon.assert.calledThrice(spy);
        const call = spy.getCall(2).args[0];
        call.index.should.equal(2);
        call.event.id.should.equal('charlie');
        call.hasMore.should.equal(false);

        done();
      })
      .catch(done);
  });
});
