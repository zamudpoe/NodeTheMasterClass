/*
  * * *       Primary File       * * *
*/

// Declare the app
var app     = {}

// Init function
app.init = function (callback) {
  // Start the CLI, but make sure it starts last
  setTimeout(() => {
    var appTest = require('./test/index')
    callback
  }, 50)
}

// Self invoking only if required directly.
if ( require.main === module ) {
  app.init(() => {})
}

// Export the app
module.exports = app
