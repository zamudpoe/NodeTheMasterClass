

var helpers = {}

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
};

// creacion de token id nuevo
var tokenId     = helpers.createRandomString(20)
var expires     = Date.now() + 1000 * 60 * 60
expires
