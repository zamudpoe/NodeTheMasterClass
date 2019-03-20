/*
*** JSON API Handlers for menu actions
*/

// Dependencies
var _data       = require('../data')
var tokenHelper = require('../helpers/token')

// Define the menuHandler
var menuHandler = {}

// Menu
menuHandler.menu = function (data, callback) {
  var acceptableMethods = ['get']
  if (acceptableMethods.indexOf(data.method) > -1) {
    menuHandler._menu[data.method](data, callback)
  } else {
    callback (405)
  }
}

// Container for the menu submethod
menuHandler._menu = {}

// Menu - get
// Required data on header: token, userid
// Optional data: none
menuHandler._menu.get = function (data, callback) {
  // Get tokenId and userIdentifier from header
  var token          = typeof(data.headers.token)     == 'string' ? data.headers.token          : false
  var userIdentifier = typeof(data.headers.userid)    == 'string' ? data.headers.userid         : false
  var paramName      = typeof(data.queryStringObject) == 'object' ? data.queryStringObject.name : false

  /* Si raemos queryparams en la url entonces hacemos la consulta solo para ese queryparam de o contrario listamos todos */
  if ( paramName ) {
    /* console.log("data.queryStringObject: %o ", data.queryStringObject) */
    var menuItems = []

    /* console.log("paramName: %s", paramName) */

    if (token && userIdentifier) {
      tokenHelper.verifyToken(token, userIdentifier, function (tokenIsValid) {
        if (tokenIsValid) {
          _data.read('menuitems', paramName, function (err, menuItemData) {
            if (!err && menuItemData) {
              menuItems.push(menuItemData)

              callback (200, menuItems)
            } else {
              callback (500, {'Error': 'There was a error reading a single menu item.'})
            }
          })
        } else {
          callback (403, {'Error': 'Missing required token in header, or token is invalid. Please try to login again.'})
        }
      })
    }

  } else {
    console.log('\nHacemos la consulta para todos los items!')
    /* console.log("\n\nuserIdentifier: %s" , userIdentifier) */

    if (token && userIdentifier) {
      tokenHelper.verifyToken(token, userIdentifier, function (tokenIsValid) {
        if (tokenIsValid) {
          _data.list('menuitems', function (err, fileNames) {
            if (!err && fileNames && fileNames.length > 0) {
              var menuItems = []

              fileNames.forEach(function (fileName) {
                _data.read('menuitems', fileName, function (err, menuItemData) {
                    if (!err && menuItemData) {
                      menuItems.push(menuItemData)
                      if (menuItems.length == fileNames.length) {
                        callback(200, menuItems)
                      }
                    } else {
                      callback(500, {'Error': 'There was a error reading a single menu item.'})
                    }
                })
              })

            } else {
              callback (500, {'Error': 'There was a error reading the menu items.'})
            }
          })
        } else {
          callback (403, {'Error': 'Missing required token in header, or token is invalid. Please try to login again.'})
        }
      })
    } else {
      callback (403, {'Error': 'Missing required token in header or userid. Please try again.'})
    }

  }

}

module.exports = menuHandler
