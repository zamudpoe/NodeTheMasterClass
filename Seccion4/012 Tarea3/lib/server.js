// Dependencies
var http                 = require('http')
var https                = require('https')
var url                  = require('url')
var StringDecoder           = require('string_decoder').StringDecoder
var config                  = require('./config')
var fs                      = require('fs')
var genericHelper           = require('./helpers/generic')
// HTML HANDLERS
var indexHTMLHandlers       = require('./handlers/indexHTMLHandler')
var publicHandlers          = require('./handlers/publicHandler')
var accountHTMLHandler      = require('./handlers/accountHTMLHandler')
var sessionHTMLHandler      = require('./handlers/sessionHTMLHandler')
var checkListHTMLHandler    = require('./handlers/checkListHTMLHandler')
var menuListHTMLHandler     = require('./handlers/menuListHTMLHandler')
var shoppingCartHTMLHandler = require('./handlers/shoppingCartHTMLHandler')
var ordersHTMLHandler       = require('./handlers/ordersHTMLHandler')

// JSON HANDLERS
var userHandler          = require('./handlers/user')
var accountHandler       = require('./handlers/account')
var menuHandler          = require('./handlers/menu')
var shoppingCartHandler  = require('./handlers/shoppingCart')
var orderHandler         = require('./handlers/order')
var checkoutHandler      = require('./handlers/checkout')
var notFoundHandler      = require('./handlers/generic')
var tokenHandlers        = require('./handlers/tokens')

var path                 = require('path')
var util                 = require('util')
var debug                = util.debuglog('server')

const { parse }          = require('querystring')

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
  var trimmedPath       = path.replace(/^\/+|\/+$/g, '')

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

    /* buffer = parse(buffer) */

    /* console.dir(parse(buffer), {'colors': true}) */

    // Choose the handler this request should go to. If one is not found, use the notFound handler.
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : notFoundHandler.notFound

    // If the request is within the public directory use to the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? publicHandlers.public : chosenHandler

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : genericHelper.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload, contentType) {
      // Determine the type of response (fallback to JSON)
      contentType = typeof (contentType) == 'string' ? contentType : 'json'

      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200

      // Return the response parts that are content-type specific
      var payloadString = ''

      switch (contentType) {
        case 'json':
          res.setHeader('Content-Type', 'application/json')
          payload       = typeof(payload) == 'object'? payload : { 404 : 'Payload Under Construction'}
          payloadString = JSON.stringify(payload)
        break

        case 'html':
          res.setHeader('Content-Type', 'text/html')
          payloadString = typeof(payload) == 'string'? payload : ''
        break

        case 'favicon':
          res.setHeader('Content-Type', 'image/x-icon')
          payloadString = typeof(payload) !== 'undefined' ? payload : ''
        break

        case 'plain':
          res.setHeader('Content-Type', 'text/plain')
          payloadString = typeof(payload) !== 'undefined' ? payload : ''
        break

        case 'css':
          res.setHeader('Content-Type', 'text/css')
          payloadString = typeof(payload) !== 'undefined' ? payload : ''
        break

        case 'png':
          res.setHeader('Content-Type', 'image/png')
          payloadString = typeof(payload) !== 'undefined' ? payload : ''
        break

        case 'jpg':
          res.setHeader('Content-Type', 'image/jpeg')
          payloadString = typeof(payload) !== 'undefined' ? payload : ''
        break

      }  /* switch (contentType) */

      // Return the response-parts common to all content-types
      res.writeHead(statusCode)
      res.end(payloadString)

      // If the response is 200, print green, otherwise print red
      statusCode == 200 ? debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode) : debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+' /'+trimmedPath+' '+statusCode)
      /* console command:  node --inspect-brk index.js */

    }) /* chosenHandler */

  })
} /* unifiedServer */

// Define a request router
server.router = {
  ''                : indexHTMLHandlers.index,
  'account/create'  : accountHTMLHandler.accountCreate,
  'account/edit'    : accountHTMLHandler.accountEdit,
  'account/deleted' : accountHTMLHandler.accountDeleted,
  'session/create'  : sessionHTMLHandler.sessionCreate,
  'session/deleted' : sessionHTMLHandler.sessionDeleted,
  'checks/all'      : checkListHTMLHandler.checksList,

  'api/users'       : userHandler.users,
  'api/tokens'      : tokenHandlers.tokens,

  'login'           : accountHandler.login,
  'logout'          : accountHandler.logout,

  'menu'            : menuHandler.menu,
  'menuList'        : menuListHTMLHandler.menuList,

  'shoppingcart'    : shoppingCartHandler.shopping_cart,
  'shoppingcartList': shoppingCartHTMLHandler.shoppingCart,
  'order'           : orderHandler.order,
  'orders/all'      : ordersHTMLHandler.ordersList,
  'checkout'        : checkoutHandler.checkout
}

// Init script
server.init = function () {
  console.clear()

  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function() {
    console.log('\x1b[36m%s\x1b[0m',"\n\tThe HTTP Server server ["+config.envName+"] is ready and listening on Port ["+config.httpPort + "]")
  })

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function() {
    console.log('\x1b[35m%s\x1b[0m',"\tThe HTTPS Server server ["+config.envName+"] is ready and listening on Port ["+config.httpsPort + "]\n")
  })
}

// Export the module
module.exports = server
