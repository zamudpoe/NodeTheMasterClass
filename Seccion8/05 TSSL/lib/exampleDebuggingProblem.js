/*
 ** Library that demostrates something throwing when it's init() is called

    1. node inspect index_debug.js
    2. En la consola escribes repl
    3. consultamos por el valor de la varible que esten arriba de la palbra debugger en nuestro caso es foo.

*/

// Container for the module
var example = {}

// Init function
example.init = () => {
  /* this is an error created intencionally (bar is not defined) */
  var foo = bar
}

// Export the module
module.exports = example
