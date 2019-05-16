/*
**** Primary file for API
*/

// Dependencies
var mathLib   = require('./lib/math')
var loveLib   = require('./lib/love')
var cluster   = require('cluster')
var os        = require('os')

// Declare the app
var app       = {}

// Creamos objeto de Configuration de la App
// We create this object for the setup of the app
app.config = {
  titulo            : "The Love App",
  'timeBetweenLove' : 2000
}

// Function that prints a random love
app.printAllTheLove = () => {
  var all_Love      = loveLib.all_Love()                          // Get all the love
  var numberOflove  = all_Love.length                             // Get the length of the love
  var randomNumber  = mathLib.getRandomNumber(1, numberOflove)    // Pick a random number between 1 and the number of jokes
  var selected_Love = all_Love[randomNumber - 1]                  // Get the love at that position in the array (minus one)

  console.log('\n\t' + selected_Love) // Send the love phrases to the console
  return selected_Love
}

// Function that loops indefinitely, calling the printAllTheLove function as it goes
app.indefiniteLoop = function () {
  console.log('\t\t[\x1b[33m\x1b[5m L O O P \x1b[0m]')
  // Create the interval, using the config variable defined above
  setInterval(app.printAllTheLove, app.config.timeBetweenLove)
}

// Init function
app.init = function (callback) {
  console.log('\x1Bc') // <- Clear the screen!.
  /* console.log('\n\t\x1b[32mCPU´s: \x1b[33m\x1b[5m%o\x1b[0m\n', os.cpus()) */

  if (os.type() == "Darwin" ) {
    console.log('\nType OS: \x1b[33m\x1b[5mMac OS\x1b[0m\n\n')
    /* app.printAllTheLove() */
  } else {
    console.log('\nType OS: \x1b[33m\x1b[5m%s\x1b[0m\n\n',os.type())
  }

  /* Logic for every cpu */
  os.cpus().forEach((procesador) => {
    app.printAllTheLove()
    /* console.table(procesador) */ // <- Print the processor info in table format.

    // <-
    console.log('\n\tCPU Model: %s \tSpeed: %s \n\t\t%o\n', procesador.model ,procesador.speed, procesador.times )
  })

  // If We're on the master thread, start the background indefiniteLoop function and the CLI.
  if (cluster.isMaster) {
    console.log('\n\n\t*************************** We are on the \x1b[33m\x1b[5mMASTER Thread\x1b[0m***************************\n')

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
      // Invoke the loop
      app.indefiniteLoop()
      callback()
    }, 50)
    // Fork the process
    for ( var i = 0 ; i < os.cpus().length ; i++ ) {
      cluster.fork()
    }
  } else {
    // We're NOT on the master thread
    console.log('\n\nWe are \x1b[33m\x1b[5mNOT\x1b[0m on the master thread, but, anyway!, here is the love for you... \x1b[33m\x1b[5mEnjoy it!\x1b[0m\n')
    /* app.printAllTheLove() */
  }
}

// Self invoking only if required directly.
if ( require.main === module ) {
  app.init(() => {}) // Le pasamos un callback que no hace nada para respetar su firma
}

// Export the app
module.exports = app

/*
  thats it!!!, simple!!!!
*/
