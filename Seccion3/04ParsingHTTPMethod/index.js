/* Archivo Entry Point para el API. */
/* 00 Dependencias con librerias Nativas de Node.js */
var http = require('http')
var url = require('url')

/* Variables de entorno */
var port = process.env.port || 3000

// 01 Configure the server to respond to all requests with a string
var server = http.createServer(function(req, res) {
    // Analisamos el url
    var parsedUrl = url.parse(req.url, true);

    // Obtenemos el path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // Quitamos al url las '/' al inicio y final del url

    // Obtenemos los Metodos HTTP
    var method = req.method.toLowerCase();

    // Enviamos la respuesta al solicitante!.
    res.end('\n\ttOla K Ase!, Aprendiendo Node.JS?, K Ase?\n ');
    // Log the request/response
    console.log('Solicitud recibida en el path: [ ' + trimmedPath + ' ] con el metodo [ ' + method + ' ]');
});

/* 02 Iniciamos el servidor escuchando en el puerto en la variable port */
server.listen(port, function() {
    console.log('\nEl server esta listo escuchando en el puerto [%s]\n', port)
})