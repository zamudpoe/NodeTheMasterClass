/**
  :::::::::::::::::::::::::::::::::::  HTML Handlers ::::::::::::::::::::::::::::::::::
                              {{{{{{ Index Handler }}}}}
  --------------------------- Handler for Index Page --------------------------
**/
// Dependencies
var helpers = require('../helpers/generic')

// Define all the handlers
var handlers = {}

/*
** HTML Handlers
*/

// Index
handlers.index = function (data, callback) {
  /* callback (undefined, '<h1>HOLA MUNDO</h1>', 'html') */

  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    var templateData = {
      'head.title'      : 'Pizzeria Feliantoni',
      'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
      'body.class'      : 'index'
    }

    // Read in a template as a string
    helpers.getTemplate('index', templateData, function (err, str) {
      if (!err && str) {
        // Add the universal header and footer
        /* callback (200, '<h1 style= "color:teal;">Plantilla index puede ser cargada con exito!</h1>', 'html'); */
        /* callback (200, str, 'html') */ /* index2.html */
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            // Return that page as HTML
            callback (200, str, 'html')
          } else {
            callback (500, '<h1 style= "color:tomato;">Error en construccion de la pagina principal index.html</h1>', 'html')
            /* callback (500, undefined, 'html'); */
          }
        })
      } else {
        console.log(err)
        callback (500, '<h1 style= "color:tomato;">Plantilla index faltante!</h1>', 'html')
        /* callback (500, undefined, 'html'); */
      }
    })
  } else {
    callback (405, {'405' : 'METODO NO PERMITIDO PULSERAS!!!'}, 'json');
  }

}

module.exports = handlers
