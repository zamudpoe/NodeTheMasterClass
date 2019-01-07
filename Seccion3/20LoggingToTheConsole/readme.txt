
para usar los colores en los mensajes uaremos la sintaxis:
    console.log('\x1b[33m%s\x1b[0m','\n\tWorkers ejecutandose🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️ en Background\n')

Para monitorear en la consola los paquetes http:
    NODE_DEBUG=http node index.js

  nodemon NODE_DEBUG=http node index.js

Para monitorear en la consola los paquetes generados por los workers
    NODE_DEBUG=workers node index.js
   ya cambiamos los console.logs por debug por ejemplo:

   console.log("Éxito truncando logfile")

   debug("Éxito truncando logfile")


Para hacer uso del debug usaremos la libreria debuglog de la libreria util de node
    var util = require('util');
    var debug = util.debuglog('workers');





La documentación de node para este Curso es Node.js v8.9.4
https://nodejs.org/docs/v8.9.4/api/

DEBUGGEAR EN CHROME

LEVANTAMOS NUESTRO ENTRY POINT DE LA SIGUIENTE FORMA:
  node --inspect-brk index.js

ABRIMOS LAS DEVTOOLS EN CHROME




