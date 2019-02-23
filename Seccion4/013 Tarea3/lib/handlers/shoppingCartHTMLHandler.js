/**
  :::::::::::::::::::::::::::::::::::  HTML Handlers ::::::::::::::::::::::::::::::::::
                              {{{{{{ Shoppongcart HTML Handler }}}}}
  --------------------------- Handler for Shoppongcart HTML Page --------------------------
**/
// Dependencies
var helpers = require('../helpers/generic')

// Define all the handlers
var handlers = {}

// Dashboard (view all checks)
handlers.shoppingCart = function (data, callback) {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Shopping Cart',
      'body.class' : 'shoppingCart'
    };
    // Read in a template as a string
    helpers.getTemplate('shoppingCart', templateData, function (err, str) {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, function (err, str) {
          if (!err && str) {
            // Return that page as HTML
            callback (200, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined, 'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }
}

// Export the handlers
module.exports = handlers


