// Dependencies
var fs = require('fs');

// App object
var love = {};

// Obtenemos todo las frases y se las devolvemos al usuario.
// We get the love phrases and return it to the user
love.all_Love = function() {

    //Leemos el contenido del archivo love.txt
    // Read the content of the love.txt
    var fileContents = fs.readFileSync(__dirname+'/love.txt', 'utf8');

    // Convierte el string en un array de strings.
    // Convertion to String Array
    var arrayOflove = fileContents.split(/\r?\n/);

    // Regresamos el arreglo
    // Return the Array
    return arrayOflove;

};

// Exportamos la Libreria
// Export the love library
module.exports = love;




