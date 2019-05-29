/*
*** Primary file for API
*/

// Dependencies
var server  = require('./lib/server')
var workers = require('./lib/workers')
var cli     = require('./lib/cli')

var cluster = require('cluster')
var os      = require('os')

// Declare the app
var app     = {}

// Init function
app.init = function (callback) {
  console.log('\x1Bc')
  /* console.log('\n\t\x1b[32mCPU´s: \x1b[33m\x1b[5m%o\x1b[0m\n', os.cpus()) */

  if (os.type() == "Darwin" ) {
    console.log('\nType OS: \x1b[33m\x1b[5mMac OS\x1b[0m\n')
  }

  os.cpus().forEach((procesador) => {
    console.log('\tCPU Model: %s \tSpeed: %s \n\t\t%o\n', procesador.model ,procesador.speed, procesador.times )
  })

  // If We're on the master thread, start the background workers and the CLI.
  if (cluster.isMaster) {
    // Start the workers
    workers.init()

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
      cli.init()
      callback()
    }, 50)

    // Fork the process
    for ( var i = 0 ; i < os.cpus().length ; i++ ) {
      cluster.fork()
    }

  } else {

    // If we're not on the master thread, start the HTTP server
    server.init()
  }




}

// Self invoking only if required directly.
if ( require.main === module ) {
  app.init(() => {}) // Le pasamos un callback que no hace nada para respetar su firma
}

// Export the app
module.exports = app
