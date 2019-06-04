/*
  Example TCP (Net) Client
  connects to port 6000 and sends the word 'PONG' to server
*/

// dependencies
var net             = require('net')

// Define the message to send
var outboundMessage = 'PING'
var port            = process.env.PORT || 6000

// Create the client
var client = net.createConnection({'port': port}, () => {
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


