var titulo = process.env.titulo
var port = process.env.port || 3000

console.log('Titulo: \n\t%s\n Port: %s', titulo, port)


/*
En la terminal lo invocamos asi:
  titulo="hola que tal estas" port=4500 node index.js
*/