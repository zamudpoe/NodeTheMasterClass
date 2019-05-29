/*
 * Primary file for API
*/

// Dependencies
var server                  = require('./lib/server')
var workers                 = require('./lib/workers')
var cli                     = require('./lib/cli')

var exampleDebuggingProblem = require('./lib/exampleDebuggingProblem')

// Declare the app
var app                     = {}

// Init function
app.init = function () {

  // Start the server
  server.init()

  // Start the workers
  workers.init()

  // Start the CLI, but make sure it starts last
  setTimeout(function () {
    cli.init()
  }, 50)

  // st foo to 1
  var foo = 1
  debugger
  // Increment foo
  foo++
  debugger

  // Square foo
  foo = foo * foo
  debugger

  // convert foo to string.
  foo = foo.toString()
  debugger

  // Call the init script that will throw
  exampleDebuggingProblem.init()

}

// Self executing
app.init()

// Export the app
module.exports = app
