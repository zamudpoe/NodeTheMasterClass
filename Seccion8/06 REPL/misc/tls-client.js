/*
  Example TSL Client
  connects to port 6000 and sends the word 'PONG' to server
*/

// Dependencies
var tls  = require('tls')
var fs   = require('fs')
var path = require('path')

// Define the message to send
var outboundMessage = 'PING'
var port            = process.env.PORT || 6000

// Server Options
var options = {
  // Only required because we're using a self-signed certificated
  'ca' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}

// Create the client
var client = tls.connect( port, options, () => {
  // Send the message
  client.write(outboundMessage)
})

// When the server writes back , log what is says then kill the client.
client.on('data', (inboundMessage) => {
  var messageString = inboundMessage.toString()

  messageString === 'PONG' ? console.log("Client wrote ["+outboundMessage+"] and Server said ["+messageString+"]") : console.log("\n\t==>>>"+messageString+" NO GAME\n")

  /* console.log("Client wrote ["+outboundMessage+"] and Server said ["+messageString+"]") */
  client.end()
})


