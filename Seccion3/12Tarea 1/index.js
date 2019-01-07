/*
**  NodeJS Master Class **
*** Homework Assignment #1 - Hello World API ***
*/

// Dependencies
const fs          = require('fs')
const http        = require('http')
const https       = require('https')
var url           = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var mathLib       = require('./lib/math')
var jokeLib       = require('./lib/joke')

var app = {}

app.config = {
  title            : "The Joke App",
  'timeBetweenJoke': 2000
}

app.printAllTheJokes = function () {
  var all_Jokes     = jokeLib.all_Jokes()                       // Get all the jokes
  var numberOfJokes = all_Jokes.length                          // Get the length of the jokes
  var randomNumber  = mathLib.getRandomNumber(1, numberOfJokes) // Pick a random number between 1 and the number of jokes
  var selected_Joke = all_Jokes[randomNumber - 1]               // Get the jokes at that position in the array (minus one)

  console.log('\n' + selected_Joke) // Send the jokes to the console
}

// Function that loops indefinitely, calling the printAJoke function as it goes
app.indefiniteLoop = function () {
  // Create the interval, using the config variable defined above
  setInterval(app.printAllTheJokes, app.config.timeBetweenJoke)
}

const config      = require('./config')

// Instantiate the HTTP server
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})

// Start the HTTP server and have it listen on the environment port
httpServer.listen(config.httpPort, function () {
  console.log("\n\tThe HTTP server is listening on port [ " + config.httpPort + " ] in " + config.envName + " mode")
})

// Instantiate the HTTPS server
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
})

// Start the HTTPs server and have it listen on the environment port
httpsServer.listen(config.httpsPort, function () {
  console.log("\n\tThe HTTPS server is listening on port [ " + config.httpsPort + " ] in " + config.envName + " mode")
})

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {

  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true)
  // Get the path
  var path = parsedUrl.pathname
  var trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // Get the query string as an object
  var queryStringObject = parsedUrl.query
  // Get the HTTP method
  var method = req.method.toUpperCase()
  // Get the headers as an object
  var headers = req.headers
  // Get the payload, if any
  var decoder = new StringDecoder('utf-8')
  var buffer = '' // payload content

  req.on('data', function(data) {
    buffer += decoder.write(data)
  })

  req.on('end', function() {
    buffer += decoder.end()

    // Choose the handler for this request. If no handler is found, use the
    // notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 404
      statusCode = typeof(statusCode) == 'number' ? statusCode : 404

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {}

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log the request payload
      console.clear()
      console.log('\nReturning this response: \n\t\t', statusCode, payloadString)
    })

  })
}

// Define the routing handlers
var handlers = {}

// Ping handler
handlers.hello = function (data, callback) {
  callback (200, {"HELLO": "What's Up Doc?, mmmm ...let me tell You a few jokes, check your console.. "})
  app.indefiniteLoop()
}

// Not found handler
handlers.notFound = function (data, callback) {
  callback (404, {"ERROR" : "Hey this is not a joke the route is not found!, But let me tell a few jokes "})
  app.indefiniteLoop()
}

// Define a request router
const router = {
  'hello': handlers.hello
}
