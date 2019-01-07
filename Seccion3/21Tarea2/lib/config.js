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
  }
}

// Production environments
environments.production = {
  'httpPort'     : 5000,
  'httpsPort'    : 5001,
  'envName'      : 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecks'    : 5,
  'twilio'       : {
    'accountSid' : envJSON[0].twilio.accountSid,
    'authToken'  : envJSON[0].twilio.authToken,
    'fromPhone'  : '+15005550006'
  }
}

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport
