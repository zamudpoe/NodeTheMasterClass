/*
 * Create and export configuration variables **
*/

// setup env in json format
var envJSON = require('./../env.config.json')

// Container of all the environments
var environments = {}

// Staging (default) environment
environments.staging = {
  'httpPort'          : 3000,
  'httpsPort'         : 3001,
  'envName'           : 'staging',
  'hashingSecret'     : 'thisIsASecret',
  'maxChecks'         : 5,
  'personalInfo'      : {
    'email'           : 'engelbert.zamudio@cydsa.com'
  },
  'twilio'            : {
    'accountSid'      : envJSON[0].twilio.accountSid,
    'authToken'       : envJSON[0].twilio.authToken,
    'fromPhone'       : '+15005550006'
  },
  'stripe'            : {
    'secretApiKeyTest': envJSON[0].stripe.secretApiKeyTest
  },
  'mailgun'           : {
    'ApiKeyTest'      : envJSON[0].mailgun.ApiKeyTest ,
    'boundary'        : envJSON[0].mailgun.boundary ,
    'domain'          : envJSON[0].mailgun.domain
  },
  'templateGlobals'   : {
    'appName'         : 'Pizzas Feliantoni',
    'companyName'     : 'Pizzas Feliantoni, Inc.',
    'slogan'          : 'Dejate consentir por el sason de mama',
    'mision'          : 'El sason familiar desde 1985 directamente de la cocina de italia de la casa de mama' ,
    'yearCreated'     : '1985',
    'baseUrl'         : 'http://localhost:3000/'
  }
}

// Production environments
environments.production = {
  'httpPort'       : 5000,
  'httpsPort'      : 5001,
  'envName'        : 'production',
  'hashingSecret'  : 'thisIsAlsoASecret',
  'maxChecks'      : 5,
  'personalInfo'   : {
    'email'        : 'engelbert.zamudio@cydsa.com'
  },
  'twilio'         : {
    'accountSid'   : envJSON[0].twilio.accountSid,
    'authToken'    : envJSON[0].twilio.authToken,
    'fromPhone'    : '+15005550006'
  },
  'templateGlobals': {
    'appName'      : 'Pizzas Feliantoni',
    'companyName'  : 'Pizzas Feliantoni, Inc.',
    'slogan'       : 'Dejate consentir por el sason de mama',
    'mision'       : 'El sason familiar desde 1985 directamente de la cocina de italia de la casa de mama' ,
    'yearCreated'  : '1985',
    'baseUrl'      : 'http://localhost:5000/'
  }
}

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport
