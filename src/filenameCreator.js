module.exports = idToPathSafe;

module.exports.idToPathSafe = idToPathSafe;
module.exports.toSafe = toSafe;
module.exports.isSafeChar = isSafeChar;

function idToPathSafe(id) {
  if(typeof(id) !== 'string' && typeof(id) !== 'number')
    throw new Error('Id passed to idToPathSafe can only be a string or a number. Was passed: '+typeof(id) );

  return (id+'').split('')
    .map(c => isSafeChar(c) ? c : toSafe(c))
    .join('');
}

function toSafe(c) {
  return '+' + c.charCodeAt(0).toString(16);
}

function isSafeChar(c) {
  return (c >='a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    (c >= '0' && c <= '9');
}
