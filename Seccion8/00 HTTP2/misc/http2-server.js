/*
 * Example HTTP2 Server
 * Opening a full-duplex (stream) channel on port 6000
*/

// Dependencies
var http2 = require('http2')
const fs = require('fs')

// If we dont get the port value we set it to 6000
var port = process.env.PORT || 6000

// Init the server
/* var server = http2.createServer() */
const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
})

server.on('error', (err) => console.error(err))
server.on('socketError', (err) => console.error(err))

// On a stream, send back hello world html
server.on('stream', function (stream, headers) {
  stream.respond({
    'content-type': 'text/html',
    ':status'     : 200
  })
  stream.end('<html><body><p>Ola K Ase?</p></body></html>')
})

// Listen on 6000
server.listen(port, function () {
  console.clear()
  console.log('\t\x1b[36mThe HTTP2 server is running on PORT \x1b[0m[%s]', port)
})
