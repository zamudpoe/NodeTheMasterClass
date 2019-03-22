/*
**  Test Runner
*/

var helpers = require('../lib/helpers')
var assert = require('assert')


/** Application Logic for the test runner */
_app = {}


/** Container for the tests */
_app.tests = {
  'unit' : {}

}

/** Assert that the getANumber is returning a number */
_app.tests.unit['helpers.getANumber should return a number'] = function (done) {
  var val = helpers.getANumber()
  assert.equal(typeof (val), 'number')
  done()
}

/** Assert that the getANumber is returning a 1 */
_app.tests.unit['helpers.getANumber should return 1'] = function (done) {
  var val = helpers.getANumber()
  assert.equal(val, 1)
  done()
}

/** Assert that the getANumber is returning a 2 */
_app.tests.unit['helpers.getANumber should return 2'] = function (done) {
  var val = helpers.getANumber()
  assert.equal(val, 2)
  done()
}

// Count all the tests
_app.countTests = function () {
  var counter = 0

  for (var key in _app.tests) {
    if ( _app.tests.hasOwnProperty(key) ) {
      var subTests = _app.tests[key]

      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++
        }
      }

    }
  }
  return counter
}

/** Run all the tests, collecting the errors and successes */
_app.runTests = function () {
  var errors    = []
  var successes = 0
  var limit     = _app.countTests()
  var counter   = 0

  console.log('\x1Bc')

  for (var key in _app.tests) {
    console.log("\n\t\x1b[31m\x1b[5m%s\x1b[0m\n",key.toUpperCase())
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key]

      for (var testName in subTests) {

        /* console.log("\n\t\x1b[33m\x1b[5m%s\x1b[0m\n", testName) */
        if (subTests.hasOwnProperty(testName)) {
          (function () {
            var tmpTestName = testName
            var testValue   = subTests[testName]
            // Call the test
            try {
              testValue (function () {
                // If it calls back without throwing, then it succeeded , so log it in green.
                console.log('\t\x1b[32m%s\x1b[0m', tmpTestName)
                counter++
                successes++
                if ( counter == limit ) {
                  _app.produceTestReport (limit, successes, errors)
                }

              })
            } catch (e) {
              // If it throws, then it failed, so capture the error thrown and log it in red
              errors.push({
                'name'  : testName,
                'error' : e
              })
              console.log("\n\t\x1b[31m\x1b[5m%s\x1b[0m\n", errors[0].name)
              /* console.table(errors) */
              counter++
              if (counter == limit ) {
                _app.produceTestReport (limit, successes, errors)
              }
            }

          })()
        }
      }

    }
  }

}

// Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
  /* console.log(limit, successes, errors) */
  console.log('\n\x1b[35m----------------------------------[ \x1b[36m\x1b[5mBEGIN TEST REPORT \x1b[0m\x1b[35m]----------------------------------\x1b[0m\n')

  console.log('\x1b[36mTotal Tests : \x1b[33m%s\x1b[0m', limit)
  console.log('\x1b[36mPass        : \x1b[33m%s\x1b[0m', successes)
  console.log('\x1b[36mFail        : \x1b[33m%s\x1b[0m', errors.length)
  /* console.log('\x1b[36m\n\tDetail Error Info : %o\x1b[0m\n', errors) */


  /*
  if ( errors[0].error.generatedMessage ) {
    console.log('\n\x1b[36m\tgeneratedMessage  : \x1b[31m%s\x1b[0m', errors[0].error.generatedMessage)
    console.log('\x1b[36m\n\tDescription Error : \x1b[31m%s\x1b[0m', errors[0].name)
    console.log('\x1b[36m\tAssertionError    : \x1b[31m%s\x1b[0m', errors[0].error)
    console.log('\x1b[36m\tStack Info        : \x1b[31m%o\x1b[0m', errors[0].error['stack'])
    console.log('\x1b[36m\tMessage Info      : \x1b[31m%s\x1b[0m', errors[0].error['message'])
  }
  */

  if ( errors.length > 0 ) {
    errors.forEach( (testError) => {
      console.log('\x1b[33m\n\tDescription: \x1b[36m%s\x1b[0m', testError.name)
      console.log('\x1b[33m\n\tError Detail Info : \x1b[36m%s\x1b[0m', testError.error)
      console.log('\x1b[33m\n\tStack Detail Info : \x1b[36m%o\x1b[0m', testError.error['stack'])
      console.log('\x1b[33m\n\tMessage : \x1b[36m%o\x1b[0m', testError.error['message'])
    })
  }

  console.log('\n\x1b[35m----------------------------------[ \x1b[36m\x1b[5mEND TEST REPORT \x1b[0m\x1b[35m]----------------------------------\x1b[0m\n')

}

/** Run the test */
_app.runTests()


