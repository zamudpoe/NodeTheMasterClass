/*
 * Generic handler
*/

var handlers = {}

// Not Found Handler
handlers.notFound = function (data, callback) {
  callback(404, {'Error': 'Resource Not Found '})
}

// Export the module
module.exports = handlers
