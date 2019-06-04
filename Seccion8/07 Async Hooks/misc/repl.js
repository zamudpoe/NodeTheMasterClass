/*
  Example REPL Server
    Take in the word 'fizz' and Log Out 'buzz'
*/

/* Dependencies */
const repl = require('repl')

/* Start the REPL Server */
const replServer = repl.start({
  'prompt': '\nDime>_ ',
  'eval'  : (str) => {
    // Evaluation function for incoming inputs
    console.log('\nAt the evaluation stage: ', str)

    if (str.indexOf('fizz') > -1) {
      console.log('buzz')
    }

  }
})


// Definimos nuestro comando REPL .sayhello nombre
replServer.defineCommand('sayhello', {
  help: 'Say hello',
  action (name) {
    this.clearBufferedCommand()
    console.log(`\n\tHello, ${name}!\n`)
    this.displayPrompt()
  }
})

// Definimos nuestro comando REPL .saybye
replServer.defineCommand('saybye', {
  help: 'Di Adios!',
  action () {
    console.log('\n\tGoodbye!\n')
    process.exit()
  }

})

// Cuando le demos Ctrl + C, le estamos dando un kill
replServer.on('exit', () => {
  console.log("\n\tReceive 'exit' event from repl\n")
  process.exit()
})
