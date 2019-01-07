// Dependencies
var fs = require('fs');

// App object
var love = {};

// Obtenemos todo las frases y se las devolvemos al usuario.
love.all_Love = function() {

    //Leemos el contenido del archivo love.txt
    var fileContents = fs.readFileSync(__dirname+'/love.txt', 'utf8');

    // Convierte el string en un array de strings.
    var arrayOflove = fileContents.split(/\r?\n/);

    // Regresamos el arreglo
    return arrayOflove;

};

// Exportamos la Libreria
module.exports = love;




