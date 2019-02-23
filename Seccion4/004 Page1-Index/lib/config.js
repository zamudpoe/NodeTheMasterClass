/*
*** Create and export configuration variables
*/
// Container for all environments
var environments = {};

// Staging (default) environment
/*
  NOTA: Hay que crearnos una cuenta en twilio par obtener
    accountSid
    authToken
    fromPhone
    pero usaremos la proporcionadas por el instructor en su cuenta de github
    https://github.com/pirple/The-NodeJS-Master-Class/blob/master/Section%203/FINAL/lib/config.js
      'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
      'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
      'fromPhone' : '+15005550006'
*/
environments.desarrollo = {
  'httpPort'     : 3000,
  'httpsPort'    : 3001,
  'envName'      : 'desarrollo',
  'hashingSecret': 'thisIsASecret',
  'maxChecks'    : 5,
  'twilio' : {
    'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone' : '+15005550006'
  },
  'templateGlobals' : {
    'appName'    : 'UptimeChecker',
    'companyName': 'NotARealCompany, Inc.',
    'yearCreated': '2018',
    'baseUrl'    : 'http://localhost:3000/'
  }
}


// Production environment
/**
  'accountSid' : 'ACc471f3b1ec8b4d370f480ea585cdcbb5',
  'authToken' : '1bfb7bbda602c953982a55c027f084c1',
  'fromPhone' : '+15005550006'  <--- Este numero debe ser un numero comprado y debe coincidir con el accountSid y authToken
*/
environments.produccion = {
  'httpPort'     : 5000,
  'httpsPort'    : 5001,
  'envName'      : 'produccion',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecks'    : 10,
  'twilio' : {
    'accountSid': 'ACc471f3b1ec8b4d370f480ea585cdcbb5',
    'authToken' : '1bfb7bbda602c953982a55c027f084c1',
    'fromPhone' : '+522281944928'
  },
  'templateGlobals' : {
    'appName'    : 'UptimeChecker',
    'companyName': 'NotARealCompany, Inc.',
    'yearCreated': '2018'
  }
}

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the current environment is one of the environments above, if not default to desarrollo
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.desarrollo

// Export the module
module.exports = environmentToExport

/* nodemon -e js NODE_ENV=desarrollo node index.js */
