/*
*** Create and export configuration variables
*/

// Container for all environments
var environments = {};

// Staging (default) environment
environments.desarrollo = {
  'httpPort'     : 3000,
  'httpsPort'    : 3001,
  'envName'      : 'desarrollo',
  'hashingSecret': 'thisIsASecret'
};

// Production environment
environments.produccion = {
  'httpPort'     : 5000,
  'httpsPort'    : 5001,
  'envName'      : 'produccion',
  'hashingSecret': 'thisIsAlsoASecret'
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to desarrollo
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.desarrollo;

// Export the module
module.exports = environmentToExport;
