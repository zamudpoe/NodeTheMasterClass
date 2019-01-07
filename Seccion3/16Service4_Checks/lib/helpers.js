/*
 * Helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str){
  if (typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an Object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

/* Crea una cadena de caracteres alfanumericos  de una longitud dada  */
/* USO:
  var tokenId     = helpers.createRandomString(20)
*/
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Definimos todos lo posibles caracteres que podrian ir dentro de un string.
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    /* Comienza la cadena de caracteres final */
    var str = '';
    for (i = 1; i <= strLength; i++) {
      // Obtener un caracter aleatorio desde la cadena de caracteres 'possibleCharacters'
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      // Anexa y concatena este caracter a la cadena de caracteres 'str'
      str+=randomCharacter;
    }
    // Retorna la cadena de caracteres str
    return str;
  } else {
    return false;
  }
}

// Export the module
module.exports = helpers;
