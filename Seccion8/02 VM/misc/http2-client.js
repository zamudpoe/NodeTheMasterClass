/*
 * Example HTTP2 client
 * Connects to port 6000 and logs the response
*/

// Dependencies
var http2 = require('http2')
const fs = require('fs')
// Create client
/* var client = http2.connect('http://localhost:6000') */

const client = http2.connect('https://localhost:6000', {
  ca: fs.readFileSync('localhost-cert.pem')
})

client.on('socketError', (err) => console.error(err))
client.on('error', (err) => console.error(err))

// Create a request
var req = client.request({
  ':path': '/'
})

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`)
  }
})

req.setEncoding('utf8')

// When message is received, add the pieces of it together until you reach the end
var str = ''
req.on('data', function (chunk) {
  str += chunk
})

// When a message ends, log it out
req.on('end', function () {
  console.log(`\n${str}\n`)
  client.destroy()
})

// End the request
req.end()
