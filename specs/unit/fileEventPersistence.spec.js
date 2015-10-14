const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
chai.should();


const FileEventPersistence = require('../../src/fileEventPersistence');

describe('FileEventPersistence object', ()=> {
  var fep;
  const versionFilePath = './version.bin';
  const eventsFilePath = './events.ndjson';

  beforeEach(()=>{
    try { fs.unlinkSync(versionFilePath); } catch(ex){}
    try { fs.unlinkSync(eventsFilePath); } catch(ex){}
    fep = new FileEventPersistence(versionFilePath, eventsFilePath);
  });

  it('should give sequential version numbers', done => {
    var first=0, second=0, third=0;

    fep.nextVersion()
      .then(v => { first = v; return fep.nextVersion();})
      .then(v => { second = v; return fep.nextVersion();})
      .then(v => {
        third = v;

        first.should.eq(1);
        second.should.eq(2);
        third.should.eq(3);

        done();
      })
      .catch(done);
  });

  it('should resolve sequentially', done => {
    var first=0, second=0, third=0;

    fep.nextVersion().then(v => first = v).catch(done);
    fep.nextVersion().then(v => second = v).catch(done);
    fep.nextVersion().then(v => third = v).catch(done);

    fep.nextVersion().then(fourth=> {

      first.should.eq(1);
      second.should.eq(2);
      third.should.eq(3);
      fourth.should.eq(4);
      done();
    }).catch(done);

  });

  it('should allow storing of event', done => {

    fep.storeEvent({id: 1})
      .then(() => fep.storeEvent({id: 2}))
      .then(() => fep.storeEvent({id: 3}))
      .then(() => {
        const fileContent = fs.readFileSync(eventsFilePath, {encoding: 'utf8'});

        fileContent.should.eq(`{"id":1}
{"id":2}
{"id":3}
`);
        done();
      })
      .catch(done);
  });

  it('should allow replay of event', done => {
    const spy = sinon.spy();

    fep.storeEvent({id: 'alpha'})
      .then(() => fep.storeEvent({id: 'bravo'}))
      .then(() => fep.storeEvent({id: 'charlie'}))
      .then(() => fep.forEach(spy))
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

    const spy = sinon.spy();

    fep.storeEvent({id: 'alpha'})
      .then(() => fep.storeEvent({id: 'bravo'}))
      .then(() => fep.storeEvent({id: 'charlie'}))
      .then(() => fep.forEach(spy))
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
