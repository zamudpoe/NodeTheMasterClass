// Dependencies
var fs = require('fs')

// App object
var jokes = {}

// Obtenemos todo las frases y se las devolvemos al usuario.
jokes.all_Jokes = function () {
  var fileContents = fs.readFileSync(__dirname+'/joke.txt', 'utf8')
  var arrayOfJokes = fileContents.split(/\r?\n/)

  return arrayOfJokes
}

// Exportamos la Libreria
module.exports = jokes




