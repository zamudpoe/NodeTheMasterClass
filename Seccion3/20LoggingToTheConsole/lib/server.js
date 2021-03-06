// Dependencies
var http          = require('http')
var https         = require('https')
var url           = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var config        = require('./config')
var fs            = require('fs')
var handlers      = require('./handlers')
var helpers       = require('./helpers')
var path          = require('path')
var util          = require('util')
var debug         = util.debuglog('server')

console.log("\n\t: : : : : : : : :  2 0  L O G G I N G   T O   T H E  C O N S O L E  : : : : : : : : :\n")

// Instantiate the server module object
var server = {}

// @TODO GET RID OF THIS
// Metodo para probar las credenciasles de Twilio
helpers.sendTwilioSms('2281944928', 'OLA K ASE??', function (err) {
  /* console.log('\n\t[ ERROR ]', err) */
  err ?debug('\n\t[ ERROR ]', err) : console.log('\n\t[ EXITO NO HAY ERRORRES EN ENVIO DE SMS ]')
})

/* :::::::::::::::::::::::::::::::::::::::::::::[ H T T P ]::::::::::::::::::::::::::::::::::::::::::::: */
//                                                                       [ 01 Instantiate the HTTP server ]
server.httpServer = http.createServer(function (req, res) {

  server.unifiedServer(req, res)
})

//                                                                             [ 02 Start the HTTP server ]

/*
server.httpServer.once('connection', function (stream) {
	console.log('\n\n\tAh, we have our first user!\n');
})
*/

server.httpServer.on('connection', function (stream) {
  console.log('\x1b[33m%s\x1b[0m','\n\n\tW E L C O M E TO httpServer INSTANCE!')
})

/* :::::::::::::::::::::::::::::::::::::::::::::[ H T T P S ]:::::::::::::::::::::::::::::::::::::::::::: */
//                                                                       [ 01 Instantiate the HTTPS server ]
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}

//                                                                       [ 02 Instantiate the HTTPS server ]
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
  server.unifiedServer(req, res)
})

//                                                                             [ 03 Start the HTTPS server ]
// All the server logic for both the http and https server
server.unifiedServer = function (req, res) {
  //                                                   Parse the url
  var parsedUrl         = url.parse(req.url, true)
  //                                                   Get the path
  var path              = parsedUrl.pathname
  var trimmedPath       = path.replace(/^\/+|\/+$/g, '')
  //                                                   Get the query string as an object
  var queryStringObject = parsedUrl.query
  //                                                   Get the HTTP method
  var method            = req.method.toLowerCase()
  //                                                   Get the headers as an object
  var headers           = req.headers
  //                                                   Get the payload,if any
  var decoder           = new StringDecoder('utf-8')
  var buffer            = ''

  req.on('data', function (data) {

    /* console.log(data) */   // Resultado: Churumbelitos
    /* console.log(decoder.write(data)) */ // Resultado : Objeto JSON

    buffer += decoder.write(data)

  })

  req.on('end', function () {
    buffer += decoder.end()
    /* console.dir(helpers.parseJsonToObject(buffer), {'colors': true}) */  // Objeto
    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : helpers.parseJsonToObject(buffer)  /* <--- Es el body donde pasamos data desde el cliente al server */
    }

    /* console.log( '\nP A Y L O A D: \n%o', data.payload) */

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 404;
      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof(payload) == 'object' ? payload : {'Error': 'Recurso No Encontrado'};
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      console.dir(payload, {'colors': true})
      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      /* res.writeHead(statusCode, {'Content-Type': 'application/json'}); */
      res.end(payloadString)

      /* statusCode == 404 ?  console.log('\nERROR [%s] \n\tNo Existe la ruta [%s] solicitada', statusCode, trimmedPath) : console.log("\n\tRuta encontrada [%s]  \n\tstatusCode: %s \n\tpayloadString: %s ", data.trimmedPath ,statusCode, payloadString) */
      statusCode == 200 || statusCode == 201  ? debug ('\x1b[32m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode) : debug ('\x1b[31m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode)

    })
  })
}

// Define the request router
server.router = {
  'ping'    : handlers.ping,
  'cobranza': handlers.cobranza,
  'ola'     : handlers.ola,
  'testing' : handlers.testing,
  'users'   : handlers.users,
  'tokens'  : handlers.tokens,
  'checks'  : handlers.checks
}

// Init script
server.init = function () {
  console.clear()
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.warn('\x1b[36m%s\x1b[0m','\tSERVER HTTP');
    console.log('\x1b[33m%s\x1b[0m','\tEl Servidor HTTP  listo en puerto: ' + config.httpPort + '\n')
  })

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function () {
    console.warn('\x1b[36m%s\x1b[0m','\tSERVER HTTPS');
    console.log('\x1b[33m%s\x1b[0m','\tEl Servidor HTTPS  listo en puerto: ' + config.httpsPort + '\n')
  })

}

// Export the module
module.exports = server
