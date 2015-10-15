const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const fs = require('fs');

const should = chai.should();
chai.use(chaiAsPromised);

const FileObjectStore = require('../../src/FileObjectStore');

describe('FileObjectStore object', ()=> {
  var fos;
  const objectFolder = './object-store';

  beforeEach(()=>{
    try { fs.mkdirSync(objectFolder); } catch(ex){}
    //try { fs.unlinkSync(eventsFilePath); } catch(ex){}
    fos = new FileObjectStore(objectFolder);
  });

  it('should allow storing of object', done => {

    fos.set('alpha', {id: 'alpha', name:'Cheese', zits:[1,2,3]})
      .then(() => {
        const filePath = './object-store/alpha.json';
        const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});

        fileContent.should.eq(`{"id":"alpha","name":"Cheese","zits":[1,2,3]}`);
        done();
      })
      .catch(done);
  });

  it('should allow retrival of object', () => {
    const filePath = './object-store/beta.json';
    const fileContent = '{"id":"beta","name":"yogurt"}';
    fs.writeFileSync(filePath, fileContent, 'utf8');

    const beta = fos.getById('beta');
    return beta.should.eventually.deep.eq({id:"beta", name:"yogurt"});
  });

  it('should allow set and get of object', done => {
    const sampleObject = {id:"gamma", name:"cream"};

    fos.set(sampleObject.id, sampleObject)
      .then(()=>fos.getById(sampleObject.id))
      .then(object => {
        object.should.deep.eq({id:"gamma", name:"cream"});
        done();
      })
      .catch(done);
  });

  it('should allow retrival of non-existant objects', () => {
    const sampleObject = {id:"gamma", name:"cream"};
    const omega = fos.getById('omega');
    return omega.should.eventually.eq(null);
  });
});
