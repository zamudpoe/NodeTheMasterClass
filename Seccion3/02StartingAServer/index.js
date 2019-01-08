/**
 * Archivo Entry Point para el API.
 *
 */
/* 00 Dependencias con librerias nativas de Node */
var http = require('http')
var port = process.env.port || 3000

/* 01 El servidor respondera a cualquier solicitud con un string */
var server = http.createServer(function(req, res) {
    /* OJO:
              En otra terminal corremos el comando: curl localhost:4500 nos respondera con Hello World
      */
    res.end('Ola K Ase!, Aprendiendo Node.js en el puerto ' + port + '? O K Ase?\n')
})

/* Iniciamos el servidor escuchando en el puerto en la variable port */
server.listen(port, function() {
    console.log('El server esta listo escuchando en el puerto [%s]', port)
})