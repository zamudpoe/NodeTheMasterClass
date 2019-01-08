/* Archivo Entry Point para el API. */
/* 00 Dependencias con librerias Nativas de Node.js */
var http = require('http')
var url = require('url')

/* Variables de entorno */
var port = process.env.port || 3000

// 01 Configure the server to respond to all requests with a string
var server = http.createServer(function(req, res) {
    // Analisamos el URL
    var parsedUrl = url.parse(req.url, true, true);
    /* OJO:
          para conocer todo el objeto parsedUrl */
    /* console.log('%o', parsedUrl) */

    // Obtenemos el PATH
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, ''); // Quitamos al url las '/' al inicio y final del url

    // Obtener el QueryString como un Objeto
    // Lo que viene despues de ? son asignaciones de variables=valor eso es el QueryString ejemplo:  http://localhost:3000/foo?var1=hola
    var queryStringObject = parsedUrl.query;

    // Obtenemos los Metodos HTTP
    var method = req.method.toLowerCase();

    // OBTENER los ENCABEZADOS 'HEADERS' como un objeto
    var headers = req.headers;

    // Enviamos la respuesta!.
    res.end('\n\tOla K Ase!, Aprendiendo Node.JS?, K Ase?\n');

    // Log the request/response
    /* console.log('\nSolicitud recibida con el siguiente ENCABEZADO: \n\n', headers, '\n'); */
    console.log('Solicitud recibida en \n\tpath: [ ' + trimmedPath + ' ] \n\tmetodo [ ' + method + ' ] \n\tqueryStringObject: ', queryStringObject, '\n\nHEADERS: ', headers);
});

/* 02 Iniciamos el servidor escuchando en el puerto en la variable port */
server.listen(port, function() {
    console.log('\nEl server esta listo escuchando en el puerto [%s]\n', port)
})