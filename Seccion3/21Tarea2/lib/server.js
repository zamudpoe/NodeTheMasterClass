// Dependencies
var http                = require('http')
var https               = require('https')
var url                 = require('url')
var StringDecoder       = require('string_decoder').StringDecoder
var config              = require('./config')
var fs                  = require('fs')
var genericHelper       = require('./helpers/generic')

// HANDLERS
var userHandler         = require('./handlers/user')
var accountHandler      = require('./handlers/account')
var menuHandler         = require('./handlers/menu')
var shoppingCartHandler = require('./handlers/shoppingCart')
var orderHandler        = require('./handlers/order')
var checkoutHandler     = require('./handlers/checkout')
var notFoundHandler     = require('./handlers/generic')

var path                = require('path')
var util                = require('util')
var debug               = util.debuglog('server')

// Instantiate the server module object
var server = {}

// We are instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
  server.unifiedServer(req, res)
})

// Instantiate the HTTPS createServer
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname, '../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
  server.unifiedServer(req, res)
})

// All the server logic for both the http and https server
server.unifiedServer = function (req, res) {
  // Get the url and parse it
  var parsedUrl         = url.parse(req.url,true)

  // Get the path
  var path              = parsedUrl.pathname
  var trimmedPath       = path.replace(/^\/+|\/+$/g,'')

  // Get the query string as an object
  var queryStringObject = parsedUrl.query

  // Get the HTTP Method
  var method            = req.method.toLowerCase()

  // Get the headers as an object
  var headers           = req.headers

  // Get the payload, if any
  var decoder           = new StringDecoder('utf-8')
  var buffer            = ''

  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function () {
    buffer += decoder.end()

    // Choose the handler this request should go to. If one is not found, use the notFound handler.
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : notFoundHandler.notFound

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : genericHelper.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload){
      // Use the status code called back by the handler , or default to 200
      statusCode        = typeof(statusCode) == 'number' ? statusCode : 200

      // Use the payload called back by the handler, or default to an empty object
      payload           = typeof(payload) == 'object' ? payload : {}

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // If the response is 200, print green otherwise print red
      if ( statusCode == 200) {
        //green
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode)
      } else {
        //red
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode)
      }
    })
  })
}

// Define a request router
server.router = {
  'users'        : userHandler.users,
  'login'        : accountHandler.login,
  'logout'       : accountHandler.logout,
  'menu'         : menuHandler.menu,
  'shoppingcart' : shoppingCartHandler.shopping_cart,
  'order'        : orderHandler.order,
  'checkout'     : checkoutHandler.checkout
}


// Init script
server.init = function () {
  console.clear()

  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.log('\x1b[36m%s\x1b[0m',"The server ["+config.envName+"] is ready and listening on Port ["+config.httpPort + "]")
  })

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log('\x1b[35m%s\x1b[0m',"The server ["+config.envName+"] is ready and listening on Port ["+config.httpsPort + "]")
  })
}

// Export the module
module.exports = server
