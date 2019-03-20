/*
*** CLI-related tasks
*/

// Dependencies
var readline = require('readline')
var util     = require('util')
var debug    = util.debuglog('cli')
var events   = require('events')
class _events extends events {}
var e        = new _events()

var _data    = require('./data')
var helpers  = require('./helpers/generic')

// Instantiate the cli module object
var cli      = {}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Input handlers
e.on('man', () => {
  cli.responders.help()
})

e.on('help', function () {
  cli.responders.help()
})

e.on('menu items', function () {
  cli.responders.menuItems()
})

e.on('list orders', function (str) {
  var arrStr       = str.split('--')
  var strParam     = typeof(arrStr[1]) == 'string' &&  arrStr[1].trim().length > 0 ? arrStr[1].trim() : ''

  console.log('\x1Bc')
  switch (strParam) {
    case 'p':
      console.log("strParam: P ")
      cli.responders.ordersPayed(str)
      break;
    case 'n':
      console.log("strParam: N ")
      cli.responders.ordersNotPayed(str)
      break;
    default:
      console.log("strParam: OTHERS ")
      cli.responders.orders()
      break;
  }

})

e.on('more order info', function (str) {
  cli.responders.orderOrderInfo(str)
})

e.on('list users', function () {
  cli.responders.listUsers()
})

e.on('more user info', function (str) {
  cli.responders.moreUserInfo(str)
})

e.on('exit', function(str) {
  cli.responders.exit()
})

e.on('clear', () => {
  cli.responders.clearScreen()
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Helpers
// Create a Vertical space
cli.verticalSpace = (lines) => {
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1

  for (i = 0 ; i < lines ; i++) {
    console.log('')
  }
}

// Create a horizontal line across the screen
cli.horizontalLine = () => {
  // Get the available screen size.
  var width = process.stdout.columns
  var line  = ''

  for (i = 0 ; i < width ; i++) {
    line +=  '-'
  }
  console.log(line)
}

// Create centered text on the screen.
cli.centered = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : ''

  // Get the available screen size
  var width       = process.stdout.columns

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2)

  // Put in left padded spaces before the string itself
  var line = ''
  for (i = 0; i < leftPadding; i++) {
    line += ' '
  }

  line += str
  console.log(line)
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: CLI Object Seccion
cli.responders = {}

// Help / Man
cli.responders.help = function () {
  console.log('\x1Bc')
  /* console.log("\x1b[45m\x1b[5mMenu Screen\x1b[0m") */
  /* console.log(process.versions) */
  var commands = {
    'man'                              : 'Show this help page',
    'menu items'                       : 'View all the current menu items',
    'list users'                       : 'View all the users who have signed up in the last 24 hours',
    'more user info --{emailAddress}'  : 'Lookup the details of a specific user by email address',
    'list orders --{"p" or "n"}'       : 'View all the recent orders in the system (orders placed in the last 24 hours). p for payed orders , n for not payed, and null for all the orders',
    'more order info --{orderId}'      : 'Lookup the details of a specific order by order ID',
    'clear'                            : 'Clear the screen',
    'exit'                             : 'Kill the CLI (and the rest of the application)'
  }

  // Show a header for the help page that is as wide as the screen.
  cli.horizontalLine()
  cli.centered('[ PIZZAS FELIANTONI - CLI MANUAL ]')
  cli.horizontalLine()
  cli.verticalSpace(2)

  // Show each command, followed by its explanation , in white and yellow respectively.
  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value   = commands[key]
      /* var line    = '\x1b[45m\x1b[5m'+key+'\x1b[0m' */
      var line    = '\t\x1b[33m\x1b[5m'+key+'\x1b[0m'
      var padding = 60 - line.length

      for (i = 0; i < padding; i++) {
        line += ' '
      }

      line += value
      console.log(line)
      cli.verticalSpace()
    }
  }

  cli.verticalSpace(1)

  // End wit anothe horizontal line
  cli.horizontalLine()
}
// List Menu Items
cli.responders.menuItems = function () {
  var vli_length = 0
  console.log('\x1Bc')

  // Create a header for the stats
  cli.horizontalLine()
  cli.centered('\x1b[5m[ MENU ITEMS ]\x1b[0m')
  cli.horizontalLine()
  cli.verticalSpace(2)

  _data.list('menuitems', function (err, menuItem) {
    cantPizzas = menuItem.length

    if (!err && menuItem && menuItem.length > 0) {

      menuItem.forEach(function (itemId) {

        _data.read('menuitems', itemId, function (err, itemData) {
          /* console.log(itemData) */

          /* \x1b[33m\x1b[5m */

          if (!err && itemData){
            vli_length += 1
            var line           = '\n\t\x1b[33mid:\x1b[0m ' + itemData.id + '\x1b[0m\n\t\x1b[33mPizza: \x1b[0m\x1b[32m' + itemData.name.toUpperCase() + '\n\t\x1b[33mIngredients:\x1b[0m' + itemData.displayName  + '\n\t\x1b[33mPrice \x1b[0m' + itemData.price
            line+='\n'
            console.log(line)
            if (vli_length == menuItem.length) {
              cli.verticalSpace(2)
              cli.horizontalLine()
            }
          }
        })

      })
    } else {
      console.log("\nerr %s\n", err)
    }
  })

}

cli.responders.orders = function () {
  var vli_count    = 0

  console.log('\x1Bc')

  _data.list('orders', function (err, ordersRSet) {
    /* console.log("ordersRSet.length: %s ", ordersRSet.length) */

    if (!err && ordersRSet && ordersRSet.length > 0) {

      // Create a header for the stats
      cli.horizontalLine()
      cli.centered('\x1b[5m[ LIST ORDERS ]\x1b[0m')
      cli.horizontalLine()
      cli.verticalSpace()

      ordersRSet.forEach(function (orderId) {

        _data.read('orders', orderId, function (err, orderData) {
          if (!err && orderData) {
            var items = orderData.items

            const CantPizzas = items.reduce((contPizzas, nombre) => {
              contPizzas[nombre] = (contPizzas[nombre] || 0) + 1
              return contPizzas
            }, {})

            _data.read('users', orderData.userId, function (err, userData) {
              if (!err && userData) {
                var strCliente           = '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress
                strCliente+=' '

                var strRedTotal = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                var strPayed    = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                var line = '\n\t\x1b[33mOrder Id:\x1b[0m ' + orderData.id + '\x1b[0m\n\t\x1b[33mClient : \x1b[0m\x1b[32m' + userData.name.toUpperCase() + '\n\t\x1b[33mAddress:\x1b[0m ' + userData.streetAddress + '\n\t\x1b[33me-mail:\x1b[0m\x1b[32m '+ userData.emailAddress + '\t\x1b[33mPhone:\x1b[0m '+ userData.phone + '\n\t\x1b[33m payed : \x1b[0m' + strPayed +  orderData.payed  + '\t\t\x1b[0m\x1b[33m mail_sent :\x1b[0m' + strPayed  + orderData.mail_sent  + '\n\n\t\t\x1b[0m\x1b[33mItems :\x1b[0m' + strPayed + JSON.stringify(CantPizzas) + '\n\n\t\x1b[0m\x1b[33m Gran Total : \x1b[0m' + strRedTotal + ' $'+ orderData.totalPrice.toFixed(2) + ' USD \n\t\t\x1b[0m'

                delete userData.hashedPassword

                vli_count = vli_count + 1
                console.log(line)

                if ( vli_count == ordersRSet.length ) {
                  cli.verticalSpace(1)
                  cli.horizontalLine()
                }

              }
            })

          }

        })
      })

    } else {
      console.log("\nerr %s\n", err)
    }
  })
}

cli.responders.ordersPayed = function (str) {
  var vli_count    = 0
  console.log('\x1Bc')

  /* console.log("strParam: " , strParam) */

  _data.list('orders', function (err, ordersRSet) {
    /* console.log("ordersRSet.length: %s ", ordersRSet.length) */

    if (!err && ordersRSet && ordersRSet.length > 0) {

      // Create a header for the stats
      cli.horizontalLine()
      cli.centered('\x1b[5m[ ORDERS LIST PAYED ]\x1b[0m')
      cli.horizontalLine()
      cli.verticalSpace()

      ordersRSet.forEach(function (orderId) {

        _data.read('orders', orderId, function (err, orderData) {
          if (!err && orderData) {
            var items = orderData.items

            const CantPizzas = items.reduce((contPizzas, nombre) => {
              contPizzas[nombre] = (contPizzas[nombre] || 0) + 1
              return contPizzas
            }, {})

            if (orderData.payed && orderData.mail_sent) {
              vli_count = vli_count + 1

              _data.read('users', orderData.userId, function (err, userData) {
                if (!err && userData) {
                  var strCliente           = '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress
                  strCliente+=' '

                  var strRedTotal = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                  var strPayed    = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                  var line        = '\n\t\x1b[0m\x1b[33mOrder Id:\x1b[0m ' + orderData.id + '\x1b[0m\n\t\x1b[33mClient : \x1b[0m\x1b[32m' + userData.name.toUpperCase() + '\n\t\x1b[33mAddress:\x1b[0m ' + userData.streetAddress + '\n\t\x1b[33me-mail:\x1b[0m\x1b[32m '+ userData.emailAddress + '\t\x1b[33mPhone:\x1b[0m '+ userData.phone + '\n\t\x1b[33m payed : \x1b[0m' + strPayed +  orderData.payed  + '\t\t\x1b[0m\x1b[33m mail_sent :\x1b[0m' + strPayed  + orderData.mail_sent  + '\n\n\t\t\x1b[0m\x1b[33mItems :\x1b[0m' + strPayed + JSON.stringify(CantPizzas) + '\n\n\t\x1b[0m\x1b[33m Gran Total : \x1b[0m' + strRedTotal + ' $'+ orderData.totalPrice.toFixed(2) + ' USD \n\t\t\x1b[0m'

                  delete userData.hashedPassword
                  console.log(line)
                }
              })

            }

          }

        })
      })

    } else {
      console.log("\nerr %s\n", err)
    }
  })
}

cli.responders.ordersNotPayed = function (str) {
  var vli_count    = 0
  console.log('\x1Bc')
  _data.list('orders', function (err, ordersRSet) {
    if (!err && ordersRSet && ordersRSet.length > 0) {
      cli.horizontalLine()
      cli.centered('\x1b[5m[ ORDERS LIST NOT PAYED ]\x1b[0m')
      cli.horizontalLine()
      cli.verticalSpace()

      ordersRSet.forEach(function (orderId) {

        _data.read('orders', orderId, function (err, orderData) {
          if (!err && orderData) {
            var items = orderData.items

            const CantPizzas = items.reduce((contPizzas, nombre) => {
              contPizzas[nombre] = (contPizzas[nombre] || 0) + 1
              return contPizzas
            }, {})

            if ( orderData.payed == false && orderData.mail_sent  == false) {
              vli_count = vli_count + 1

              _data.read('users', orderData.userId, function (err, userData) {
                if (!err && userData) {
                  var strCliente           = '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress
                  strCliente+=' '

                  var strRedTotal = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                  var strPayed    = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
                  var line        = '\n\t\x1b[0m\x1b[33mOrder Id:\x1b[0m ' + orderData.id + '\x1b[0m\n\t\x1b[33mClient : \x1b[0m\x1b[32m' + userData.name.toUpperCase() + '\n\t\x1b[33mAddress:\x1b[0m ' + userData.streetAddress + '\n\t\x1b[33me-mail:\x1b[0m\x1b[32m '+ userData.emailAddress + '\t\x1b[33mPhone:\x1b[0m '+ userData.phone + '\n\t\x1b[33m payed : \x1b[0m' + strPayed +  orderData.payed  + '\t\t\x1b[0m\x1b[33m mail_sent :\x1b[0m' + strPayed  + orderData.mail_sent  + '\n\n\t\t\x1b[0m\x1b[33mItems :\x1b[0m' + strPayed + JSON.stringify(CantPizzas) + '\n\n\t\x1b[0m\x1b[33m Gran Total : \x1b[0m' + strRedTotal + ' $'+ orderData.totalPrice.toFixed(2) + ' USD \n\t\t\x1b[0m'

                  delete userData.hashedPassword
                  console.log(line)

                }
              })

            }

          }

        })
      })

    } else {
      console.log("\nerr %s\n", err)
    }
  })
}

cli.responders.orderOrderInfo = function (str) {
  console.log('\x1Bc')
  var vli_count = 0
  var arrStr    = str.split('--')
  var orderId   = typeof(arrStr[1]) == 'string' &&  arrStr[1].trim().length > 0 ? arrStr[1].trim() : ''

  // Get the ID from the string variable
  if (orderId) {
    // Create a header for the stats
    cli.horizontalLine()
    cli.centered('\x1b[5m[ ORDER DETAILED INFO ]\x1b[0m')
    cli.horizontalLine()
    cli.verticalSpace(2)
    // Lookup the user
    _data.read('orders', orderId, function (err, orderData) {
      if (!err && orderData) {
        // Print the JSON with text highlighting
        /* console.dir(orderData, {'colors': true}) */
        var items            = orderData.items
        const CantPizzas     = items.reduce((contPizzas, nombre) => {
          contPizzas[nombre] = (contPizzas[nombre] || 0) + 1
          return contPizzas
        }, {})

        _data.read('users', orderData.userId, function (err, userData) {
          if (!err && userData) {
            var strCliente  = '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress
            strCliente      += ' '

            var strRedTotal = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
            var strPayed    = orderData.mail_sent && orderData.payed ? '\x1b[32m' : '\x1b[31m\x1b[5m'
            var line        = '\n\t\x1b[33mOrder Id:\x1b[0m ' + orderData.id + '\x1b[0m\n\t\x1b[33mClient : \x1b[0m\x1b[32m' + userData.name.toUpperCase() + '\n\t\x1b[33mAddress:\x1b[0m ' + userData.streetAddress + '\n\t\x1b[33me-mail:\x1b[0m\x1b[32m '+ userData.emailAddress + '\t\x1b[33mPhone:\x1b[0m\x1b[32m '+ userData.phone + '\n\t\x1b[33m payed : \x1b[0m' + strPayed +  orderData.payed  + '\t\t\x1b[0m\x1b[33m mail_sent :\x1b[0m' + strPayed  + orderData.mail_sent  + '\n\n\t\t\x1b[0m\x1b[33mItems :\x1b[0m' + strPayed + JSON.stringify(CantPizzas) + '\n\n\t\x1b[0m\x1b[33m Gran Total : \x1b[0m' + strRedTotal + ' $'+ orderData.totalPrice.toFixed(2) + ' USD \n\t\t\x1b[0m'

            delete userData.hashedPassword

            vli_count = vli_count + 1
            console.log(line)

            cli.verticalSpace(1)
            cli.horizontalLine()

          }
        })

        cli.verticalSpace(1)
        // End wit anothe horizontal line
        cli.horizontalLine()
      } else {
        console.log('\n\t\x1b[33mTo avoid the err : [ %s ]\x1b[32m\x1b[5m\n\n\t PLEASE PROVIDE AN VALID [\x1b[33m orderId \x1b[32m] \n\n\x1b[0m', err)
      }
    })
  } else {
    console.log('\n\t\x1b[33mPlease provide an valid orderid not an empty value\n\x1b[0m')
  }

}

// List Users
cli.responders.listUsers = function () {
  console.log('\x1Bc')
  _data.list('users', function (err, userIds) {
    var vli_count = 0
    if (!err && userIds && userIds.length > 0) {

      // Create a header for the stats
      cli.horizontalLine()
      cli.centered('\x1b[5m[ LIST USERS ]\x1b[0m')
      cli.horizontalLine()
      cli.verticalSpace(2)

      userIds.forEach(function (userId) {

        _data.read('users', userId, function (err, userData) {
          if (!err && userData) {
            var line           = '\n\t\x1b[33mId:\x1b[0m '+userData.id+ '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress
            vli_count+= 1
            delete userData.hashedPassword

            line+=' '

            console.log(line)

            if ( vli_count == userIds.length) {
              cli.verticalSpace(1)
              cli.horizontalLine()
            }

          }
        })
      })

    } else {
      console.log("\nerr %s\n", err)
    }
  })
}

// More user info
cli.responders.moreUserInfo = function (str) {
  var arrStr   = str.split('--')
  var email    = typeof(arrStr[1]) == 'string' &&  arrStr[1].trim().length > 0 ? arrStr[1].trim() : ''
  var userId   = helpers.hash(email)

  // Get the ID from the string variable.
  if ( userId ) {
    // Lookup the user
    _data.read('users', userId, function (err, userData) {
      var line           = '\n\t\x1b[33mName:\x1b[0m '+userData.name+'\n\t\x1b[33mAddress:\x1b[0m '+userData.streetAddress+'\n\t\x1b[33mPhone: \x1b[0m'+userData.phone+'\n\t\x1b[33memailAddress: \x1b[0m' + userData.emailAddress

      if (!err && userData) {
        // Create a header for the stats
        cli.horizontalLine()
        cli.centered('\x1b[5m[ MORE USER INFO ]\x1b[0m')
        cli.horizontalLine()
        cli.verticalSpace(2)

        // Remove the hashed password.
        delete userData.hashedPassword

        // Print the JSON with text highlighting.
        /* console.dir(userData, {'colors': true}) */
        console.log(line)

        cli.verticalSpace(1)
        // End wit anothe horizontal line.
        cli.horizontalLine()
      } else {
        console.log('\nTo avoid the err : [ %s ]\n\n\tPlease provide an valid userid\n\n', err)
      }

    })

  } else {
    console.log('\nPlease provide an valid userid not an empty value\n')
  }
}

cli.responders.clearScreen = () => {
  console.log('limpiando')
  /* console.log('\033c') */
  /* process.stdout.write('\x1B[2J\x1B[0f') */
  /* process.stdout.write('\x1Bc') */
  console.log('\x1Bc')
}

// Exit
cli.responders.exit = function(){
  console.log("You asked to exit, so \x1b[45m\x1b[5m¡BYE!\x1b[0m")
  process.exit(0)
}

// Input processor
cli.processInput = function (str) {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    console.log('\x1Bc')
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'menu items',
      'list orders',
      'more order info',
      'list users',
      'more user info',
      'clear',
      'exit'
    ]

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false
    var counter    = 0

    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true
        // Emit event matching the unique input, and include the full string given
        e.emit(input, str)
        return true
      }
    })
    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry \x1b[45m\x1b[5mTry again\x1b[0m")
    }

  } else { console.log('\n\tPlease write something\n') }
}

// Init script
cli.init = function () {
  console.log('\x1Bc')
  // Send to console, in dark blue
  console.log('\x1b[45m%s\x1b[0m','\nThe CLI is running')

  // Start the interface
  var _interface = readline.createInterface({
    input  : process.stdin,
    output : process.stdout,
    prompt : '\n>_ '
  })

  // Create an initial prompt
  _interface.prompt()

  // Handle each line of input separately
  _interface.on('line', function (str) {
    // Send to the input processor
    cli.processInput(str)
    // Re-initialize the prompt afterwards
    _interface.prompt()
  })

  _interface.on('pause', () => {
    console.log('\n\t\t[Readline paused]\n')
  })

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function () {
    console.log('\n\tYou have use Kill -9 , or CTRL + D Command!, ADIOS!\n')
    process.exit(0)
  })

}

// Export the module
module.exports = cli
