/**
**** API Tests
**/
let app     = require('./../index')
let assert  = require('assert')
let http    = require('http')
let config  = require('./../lib/config')
let helpers = require('./../lib/helpers')

// Holder for the test.
var api     = {}

// Helpers
helpers.makeGetRequest = (path, callback) => {
  // Configure the request details
  let requestDetail = {
    'protocol'      : 'http',
    'hostname'      : 'localhost',
    'port'          : config.httpPort,
    'method'        : 'GET',
    'path'          : path,
    'headers'       : {
      'Content-Type': 'application/json'
    }
  }
  var req = http.request(requestDetail, function (res) {
    callback(res)
  })
  req.end()
}

// The mai n init() function should be able to run without throwing
api['app.init should start without throwing'] = function (done) {

  assert.doesNotThrow(
    () => {
      app.init( (err) => {
        console.dir(config, {'colors': true})
        done()
      })
    }, TypeError)

}

// MAKE a request to /ping
api['/ping should respond to GET request with 200'] = (done) => {
  helpers.makeGetRequest('/ping', (res) => {
    assert.equal(res.statusCode , 200)
    done()
  })
}

// MAKE a request to /api/users
api['/api/users should respond to GET request with 400'] = (done) => {
  helpers.makeGetRequest('/api/users', (res) => {
    assert.equal(res.statusCode , 400)
    done()
  })
}

// MAKE a request to a random path
api['A random path should respond to GET request with 404'] = (done) => {
  helpers.makeGetRequest('/this/path/should/exist', (res) => {
    assert.equal(res.statusCode, 404)
    done()
  })
}

// Export the tests to the runner
module.exports = api




