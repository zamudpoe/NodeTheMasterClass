/*
 * Request Handlers
*/
// Dependencies
var _data    = require('./data')
var helpers  = require('./helpers')
var config   = require('./config')

// Defininimos el contenedor general de todos los handlers
var handlers = {}

// Index Handler
/*
handlers.index = function (data, callback) {
  if (data.method == 'get') {
    helpers.getTemplate('index', function (err, str) {
      if (!err && str) {
        callback(200, str, 'html')
      } else {
        helpers.getTemplate('notfound', function (err, str) {
          if (!err && str) {
            callback (404, str, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      }
    })
  } else {
    callback(405,undefined,'html')
  }
}
*/

handlers.index = function (data, callback) {
  // Reject any request that isn't a GET
  if (data.method == 'get') {
    // Prepare data for interpolation
    var templateData = {
      'head.title'      : 'Uptime Monitoring - Made Simple',
      'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we will send you a text to let you know. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et congue leo. Donec non congue arcu, quis rutrum ipsum. Sed ipsum tellus, pretium et orci ut, ultricies venenatis metus. Sed faucibus orci eget viverra feugiat. Vestibulum eu enim vel odio rutrum ultrices. Aliquam suscipit magna sit amet leo elementum maximus at at urna. Etiam facilisis ornare augue, non pulvinar nisl aliquam sed. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi eu felis lacus. In tristique vel erat porta auctor. Donec at turpis efficitur, vehicula est non, pharetra est.',
      'body.class'      : 'index'
    };

    // Read in a template as a string
    helpers.getTemplate('index', templateData, function (err, IndexString) {
      if (!err && IndexString) {
        /* console.log(IndexString) */
        // Add the universal header and footer
        helpers.addUniversalTemplates(IndexString, templateData, function (err, FullHTMLString) {
          /* console.log(FullHTMLString) */
          if (!err && FullHTMLString) {
            // Return that page as HTML
            callback(200, FullHTMLString, 'html')
          } else {
            callback(500, undefined, 'html')
          }
        })
      } else {
        callback(500, undefined,'html')
      }
    })
  } else {
    callback(405, undefined, 'html')
  }

}

//                                                                   ping handler
handlers.ping = function (data, callback) {
  var metodo    = data.method.toUpperCase()
  /* console.dir(data, {'colors': true} ) */
  data.method == 'get' ?  callback (201, {'EXITO' : '['+metodo+'] Ruta Ping '}, 'json') : callback (404, {'error' : 'METODO ['+metodo+'] NO PERMITIDO en Ruta Ping'}, 'json')
}

//                                                                   Cobranza handler
handlers.cobranza = function (data, callback) {
  var metodo    = data.method.toUpperCase()

  /* console.log('DATA \n%o', data) */
  metodo == 'get' ? callback(206,  {'EXITO':'['+metodo+'] cobranza handler'}, 'json') : callback(404, {'name':'METODO ['+metodo+'] NO PERMITIDO en Ruta Cobranza'}, 'json')
}

//                                                                   Ola handler
handlers.ola = function (data, callback) {
  var metodo    = data.method.toUpperCase()

  metodo == 'get' ? callback(201, {'EXITO':'K ASE?, Haciendo Solicitud ['+metodo+']!, o K ASE?'}, 'json') : callback (404, {'name':'K ASE?, Averigaundo que este metodo ['+metodo+'] no esta permitido o K ASE?'}, 'json')
}

//                                                                   Testing handler
handlers.testing = function (data, callback) {
  var metodo    = data.method.toUpperCase()
  metodo == 'get' ? callback (200, data, 'json') : callback (404,{'name':'METODO ['+metodo+'] NO PERMITIDO en Ruta testing'} , 'json')
}

//                                                                   Not found handler
handlers.notFound = function (data, callback) {
  callback (404, undefined, 'json')
}

//                                                                   Favicon handler
handlers.favicon = function (data, callback) {
  if (data.method == 'get') {

    helpers.getStaticAsset ('favicon.ico', function (err, data) {
      if (!err && data) {
        callback (200, data, 'favicon')
      } else {
        callback (500)
      }
    })
  } else {
    callback (405)
  }

}

//                                                                    Public Assets
handlers.public = function (data, callback) {
  if (data.method == 'get') {
    // Get the filename being requested
    var trimmedAssetName = data.trimmedPath.replace('public/', '').trim()
console.log(trimmedAssetName)
    if ( trimmedAssetName.length > 0 ) {
      helpers.getStaticAsset (trimmedAssetName, function (err, data) {
        if (!err && data) {
          // Determine the content type (default to plain text )
          var contentType = 'plain'

          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css'
          }

          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png'
          }

          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg'
          }

          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon'
          }

          callback (200, data, contentType)

        } else {
          callback (404)
        }
      })
    }

  } else {
    callback (405)
  }

}

/*
  ::::::::::::::::::::::::::::::::::::::[ U S E R S ]:::::::::::::::::::::::::::::::::::::::
*/
/* Contenedor para controlar todos los metodos "Permitidos y No Permitidos" de users */
handlers._users  = {}

//                                                                   USERS - Validacion de Metodos
handlers.users = function ( data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete']

  if (acceptableMethods.indexOf(data.method) > -1) {
    console.log('\n\t( ( ( ( ( Metodo [' + data.method + '] ACEPTADO! ) ) ) ) )\n')
    handlers._users[data.method](data, callback)
  } else {
    console.log('\n\t[ [ [ [ [ Metodo <%s> RECHAZADO ] ] ] ] ]', data.method)
    callback(405, {"error":"[405] Method Not Allowed"}) // <--- Codigo para metodo no permitido
  }
}

//                                   S  U  B    M E T O D O S
//                                                                   USERS - GET
// Required data: 'phone' en el queryparameter y 'token' en el header
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
// MODO DE USO:
/**
 * En postman hacemos una consulta GET a :
 *
 *    localhost:5000/users?phone=2281944928
 *    localhost:3000/users?phone=2281944928
 */
handlers._users.get = function (data, callback) {
  // Check that phone number is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    // Get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {
          if (!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field'})
  }
}

//                                                                   USERS - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
/* MODO DE USO: ???????
  Una vez levantado el servidor HTTP o HTTPS
  EN POSTMAN hacer un request POST con este raw body
  {
    "firstName":"Engelbert",
    "lastName":"Zamudio",
    "phone":"2281944928",
    "password":"thisIsAlsoASecret",
    "tosAgreement":true
  }
*/
handlers._users.post = function (data, callback) {
  // Validamos que todos los campos requeridos sean proporcionados
  var firstName    = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName     = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone        = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password     = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  // Verificamos los valores de las variables.
  console.log("\nfirstName : %s, lastName: %s, phone: %s, password: %s, tosAgreement: %s", firstName, lastName, phone, password, tosAgreement)

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure the user doesnt already exist
    _data.read('users', phone, function (err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword){
          var userObject = {
            'firstName'     : firstName,
            'lastName'      : lastName,
            'phone'         : phone,
            'hashedPassword': hashedPassword,
            'tosAgreement'  : true
          };

          // Store the user
          _data.create('users', phone, userObject, function (err) {
            if (!err) {
              callback(200, {'exito' : 'USUARIO [ ' + userObject.firstName + ' ' + userObject.lastName  + ' ] CREADO EXITOSAMENTE! '});
            } else {
              console.log(err)
              callback(500, {'Error' : 'No puedo crear el nuevo usuario'});
            }
          })

        } else {
          callback(500, {'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400, {'Error' : 'Ya existe un usuario con ese telefono'});
      }
    })

  } else {
    callback(400, {'Error' : 'Faltan campos requeridos '});
  }

}

//                                                                   USERS - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = function (data, callback) {
  console.dir(data)
  // Check for required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {

      // Get token from headers
      var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
              // Update the fields if necessary
              if (firstName) {
                userData.firstName = firstName
              }
              if (lastName) {
                userData.lastName = lastName
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password)
              }
              // Store the new updates
              _data.update('users', phone, userData, function (err) {
                if (!err) {
                  callback(200, {"exito": "Usuario [" + firstName + " " + lastName + "] ACTUALIZADO con exito!"})
                } else {
                  callback(500,{'Error' : 'Could not update the user.'})
                }
              });
            } else {
              callback(400,{'Error' : 'Specified user does not exist.'})
            }
          })
        } else {
          callback(403,{"Error" : "Missing required token in header, or token is invalid."})
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'})
    }
  } else {
    callback(400, {'Error' : 'Missing required field.'})
  }

}

//                                                                   USERS - DELETE
// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
/*
  PARA PROBARLO necesitamos en POSTMAN
    1ro realizamos un POST a users y
    2do POST a TOKENS , pasamos el phone y el mismo password para el usuario especifico.
    3ro con el TOKEN generado ahora lo pasamos en el headere con el metodo delete y
        le pasamos por header el token generado en el paso 2.
*/
handlers._users.delete = function(data,callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
      if(tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {

          console.log('ELIMINAREMOS A: %o ', data)

          if (!err && data){
            _data.delete('users', phone, function (err) {
              if (!err){

                console.log('[ EN PROCESO ] Eliminando Usuarios y sus posibles TOKENS existentes')
                _data.delete('tokens', token, function (err) {
                  if (!err) {
                    callback(200, {'Exito' : 'Usuario: ' + data.firstName + ' ' + data.lastName + ' y TOKEN [ ' + token + ' ] ELIMINADO Exitosamente!.'});
                  } else {
                    callback(500,{'Error' : 'No es posible ELIMINAR TOKEN [' + token +  '] del usuario ['+ data.firstName + ' ' + data.lastName + '].'});
                  }
                });

              } else {
                callback(500,{'Error' : 'No es posible ELIMINAR al usuario especificado!.'});
              }
            });



          } else {
            callback(400,{'Error' : 'no puedo encontrar  al usuario especiicado'});
          }
        })

      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
}

/* ::::::::::::::::::::::::::::::::::::::::::::::::::::::[  T O K E N S  ]:::::::::::::::::::::::::::::::::::::::::::::::::::::: */
//                                                                   Tokens - METODOS Aceptados y Rechazados
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete']

  if (acceptableMethods.indexOf(data.method) > -1) {
    console.log('\n\t\t( ( ( ( ( ¡Metodo para ruta TOKENS [' + data.method + '] ACEPTADO! ) ) ) ) )')
    handlers._tokens[data.method] (data, callback)
  } else {
    console.log('\n\t\t[ [ [ [ [ Metodo <%s> RECHAZADO ] ] ] ] ]', data.method)
    callback(405, {"error":"[405] Metodo " + data.method + "> No Permitido en Ruta (/tokens)"}) // <--- Codigo para metodo no permitido
  }
}

//                                                                   Container for all the tokens methods.
handlers._tokens  = {}

//                                                                   Tokens - POST  - CREAR NUEVO TOKEN
// Required data: phone, password
// Optional data: none
// Modo de Uso  : Con postman hacemos un POST.
// Con el metodo _tokens.post generamos los accesos a usuarios existentes!,
// solo tenemos que pasar en nuestro body request el campo "phone" y el campo "password".
/*
  http://localhost:5000/tokens
  {
  	"phone"   : "2281944928",
  	"password": "TooManySecrets"
  }

  OJO:
    Para saber el password que debemos pasar es el mismo que le pusimos al usuario ,
    si no lo sabemos le hacemos una actualizacion con PUT y le ponemo el mismo password

    http://localhost:5000/users?phone=2281944929

    {
      "firstName"   : "Engelbert",
      "lastName"    : "Zamudio",
      "phone"       : "2281944928",
      "password"    : "TooManySecrets",
      "tosAgreement": true
    }
*/

handlers._tokens.post = function (data, callback) {
  var phone    = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (phone && password) {
    /*
      OJO:
        EZP:  Cuando hacemos POST no estamos controlando que si el Usuario ya tiene un TOKEN no permita crear uno nuevo.
    */

    /*
    _data.readDir('tokens', function (err, files){
      if (!err) {
        console.dir(files)
      } else {
        console.log('No hay archivos: %s', err)
      }
    })
    */

    // Lookup the user who matches that phone number
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password, and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password)

        if (hashedPassword == userData.hashedPassword) {
          // Si es valido, crear un nuevo token con un nombre aleatorio. Establecemos una fecha de expiración en una hora en el futuro.
          var tokenId     = helpers.createRandomString(20)
          var expires     = Date.now() + 1000 * 60 * 60

          var tokenObject = {
            'phone'  : phone,
            'id'     : tokenId,
            'expires': expires
          }

          // Store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback (200, tokenObject)
            } else {
              callback (500, {'Error' : 'No es posible crear el nuevo token'})
            }
          })

        } else {
          callback (400, {'Error' : 'Password [' + password + '] del token proporcionado no hace match con el del usuario almacenado con telefono [ ' + phone + ' ]'})
        }
      } else {
        callback (400, {'Error' : 'No es posible encontrar el usuario proporcionado [' + phone + ' ]'})
      }
    })

  } else {
    callback (400, {'Error' : 'Faltan campos requeridos phone & password'})
  }
}

//                                                                   Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the token
    _data.read('tokens',id, function (err, tokenData) {
      if (!err && tokenData){
        callback(200, tokenData)
      } else {
        callback(404)
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field, or field invalid'})
  }
}

//                                                                   Tokens - put
// Required data: id, extend
// Optional data: none
/*
  Hacemos un PUT :
    http://localhost:5000/tokens

  {
    "id" : "vmz50011vwja2t8udrjn",
    "extend" : true
  }
NOTA: el Id es el nombre de nuestro archivo vmz50011vwja2t8udrjn.json en nuestra carpeta tokens
    cada archivoi es un usaurio validado.
*/
handlers._tokens.put = function (data, callback) {
  var id     = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

  if (id && extend) {
    // Lookup the existing token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        // Revisamos que el token no ha expirado
        if (tokenData.expires > Date.now()) {
          // Configuramos la expiracion a una hora desde ahora.
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Guardamos lo actualizado
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error' : 'No ha sido posible Actualizar el token.'});
            }
          });
        } else {
          callback(400, {"Error" : "El Token ya ha expirado, y no puede ser extendido."});
        }
      } else {
        callback(400, {'Error' : 'Token especificado no existe.'});
      }
    });
  } else {
    callback(400, {"Error": "Campo(s) Requerido(s) Faltante(s) o Campo(s) Invalido(s)."});
  }
}

//                                                                   Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Delete the token
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
}

//                                                                   Tokens - verifyToken
//  Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup the token
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  });
}

/* :::::::::::::::::::::::::::::::::::::::::::::[ C H E C K S ]::::::::::::::::::::::::::::::::::::::::::::: */
//                                                                   Tokens - METODOS Aceptados y Rechazados
handlers.checks = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete']

  if (acceptableMethods.indexOf(data.method) > -1) {
    console.log('\n\t\t( ( ( ( ( ¡Metodo para ruta CHECKS [' + data.method + '] ACEPTADO! ) ) ) ) )\n')
    handlers._checks[data.method] (data, callback)
  } else {
    console.log('\n\t\t[ [ [ [ [ Metodo <%s> RECHAZADO ] ] ] ] ]\n', data.method)
    callback(405, {"error":"[405] Metodo " + data.method + "> No Permitido en Ruta (/checks)"}) // <--- Codigo para metodo no permitido
  }
}

//                                                                   Container for all the checks methods.
handlers._checks = {}

// Checks - get
// Required data: El id del check por querystring y el token por header
// Optional data: none
handlers._checks.get = function(data,callback){
  // Verificamos que el id es valido
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

  if (id) {
    // Buscamos la ruta checks
    _data.read('checks', id, function (err, checkData) {
      if (!err && checkData) {
        // Obtenemos el token que envio la solicitud
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
        // Verify that the given token is valid and belongs to the user who created the check

        /* console.log("Estos son los datos del token: \n %o", checkData) */

        handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
          if (tokenIsValid) {
            // Return check data
            callback (200, checkData)
          } else {
            callback (403, {'Error' : 'TOKEN FALTANTE, INVALIDO o TOKEN EXPIRADO!!'})
          }
        })
      } else {
        callback (404, {"Error" : "Error en la consulta(Check solicitado NO COINCIDE con el almacenado)"})
      }
    });
  } else {
    callback(400, {'Error' : 'Campos Invalido o Campos Requeridos[ id, token ] Faltantes!'})
  }
}

//                                                                   CHECKS - POST
// Required data : protocol, url, method, successCode, timeoutSeconds
// Optional data : none
// Descripcion: Crearemos como maximo 5 check ins por cada usuario validado con su token.
/*
  {
    "protocol"       : "http",
    "url"            : "google.com",
    "method"         : "get",
    "successCodes"   : [200, 201],
    "timeoutSeconds" : 3
  }
*/
handlers._checks.post = function (data, callback) {
  // Validar todos sus Inputs.
  var protocol       = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
  var url            = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
  var method         = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
  var successCodes   = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Lookup the user phone by reading the token
    _data.read('tokens', token, function (err, tokenData) {
      if (!err && tokenData) {
        var userPhone = tokenData.phone
        // Lookup the user data
        _data.read('users', userPhone, function (err, userData) {
          if (!err && userData) {
            var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
            // Verify that user has less than the number of max-checks per user
            if (userChecks.length < config.maxChecks) {
              // Create random id for check
              var checkId = helpers.createRandomString(20)
              // Create check object including userPhone
              var checkObject = {
                'id'            : checkId,
                'userPhone'     : userPhone,
                'protocol'      : protocol,
                'url'           : url,
                'method'        : method,
                'successCodes'  : successCodes,
                'timeoutSeconds': timeoutSeconds
              }
              // Save the object.
              _data.create('checks', checkId, checkObject, function (err) {
                if (!err) {
                  // Add check id to the user's object
                  userData.checks = userChecks
                  userData.checks.push(checkId)
                  // Save the new user data
                  _data.update('users', userPhone, userData, function (err) {
                    if (!err) {
                      // Return the data about the new check
                      callback(201, checkObject);
                    } else {
                      callback(500, {'Error' : 'No puedo actualizar el usuario con el nuevo check.'})
                    }
                  })
                } else {
                  callback(500, {'Error' : 'No puedo crear el nuevo Check'})
                }
              }) /** _data.create('checks'  */
            } else {
              callback(400, {'Error' : 'El Usuario ha alcanzado el maximo de checks (' + config.maxChecks + ').'})
            }
          } else {
            callback(403, {"Error" : "La solicitud ha sido formateada correctamente pero el servidor rechazo proporcionar el recurso solicitado!."})
          }
        })
      } else {
        callback(403);
      }
    })

  } else {
    callback (400, {'300': 'Campos Requeridos Faltantes [ protocol && url && method && successCodes && timeoutSeconds ] o las entradas son invalidas!'})
  }

}


// Checks
// Required data: id por queryparameter y por header el token .
// Optional data:
//                protocol, url, method, successCodes, timeoutSeconds (one must be sent)
/**

  {
    "id"            : "dd"
    "protocol"      : "https",
    "url"           : "yahoo.com",
    "method"        : "put",
    "successCodes"  : [200, 201, 403],
    "timeoutSeconds": 2
  }

*/
handlers._checks.put = function (data, callback) {
  // Check for CAMPOS REQUERIDOS
  var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false

  // Check for CAMPOS OPCIONALES
  var protocol       = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
  var url            = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
  var method         = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
  var successCodes   = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
  var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

  // Error Si el id es invalido
  if (id) {
    // Error Si nada es enviado a ACTUALIZAR
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read('checks', id, function (err, checkData) {
        if (!err && checkData) {
          // Get the token that sent the request
          var token = typeof (data.headers.token) == 'string' ? data.headers.token : false

          // Verificamos que el token proporcionado sea valido y pertenezca a quien creo el check.
          handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
            if (tokenIsValid) {
              // Update check data where necessary
              if (protocol) {
                checkData.protocol = protocol
              }
              if (url) {
                checkData.url = url
              }
              if (method) {
                checkData.method = method
              }
              if (successCodes) {
                checkData.successCodes = successCodes
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds
              }

              // Store the new updates
              _data.update('checks', id, checkData, function (err) {
                if (!err) {
                  callback(200, {'Exito' : 'Check [ ' + id + ' ] para el phone [ ' + checkData.userPhone + ' ] Creado con Exito!, '})
                } else {
                  callback(500, {'Error' : 'Could not update the check.'})
                }
              })
            } else {
              callback(403, {'Error' : 'Token faltante o invalido!.' })
            }
          })
        } else {
          callback(400, {'Error' : 'Check ID did not exist.'})
        }
      })
    } else {
      callback(400, {'Error' : 'Missing fields to update.'})
    }
  } else {
    callback(400, {'Error' : 'Campos Requeridos Faltantes.'})
  }
}

// Checks - delete
// Required data: id como queryParameter y token como HEADER
// Optional data: none
handlers._checks.delete = function (data, callback) {
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : "¡No encontrado!"
  if (id){
    // Lookup the check
    _data.read('checks', id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token that sent the request
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
          if (tokenIsValid) {
            // ELIMINAMOS los datos del check
            _data.delete('checks', id, function (err){
              if (!err) {
                // Buscamos en el objeto del usuario para obtener todos sus checks
                _data.read('users', checkData.userPhone, function (err, userData) {
                  if (!err) {
                    var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                    // Remove the deleted check from their list of checks
                    var checkPosition = userChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition,1);
                      // Re-save the user's data
                      userData.checks = userChecks;
                      _data.update('users', checkData.userPhone, userData, function (err) {
                        if (!err) {
                          callback(200, {'Exito' : 'Id [ '+id+' ] ELIMINADO del objeto del usuario [ ' + checkData.userPhone + ' ] con Exito'})
                        } else {
                          callback(500, {'Error' : 'No puedo ACTUALIZAR el usuario.'})
                        }
                      })
                    } else {
                      callback(500, {"Error" : "No puedo encontrar el check en el Objeto del usuario, por lo tanto no se ELIMINA!."})
                    }
                  } else {
                    callback(500, {"Error" : "No es posible encontrar al usuario que creo el check, por lo tanto no puedo eliminar el check de la lista de checks en el objeto del usuario"})
                  }
                })

              } else {
                callback(500, {"Error" : "No es posible ELIMINAR el Check el check [ "+id+" ]"})
              }
            })
          } else {
            callback(403, {'Error' : 'Token Invalido o Token inexistente!'})
          }
        })
      } else {
        callback (400, {"Error" : "El id [ "+id+" ] del Check especificado no puede ser encontrado en el objeto del usuario [ " + data.payload.phone + " ] o posiblemente no existe el objeto del usuario!, contacte al administrador del sistema!."})
      }
    })
  } else {
    callback (400, {"Error" : "Id [ "+id+" ] Valido Faltante"})
  }
}

// Export the handlers
module.exports = handlers


