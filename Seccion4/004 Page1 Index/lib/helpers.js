/*
*** Helpers for various tasks .
*/

// Dependencies
var crypto      = require('crypto')
var config      = require('./config')
var https       = require('https')
var querystring = require('querystring')
var path        = require('path')
var fs          = require('fs')

// Container for all the helpers
var helpers = {}

// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}

// Parse a JSON string to an Object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str)
    return obj
  } catch(e) {
    return {}
  }
}

/* Crea una cadena de caracteres alfanumericos  de una longitud dada */
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
  if (strLength) {
    // Definimos todos lo posibles caracteres que podrian ir dentro de un string.
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    /* Comienza la cadena de caracteres final */
    var str = ''
    for (i = 1; i <= strLength; i++) {
      // Obtener un caracter aleatorio desde la cadena de caracteres 'possibleCharacters'
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))

      // Anexa y concatena este caracter a la cadena de caracteres 'str'
      str+=randomCharacter
    }
    // Retorna la cadena de caracteres str
    return str
  } else {
    return false
  }
}

// Libreria para enviar SMS
helpers.sendTwilioSms = function (phone, msg, callback) {
  // Validamos los parametros.
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg   = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

  if (phone && msg) {
    // Configuramos el payload de la solicitud
    var payload = {
      'From': config.twilio.fromPhone,
      'To'  : '+52'+phone,
      'Body': msg
    }

    var stringPayload = querystring.stringify(payload)

    // Configuramos los detalles de la solicitud.
    var requestDetails = {
      'protocol'        : 'https:',
      'hostname'        : 'api.twilio.com',
      'method'          : 'POST',
      'path'            : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth'            : config.twilio.accountSid+':'+config.twilio.authToken,
      'headers'         : {
        'Content-Type'  : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    }

    /* Instanciamos el Objeto de la Solicidud. */
    var req = https.request(requestDetails, function (res) {
        // Grab the status of the sent request
        var status =  res.statusCode
        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          callback (false) // no hay error!
        } else {
          callback ('Codigo de Status retornado fue : [ ' + status + ' ]')
        }
    })

    // Bind to the error event so it doesn't get thrown
    // Bindeamos el request a los eventos de error y ejecutar nuestra funcion para evitar que cualquier error mate el hilo del proceso.
    req.on('error', function (e) {
      callback(e)
    })

    // Add the payload
    req.write(stringPayload)

    // End the request
    req.end()

  } else {
    callback ('\n\t[ ::: T W I L I O ::: ]\n\t\tParametros proporcionados son invalidos o estan inconclusos')
  }
}

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function(templateName,data,callback){
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false
  data = typeof(data) == 'object' && data !== null ? data : {}
  if (templateName) {
    var templatesDir = path.join(__dirname,'/../templates/')
    fs.readFile(templatesDir+templateName+'.html', 'utf8', function (err, str) {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        var finalString = helpers.interpolate(str, data)
        callback (false, finalString)
      } else {
        callback ('No template could be found')
      }
    })
  } else {
    callback ('A valid template name was not specified')
  }
}

// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
  str  = typeof(str)  == 'string' && str.length > 0 ? str : ''
  data = typeof(data) == 'object' && data !== null ? data : {}

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.'+keyName] = config.templateGlobals[keyName]
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == 'string')) {
      var replace = data[key]
      var find    = '{'+key+'}'

      str = str.replace(find, replace)
    }
  }

  return str
}

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function (str, data, callback) {
  str  = typeof(str) == 'string' && str.length > 0 ? str : ''
  data = typeof(data) == 'object' && data !== null ? data : {}

  // Get the header
  helpers.getTemplate('_header',data, function (err, headerString) {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, function (err, footerString) {
        if (!err && headerString) {
          // Add them all together
          var fullString = headerString+str+footerString
          callback (false, fullString)
        } else {
          callback ('Could not find the footer template')
        }
      })
    } else {
      callback ('Could not find the header template')
    }
  })

}


// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName,callback){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    var publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, function(err,data){
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

// Export the module
module.exports = helpers
