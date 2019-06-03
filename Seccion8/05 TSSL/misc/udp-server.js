/*
 * Example UDP Server
 * Creating a UDP datagram server and listening on 6000
*/

// Dependencies
var dgram  = require('dgram')
var server = dgram.createSocket('udp4')

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`)
  server.close()
})

// Recibimos los mensajes
server.on('message',  (messageBuffer, sender) => {
  // Do something with an incoming message or the sender
  var messageString = messageBuffer.toString()
  /* console.dir(sender) */
  /* console.log(messageString) */
  console.log(`Server got: [ ${messageString} ] from [ ${sender.address}:${sender.port} ]`)
})

server.on('listening', () => {
  const address = server.address()
  console.log(`\nserver listening ${address.address}:${address.port}\n`)
})

// Bind to 6000
server.bind(6000)
