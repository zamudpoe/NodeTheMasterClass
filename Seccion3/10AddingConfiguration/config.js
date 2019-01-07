/*                                                 *
****  Create and export configuration variables ****
*                                                  */
// Container for all environments
var environments = {};

// Desarollo (default) environment
environments.desarollo = {
  'port'   : 3000,
  'envName': 'desarrollo'
};

// Production environment
environments.production = {
  'port'   : 5000,
  'envName': 'production'
};

// Determinamos que ambiente ha sido pasado por el CLI y si no se paso nada seteamos a nulo o vacio
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Checamos que el ambiente actual sea uno de los ambientes configurados en el archivo de configuracion como un objeto de lo contrario mandamos el objeto desarrollo : environments.desarollo
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.desarollo;

// Exportamos el module
module.exports = environmentToExport;
