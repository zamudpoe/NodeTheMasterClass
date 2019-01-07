/*
  ENTRY POINT PRINCIPAL
*/

// 01 Dependencies
var mathLib = require('./lib/math')
var loveLib = require('./lib/love')

// 02 Ceaamos el objeto de la  App
var app = {}

// 03 Creamos objeto de Configuration de la App
app.config = {
  titulo           : "La Aplicacion del Amor",
  'timeBetweenLove': 2000
}

// 04 Function that prints a random love
app.printAllTheLove = function() {
  var all_Love      = loveLib.all_Love()                       // Get all the love
  var numberOflove  = all_Love.length                          // Get the length of the love
  var randomNumber  = mathLib.getRandomNumber(1, numberOflove) // Pick a random number between 1 and the number of jokes
  var selected_Love = all_Love[randomNumber - 1]               // Get the love at that position in the array (minus one)

  console.log('\n' + selected_Love) // Send the love to the console
}

// Function that loops indefinitely, calling the printAJoke function as it goes
app.indefiniteLoop = function () {
  // Create the interval, using the config variable defined above
  setInterval(app.printAllTheLove, app.config.timeBetweenLove)
}

// Invoke the loop
app.indefiniteLoop()
