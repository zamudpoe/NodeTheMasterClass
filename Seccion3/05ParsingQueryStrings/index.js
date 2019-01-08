/* Archivo Entry Point para el API. */
var http = require('http')
var url = require('url')

/* Variables de entorno */
var port = process.env.port || 3000

var server = http.createServer(function(req, res) {
    // Analisamos el URL
    var parsedUrl = url.parse(req.url, true, true);
    var queryStringObject = parsedUrl.query;

    // Obtenemos el PATH
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Obtenemos los Metodos HTTP
    var method = req.method.toLowerCase();

    // Enviamos la respuesta!.
    res.end('\n\tOla K Ase!, Aprendiendo Node.JS?, K Ase?\n');

    // Log the request/response
    console.log('Solicitud recibida en \n\tpath: [ ' + trimmedPath + ' ] \n\tmetodo [ ' + method + ' ] \n\tqueryStringObject: %o', queryStringObject, '\n\nCon los siguientes HEADERS :\n\t', headers);

});

server.listen(port, function() {
    console.log('\nEl server esta listo escuchando en el puerto [%s]\n', port)
})