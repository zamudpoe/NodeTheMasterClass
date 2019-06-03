/*
  Example TLS Server
  Listen to port 6000 and sends the word "pong" to client
*/

// Dependencies
var tls  = require('tls')
var fs   = require('fs')
var path = require('path')

var port = process.env.PORT || 6000

// Server Options
var options = {
  'key'  : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}


// Create the server
var server = tls.createServer(options, (connection) => {
  // Send the word 'pong'
  var outboundMessage = 'PONGs'

  // When the client writes something, log it out
  connection.on('data', (inboundMessage) => {
    var messageString = inboundMessage.toString()
    messageString ===  'PING' ? connection.write(outboundMessage) : connection.write('NEL')

    console.log("\nThe Client said [ "+messageString+" ] and Server wrote [ "+outboundMessage+" ]\n")
  })
  console.log('>>>>>>>>> TLS Server Startered <<<<<<<<<' )
}).on('error', (err) => {

  throw err
})

// Listen
server.listen(port, () => {
  console.log('\nOpened server on [%o] \n', port /* server.address() */ )
})

