/*
 * Entry Point for the API
*/
//                                       Dependencies
var http          = require('http');
var https         = require('https');
var url           = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config        = require('./config');
var fs            = require('fs');

/* :::::::::::::::::::::::::::::::::::::::::::::[ H T T P ]::::::::::::::::::::::::::::::::::::::::::::: */
//                                                                    [ 01 Instantiate the HTTP server ]
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

//                                                                          [ 02 Start the HTTP server ]
httpServer.listen(config.httpPort, function () {
  console.log('The HTTP server is running on port '+config.httpPort);
});

/* :::::::::::::::::::::::::::::::::::::::::::::[ H T T P S ]:::::::::::::::::::::::::::::::::::::::::::: */
//                                                                    [ 01 Instantiate the HTTPS server ]
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

//                                                                    [ 02 Instantiate the HTTPS server ]
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

//                                                                          [ 03 Start the HTTPS server ]
httpsServer.listen(config.httpsPort, function () {
  console.log('The HTTPS server is running on port ' + config.httpsPort);
});

//                             [>>>>>>>> All the server logic for both the http and https server <<<<<<<<]
var unifiedServer = function (req, res) {

  // Parse the url
  var parsedUrl         = url.parse(req.url, true);
  // Get the path
  var path              = parsedUrl.pathname;
  var trimmedPath       = path.replace(/^\/+|\/+$/g, '');
  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  // Get the HTTP method
  var method            = req.method.toLowerCase();
  //Get the headers as an object
  var headers           = req.headers;
  // Get the payload,if any
  var decoder           = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function (data) {
      buffer += decoder.write(data);
  });
  req.on('end', function () {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath'      : trimmedPath,
        'queryStringObject': queryStringObject,
        'method'           : method,
        'headers'          : headers,
        'payload'          : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 404;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {'name':'Resource Not Found'};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        /* res.setHeader('Content-Type', 'application/json'); */
        res.writeHead(statusCode, {'Content-Type': 'application/json'});
        res.end(payloadString);
        console.log("\nReturning this response: \n\tstatusCode: %s \n\tpayloadString: %s ", statusCode, payloadString);
      });
  });
};

// Define all the handlers
var handlers = {};

// ping handler
handlers.ping = function (data, callback) {
  callback(200, {'name':'Ping handler'});
};

// Testing handler
handlers.testing = function (data, callback) {
  callback(200, data);
};

// Cobranza handler
handlers.cobranza = function (data, callback) {
  var metodo    = data.method
  var respuesta = data.payload
  metodo == 'get' ? callback(206, {'name':'[GET] cobranza handler'}) : callback(206, {'name':'POST-' + respuesta})
};

// Ola handler
handlers.ola = function (data, callback) {
  var metodo = data.method
  metodo == 'get' ? callback(200, {'name':'K ASE?, Haciendo Solicitud GET!, o K ASE?'}) : callback(200, {'name':'K ASE?, Haciendo Solicitud POST!, o K ASE?'})
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback('404');
};

// Define the request router
var router = {
  'ping'    : handlers.ping,
  'cobranza': handlers.cobranza,
  'ola'     : handlers.ola
};
