
/*
*** Unit Tests
*/

var helpers                 = require('../lib/helpers')
var assert                  = require('assert')
var logs                    = require('./../lib/logs')
var exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem')

var unit = {}

/** Assert that the getANumber is returning a number */
unit['helpers.getANumber should return a number'] = function (done) {
  var val = helpers.getANumber()
  assert.equal(typeof (val), 'number')
  done()
}

/** Assert that the getANumber is returning a 1 */
unit['helpers.getANumber should return 1'] = (done) => {
  var val = helpers.getANumber()
  assert.equal(val, 1)
  done()
}

/** Assert that the getANumber is returning a 2 */
unit['helpers.getANumber should return 2'] = function (done) {
  var val = helpers.getANumber()
  var message = val + ' != 2'

  assert.equal(val, 2, message)
  done()
}

// Logs.list should callback an array and a false error.
unit['logs.list should callback a false error and an array of log names'] = (callback) => {
  logs.list(true, function (err, logFilenames) {
    assert.equal(err, false)
    assert.ok(logFilenames instanceof Array)
    assert.ok(logFilenames.length > 1)
    callback()
  })
}

// logs.truncate should not throw if the logId doesnt exist.
unit['logs.truncate should not throw if the logId doesnt exist. it should callback an error instead!'] = (callback) => {
  assert.doesNotThrow(() => {
    logs.truncate('I do not exist', (err) => {
      assert.ok(err)
      callback()
    })
  }, TypeError)
}

// exampleDebuggingProblem.init should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = (callback) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init()
    callback()
  }, TypeError)
}

// Export the module
module.exports = unit

