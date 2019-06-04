/*
  Example TCP (net) Searver
  Listen to port 6000 and sends the word "pong" to client
*/

// Dependencies
var net  = require('net')
var port = process.env.PORT || 6000

// Create the server
var server = net.createServer((connection) => {
  // Send the word 'pong'
  var outboundMessage = 'PONG'

  // When the client writes something, log it out
  connection.on('data', (inboundMessage) => {
    var messageString = inboundMessage.toString()
    messageString ===  'PING' ? connection.write(outboundMessage) : connection.write('NEL')

    console.log("\nThe Client said [ "+messageString+" ] and Server wrote [ "+outboundMessage+" ]\n")
  })
}).on('error', (err) => {

  throw err
})

// Listen
server.listen(port, () => {
  console.log('Opened server on [%o] ', port /* server.address() */ )
})
