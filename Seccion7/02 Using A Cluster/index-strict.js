/*
*** Primary file for API
*/

// Dependencies
var server  = require('./lib/server')
var workers = require('./lib/workers')
var cli     = require('./lib/cli')

// Declare the app
var app     = {}

/* Declare a global ( That strict mode sould catch ) */
/*
  Ejecutamos el comando:
    node --use_strict index-strict.js

    y nos va a marcar error por que
    foo         = 'bar'       --- Esto marca error por que no tiene la palabra clave var.
    var foo     = 'bar'       --- OK

*/
foo         = 'bar'

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

}

// Self executing
app.init()

// Export the app
module.exports = app
