/*
  *** CLI-related tasks ***
*/

// Dependencies
var readline = require('readline')
var util     = require('util')
var debug    = util.debuglog('cli')
var events   = require('events')
class _events extends events {}
var e        = new _events()
var os       = require('os')
var v8       = require('v8')
var _data    = require('./data')
var _logs    = require('./logs')

// Instantiate the cli module object
var cli      = {}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: Input handlers
e.on('man', function (str) {
  cli.responders.help()
})

e.on('help', function (str) {
  cli.responders.help()
})

e.on('exit', function(str) {
  cli.responders.exit()
})

e.on('stats', function(str){
  cli.responders.stats()
})

e.on('list users', function(str){
  cli.responders.listUsers()
})

e.on('more user info', function(str){
  cli.responders.moreUserInfo(str)
})

e.on('list checks',function(str){
  cli.responders.listChecks(str)
})

e.on('more check info',function(str){
  cli.responders.moreCheckInfo(str)
})

e.on('list logs',function(){
  cli.responders.listLogs()
})

e.on('more log info',function (str) {
  cli.responders.moreLogInfo(str)
})

e.on('pirple', function(){
  cli.responders.pirple()
})

e.on('clear', () => {
  cli.responders.clearScreen()
})
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: object
cli.responders = {}

// Help / Man
cli.responders.help = function() {
  console.log('\x1Bc')
  console.log("You asked for \x1b[45m\x1b[5mhelp\x1b[0m")
  /* console.log(process.versions) */
  var commands = {
    'exit'                       : 'Kill the CLI (and the rest of the application)',
    'man'                        : 'Show this help page',
    'help'                       : 'Alias of the "man" command',
    'stats'                      : 'Get Statistics on the underlying operating system and resource utilization',
    'list users'                 : 'Show a list of all the registered (undeleted) users in the system',
    'more user info --{userId}'  : 'show details of a specific user',
    'list checks --up --down'    : 'Show a list of all actives checks in the system, including their state. The "--up" and The "--down" flags are both optional',
    'more check info --{checkId}': 'Show details of a specified check',
    'list logs'                  : 'Show alist of all the log files available to be read compresed and uncompresed',
    'more log info --{fileName}' : 'Show details of a specified file',
    'pirple'                     : '',
    'clear'                      : 'clear the screen'
  }

  // Show a header for the help page that is as wide as the screen.
  cli.horizontalLine()
  cli.centered('[ CLI MANUAL ]')
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

// Exit
cli.responders.exit = function(){
  console.log("You asked to exit, so \x1b[45m\x1b[5m¡BYE!\x1b[0m")
  process.exit(0)
}

// Stats
cli.responders.stats = function () {
  console.log('\x1Bc')
  console.log("You asked for stats")

  // Compile an object of stats.
  var stats = {
    'Load Average'                : os.loadavg().join(' '),
    'CPU Count'                   : os.cpus().length,
    'Free Memory'                 : os.freemem(),
    'Current Malloced Memory'     : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory'        : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)'     : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size)*100) + ' %',
    'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit)*100) + ' %',
    'Uptime'                      : os.uptime()+' Secods'
  }

  // Create a header for the stats
  cli.horizontalLine()
  cli.centered('\x1b[5m[ SYSTEM STATISTICS ]\x1b[0m')
  cli.horizontalLine()
  cli.verticalSpace(2)

  // LOG OUT EACH STATS
  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      var value   = stats[key]
      /* var line    = '\x1b[45m\x1b[5m'+key+'\x1b[0m' */
      var line    = '\t'+key+'\x1b[0m'
      var padding = 60 - line.length

      for (i = 0; i < padding; i++) {
        line += ' '
      }
      line += '\x1b[33m\x1b[5m' + value + '\x1b[0m'
      console.log(line)
      cli.verticalSpace()
    }
  }

  cli.verticalSpace(1)

  // End wit anothe horizontal line
  cli.horizontalLine()

}

// List Users
cli.responders.listUsers = function () {
  console.log('\x1Bc')
  _data.list('users', function (err, userIds) {

    if (!err && userIds && userIds.length > 0) {

      // Create a header for the stats
      cli.horizontalLine()
      cli.centered('\x1b[5m[ LIST USERS ]\x1b[0m')
      cli.horizontalLine()
      cli.verticalSpace(2)

      userIds.forEach(function (userId) {
        _data.read('users', userId, function (err, userData) {
          if (!err && userData){
            var line           = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: '
            var numberOfChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0
            line+=numberOfChecks
            console.table(userData)
            console.log("\nuserId: %s", userId)
            console.log(line)

            cli.verticalSpace(1)
            // End wit anothe horizontal line
            cli.horizontalLine()
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
  var arrStr = str.split('--')
  var userId = typeof(arrStr[1]) == 'string' &&  arrStr[1].trim().length > 0 ? arrStr[1].trim() : ''

  // Get the ID from the string variable
  if (userId) {
    // Lookup the user
    _data.read('users', userId, function (err, userData) {
      if (!err && userData) {
        // Create a header for the stats
        cli.horizontalLine()
        cli.centered('\x1b[5m[ MORE USER INFO ]\x1b[0m')
        cli.horizontalLine()
        cli.verticalSpace(2)
        // Remove the hashed password.
        delete userData.hashedPassword
        // Print the JSON with text highlighting
        console.dir(userData, {'colors': true})
        cli.verticalSpace(1)
        // End wit anothe horizontal line
        cli.horizontalLine()
      } else {
        console.log('\nTo avoid the err : [ %s ]\n\n\tPlease provide an valid userid\n\n', err)
      }
    })
  } else {
    console.log('\nPlease provide an valid userid not an empty value\n')
  }
}

// List Checks
cli.responders.listChecks = function (str) {
  console.log("\nHere is the list checks: \n\n")
  // Create a header for the stats
  cli.horizontalLine()
  cli.centered('\x1b[5m[ LIST CHECKS ]\x1b[0m')
  cli.horizontalLine()
  cli.verticalSpace(2)

  _data.list('checks', (err, arrCheckIds) => {

    if (!err && arrCheckIds && arrCheckIds.length > 0) {
      arrCheckIds.forEach ((checkId) => {
        _data.read('checks', checkId, function (err, checkData) {
          var includeCheck = false
          var lowerString = str.toLowerCase()

          // Get the state , default down
          var state = typeof(checkData.state) == 'string' ? checkData.state : 'down'

          // Get State , default to unknown
          var stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown'
          // If the user has specified the state or hsn't especified any state, include the current check accordingly

          if (lowerString.indexOf('--'+state) >-1 || (lowerString.indexOf('--down') == -1 && lowerString.indexOf('--up') == -1 )) {

            var line = '\tID: ' + checkData.id+ ' ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' State: ' + stateOrUnknown

            console.log(line)
            /* cli.verticalSpace() */

          }
        })

      })

    }

  })

}

// More check info
cli.responders.moreCheckInfo = function (str) {
  console.log("You asked for more check info", str)

  var arrStr  = str.split('--')
  var checkId = typeof (arrStr[1]) == 'string' &&  arrStr[1].trim().length > 0 ? arrStr[1].trim() : ''

  // Get the ID from the string variable
  if (checkId) {
    // Lookup the check
    _data.read('checks', checkId, function (err, checkData) {
      if (!err && checkData) {
        // Create a header for the stats
        cli.horizontalLine()
        cli.centered('\x1b[5m[ MORE CHECK INFO ]\x1b[0m')
        cli.horizontalLine()
        cli.verticalSpace(2)

        // Print the JSON with text highlighting
        console.dir(checkData, {'colors': true})

        cli.verticalSpace(1)
        // End wit anothe horizontal line
        cli.horizontalLine()

      } else {
        console.log('\nTo avoid the err : [ %s ]\n\n\tPlease provide an valid checkid\n\n', err)
      }
    })
  } else {
    console.log('\nPlease provide an valid checkid not an empty value\n')
  }

}

// List Logs
cli.responders.listLogs = function () {
  console.log("You asked to list logs")
  // Create a header for the stats
  cli.horizontalLine()
  cli.centered('\x1b[45m\x1b[5m[ LIST LOGS ]\x1b[0m')
  cli.horizontalLine()
  cli.verticalSpace(2)
  _logs.list (true, (err, logFilesNames) => {
    if (!err && logFilesNames && logFilesNames.length > 0) {
      console.dir(logFilesNames)
    }
  })


}

// More logs info
cli.responders.moreLogInfo = function (str) {
  console.log("You asked for more log info", str)
}

// pirple
cli.responders.pirple =  () => {
  console.log("You asked for \x1b[45m\x1b[5mPirple\x1b[0m")
}

cli.responders.clearScreen = () => {
  console.log('limpiando')
  /* console.log('\033c') */
  /* process.stdout.write('\x1B[2J\x1B[0f') */
  /* process.stdout.write('\x1Bc') */
  console.log('\x1Bc')
}

// Input processor
cli.processInput = function (str) {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info',
      'pirple',
      'clear'
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
  }
}

// Init script
cli.init = function () {

  console.log('\x1Bc')
  console.log("\n\t\t\t\x1b[45m\x1b[5mThe CLI is running\n\x1b[0m\n")
  console.log("\t\t\t\x1b[45m\x1b[5mCommand 8 - List Logs\n\x1b[0m\n")

  // Start the interface
  var _interface = readline.createInterface({
    input : process.stdin,
    output: process.stdout,
    prompt: '>_'
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

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function () {
    process.exit(0)
  })

}

// Export the module
module.exports = cli
