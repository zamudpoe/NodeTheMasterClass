var http = require('http')
var url = require('url')
const { StringDecoder } = require('string_decoder')

var port = process.env.port || 3000

/*  01 Configure the server to respond to all requests with a string */
var server = http.createServer(function (req, res) {
  var parsedUrl = url.parse(req.url, true, true)

  var path = parsedUrl.pathname
  var trimmedPath = path.replace(/^\/+|\/+$/g, '')  /* Quitamos al url las '/' al inicio y final del url */

  var queryStringObject = parsedUrl.query
  // Get the HTTP method
  var method = req.method.toLowerCase()

  /*  Obtenemos los Metodos HTTP */
  var headers = req.headers
  /* OBTENER los ENCABEZADOS 'HEADERS' como un objeto */

  /*
    Bien ya tenemos URL, el PATH, el QueryString en un objeto, los Metodos HTTP, y los ENCABEZADOS como un objeto
    ahora DE HABER vamos a obtener el PAYLOAD o el DATA
  */
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function (data) {
    buffer += decoder.write(data);
  })

  req.on('end', function () {
    buffer += decoder.end();
    res.end('\n\tOla K Ase!, Aprendiendo Node.JS?,O K Ase?\n'); /*  Enviamos la Respuesta!. */

    if ( method == 'get' ) {
      console.log('\n\tSolicitud GET recibida SIN DATA ');
    } else {
      console.log('\n\tSolicitud POST recibida con DATA: \n\t', buffer);
    }

  })

})

server.listen( port,  function () {
  console.log('\nEl server esta listo escuchando en el puerto [%s]\n', port);
})
