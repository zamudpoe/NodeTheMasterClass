
// Dependencies
var appHelpers = require('./../app/lib')
var assert     = require('assert')

// Application logic for the test runner.
var _app       = {}

/* itIsAPalindrome should return true */
_app.tests.unit['appHelpers.itIsAPalindrome should return true'] =  (done) => {
  var val = appHelpers.itIsAPalindrome('seres')
  assert.equal(val, true)
  done()
}

/** Assert that the itIsbisiesto is returning true if is a leap year! */
_app.tests.unit['appHelpers.itIsbisiesto should return boolean'] =  (done) => {
  var val = appHelpers.itIsbisiesto(2016)
  assert.equal(typeof (val), 'boolean')
  done()
}

/** Assert that the itIsbisiesto is returning true if is a leap year! */
_app.tests.unit['appHelpers.itIsbisiesto should return true'] =  (done) => {
  var val = appHelpers.itIsbisiesto(2016)
  assert.equal(val, true)
  done()
}

/** Assert that the getANumber is returning a number */
_app.tests.unit['helpers.getANumber should return a number'] =  (done) => {
  var val = appHelpers.getANumber()
  assert.equal(typeof (val), 'number')
  done()
}

/** Assert that the getANumber is returning a 1 */
_app.tests.unit['helpers.getANumber should return 1'] =  (done) => {
  var val = appHelpers.getANumber()
  assert.equal(val, 1)
  done()
}

/** Assert that the getANumber is returning a 1 */
/* _app.tests.unit['helpers.getANumber should return 2'] =  (done) => {
  var val = appHelpers.getANumber()
  assert.equal(val, 2)
  done()
} */

// Export the module
module.exports = _app
