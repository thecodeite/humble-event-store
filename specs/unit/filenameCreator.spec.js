const chai = require('chai');
chai.should();

const filenameCreator = require('../../src/filenameCreator');

describe('filenameCreator', () => {

  it('should ignore safe chars', () => {
    const id = 'simpleId';
    const safe = filenameCreator.idToPathSafe(id);
    safe.should.eq('simpleId');
  });

  it('should accept numbers', () => {
    const id = 123;
    const safe = filenameCreator.idToPathSafe(id);
    safe.should.eq('123');
  });

  it('should replace spaces', () => {
    const id = 'two words';
    const safe = filenameCreator.idToPathSafe(id);
    safe.should.eq('two+20words');
  });

  it('should replace unsafe path chars', () => {
    const id = 'two/words';
    const safe = filenameCreator.idToPathSafe(id);
    safe.should.eq('two+2fwords');
  });

  it('should replace emoji', () => {
    const id = 'happy😀face';
    const safe = filenameCreator.idToPathSafe(id);
    safe.should.eq('happy+d83d+de00face');
  });
});
