/*
 * CLI-related tasks
*/

// Dependencies
var readline = require('readline')
var util     = require('util')
var debug    = util.debuglog('cli')

var events   = require('events')
class _events extends events {}
var e        = new _events()

// Instantiate the cli module object
var cli      = {}

// Input processor
cli.processInput = function (str) {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'pirple',
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false
    var counter    = 0

    uniqueInputs.some(function(input){
      /* console.log("input: ", input) */
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true

        // Emit event matching the unique input, and include the full string given
        e.emit(input, str)
        return true
      }
    })

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("\n\tSorry, try again!")
    }

  } else { console.log('\n\tPlease write something\n') }
}

// Init script
cli.init = function () {
  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m','\nThe CLI is running')

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

    if (str == 'pirple') {
      _interface.question('What do you think about the course of Pirple The node Js Master Class? ', (answer) => {
        console.log(`\nThank you for your valuable feedback: ${answer}\n`)
        _interface.close()
      })
    }

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
