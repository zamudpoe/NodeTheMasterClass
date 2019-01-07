/*
 * Primary file for API
 * Returning JSON
 *
*/
// Dependencies
var http          = require('http');
var url           = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config        = require('./config'); /** Objeto de configuracion */

// Configure the server to respond to all requests with a string
var server = http.createServer(function ( req, res) {
  // Parse the url
  var parsedUrl         = url.parse(req.url, true);
  // Get the path
  var path              = parsedUrl.pathname;
  //               Le quitamos al path las '/'
  var trimmedPath       = path.replace(/^\/+|\/+$/g, '');
  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  // Get the HTTP method
  var method            = req.method.toLowerCase();
  //Get the headers as an object
  var headers           = req.headers;
  // Get the payload,if any
  var decoder           = new StringDecoder('utf-8');
  var buffer            = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  /** req.on se llama con cada request */
  req.on('end', function() {
    buffer += decoder.end();

    /* Escogemos el handler o funcion donde la soolicitud debera ir, Si no se encuentra, usaremos el handler 'notFound' */
    var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    /* Construimos el objeto data que enviaremos al Handler */
    var data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : buffer
    }

    /* Enrutamos la solicitud al Handler especifico en el enrutador */
    choosenHandler (data, function (statusCode, payload) {

      // Si es un numero usamos el 'status code' retornado por el handler, ó configuramos el status code a 200
      statusCode = ( typeof(statusCode) == 'number' ) ? statusCode : 404;

      // Si el payload retornado por el handler es un objeto lo usaremos tal cual nos los entrega,
      // de lo contrario controlamos el error a nuestro antojo!.
      payload = typeof(payload) == 'object'? payload : {'razon': 'Ruta solicitada inexistente!'};

      // Convertimos el payload a un string
      var payloadString = JSON.stringify(payload);

      // Enviamos la RESPUESTA
      /* res.setHeader('Content-Type', 'application/json');  */  /* Le decimos al navegador que enviaremos JSON MYME 'application/json' 'text/html', 'text/plain' */
      /* res.writeHead(statusCode);  */   // Mandamos el Status Code al header de respuesta
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(payloadString);       // Mandamos el objeto convertido en String como respuesta.

      /* console.log('%s', trimmedPath) */
      console.log("\nSolicitud Recibida: \n\tstatusCode : %s \n\tPayload: %o ", statusCode, payloadString); // mensaje a la consola de Node.JS
    })
  });
});

// Start the server
server.listen( config.port , function() {
  /* console.log('Servidor listo en el puerto [%s]', port); */
  console.log('Servidor listo en el puerto %s en modo %s', config.port , config.envName );
});

/*                      M A N E J A D O R E S    Y    R U T A S                     */
/* Define the Handlers Object */
var handlers = {}

/* Sample handlers */
handlers.sample = function (data, callback) {
  /* Callback a http status code , and a payload object */
  callback(206, {'name':'Sample handler'});
}

/* Cydsa handlers */
handlers.cydsa = function (data, callback) {
  /* Callback a http status code , and a payload object */
  callback(206, {'name':'Cydsa handler'});
}

/* Cobranza handlers */
/* handler personalizado por mi MSInputMethodContext, para manejar un callback distinto para cada metodo GET o POST */
handlers.cobranza = function (data, callback) {
  var method = data.method
  var body = "[POST] " + data.payload

  method !== 'get' ? callback(206, {'name': body }) : callback(206, {'name':'Cobranza handler GET'});
}

/* NOT found handlers */
handlers.notFound = function (data, callback){
  callback('404');
}

/* Define a Request Router */
var router = {
  'sample'  : handlers.sample,
  'cydsa'   : handlers.cydsa,
  'cobranza': handlers.cobranza
}

/**
 * Agregando configuracion
 *  01 creamos archivo de configuracion 'config.js'
 *  02 Lo importamos
 *     var config        = require('./config');
 *  03 Usamos el objeto 'config'
 *     config.port  para el puerto
 *     config.envName para el nombre del ambiente "desarrollo" o "produccion"
 *  04 pasamos las variables de configuracion dede el CLI
 *     NODE_ENV=desarrollo node index.js
*/
