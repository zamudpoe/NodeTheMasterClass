/*
 * Request Handlers
*/
// Dependencies
var _data   = require('./data')
var helpers = require('./helpers')

// Defininimos el contenedor general de todos los handlers
var handlers = {};

//                                                                   ping handler
handlers.ping = function (data, callback) {
  callback(201, {'name':'Ping handler'});
}

//                                                                   Ola handler
handlers.ola = function (data, callback) {
  var metodo = data.method
  metodo == 'get' ? callback(201, {'name':'K ASE?, Haciendo Solicitud GET!, o K ASE?'}) : callback (200, {'name':'K ASE?, Haciendo Solicitud POST!, o K ASE?'})
}

//                                                                   Not found handler
handlers.notFound = function (data, callback) {
  callback ('404')
}

/* :::::::::::::::::::::::::::::::::::::::::::::[ U S E R S ]::::::::::::::::::::::::::::::::::::::::::::: */
/* Contenedor para controlar todos los metodos "Permitidos y No Permitidos" de users */
handlers._users  = {};

//                                                                   USERS - Validacion de Metodos
handlers.users = function ( data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete']

  if (acceptableMethods.indexOf(data.method) > -1) {
    console.log('\n\t( ( ( ( ( Metodo [' + data.method + '] ACEPTADO! ) ) ) ) )\n')
    handlers._users[data.method](data, callback)
  } else {
    console.log('\n\t[ [ [ [ [ Metodo <%s> RECHAZADO ] ] ] ] ]', data.method)
    callback (405, {"error": "[405] Method Not Allowed"}) // <--- Codigo para metodo no permitido
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
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false

  if (phone) {
    // Get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone,function (err, data) {
          if (!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword
            callback (200, data)
          } else {
            callback (404)
          }
        })
      } else {
        callback (403, {"Error" : "Missing required token in header, or token is invalid."})
      }
    })
  } else {
    callback (400, {'Error' : 'Missing required field'})
  }
}

//                                                                   USERS - POST
// Required data: firstName, lastName, phone, password, activo
// Optional data: none
/* MODO DE USO: ???????
  Una vez levantado el servidor HTTP o HTTPS
  EN POSTMAN hacer un request POST con este raw body
  {
    "phone"   : phone,
    "fullName": fullName,
    "email"   : email,
    "address" : address,
    "password": "TooManySecrets",
    "activo"  : true
  }
*/
handlers._users.post = function (data, callback) {
  // Validamos que todos los campos requeridos sean proporcionados
  var phone    = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var fullName = typeof(data.payload.fullName) == 'string' && data.payload.fullName.trim().length > 0 ? data.payload.fullName.trim() : false
  var email    = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false
  var address  = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  var activo   = typeof(data.payload.activo) == 'boolean' && data.payload.activo == true ? true : false

  // Verificamos los valores de las variables.
  console.log("\nfullName : %s, email: %s, phone: %s, password: %s, activo: %s", fullName, email, phone, password, activo)

  if (phone && fullName && email && address  && password && activo) {
    // Make sure the user doesnt already exist
    _data.read('users', phone, function (err, data) {
      if (err) {
        var hashedPassword = helpers.hash(password)     // Hash the password

        // Create the user object
        if (hashedPassword){
          var userObject = {
            "phone"   : phone,
            "fullName": fullName,
            "email"   : email,
            "address" : address,
            "hashedPassword": hashedPassword,
            "activo"  : activo
          }

          // Store the user
          _data.create('users', phone, userObject, function (err) {
            !err ?  callback (200, {'exito' : 'USUARIO [ ' + userObject.fullName + ' ] CREADO EXITOSAMENTE! '}) : callback (500, {'Error' : 'No puedo crear el nuevo usuario'})
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
  var phone    = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  var fullName = typeof(data.payload.fullName) == 'string' && data.payload.fullName.trim().length > 0 ? data.payload.fullName.trim() : false;
  var email    = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var address  = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (fullName || email || address || password) {

      // Get token from headers
      var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
              // Update the fields if necessary
              if (fullName) {
                userData.fullName = fullName
              }
              if (email) {
                userData.email = email
              }
              if (address) {
                userData.address = address
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password)
              }
              // Store the new updates
              _data.update('users', phone, userData, function (err) {
                if (!err) {
                  callback(200, {"exito": "Usuario [" + fullName + "] ACTUALIZADO con exito!"})
                } else {
                  callback(500,{'Error' : 'Could not update the user [' + fullName + ']'})
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
        le pasamos por queryparam el phone
*/
handlers._users.delete = function(data, callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false

  if (phone) {
    // Get token from headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false

    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, function (err, data) {

          console.log('ELIMINAREMOS A: %o ', data)

          if (!err && data) {
            _data.delete('users', phone, function (err) {
              if (!err) {

                console.log('[ EN PROCESO ] Eliminando Usuarios y sus posibles TOKENS existentes')
                _data.delete('tokens', token, function (err) {
                  if (!err) {
                    callback(200, {'Exito' : 'Usuario: ' + data.fullName + ' y TOKEN [ ' + token + ' ] ELIMINADO Exitosamente!.'})
                  } else {
                    callback(500, {'Error' : 'No es posible ELIMINAR TOKEN [' + token +  '] del usuario ['+ data.fullName + '].'})
                  }
                });

              } else {
                callback(500, {'Error' : 'No es posible ELIMINAR al usuario especificado!.'})
              }
            });



          } else {
            callback(400, {'Error' : 'no puedo encontrar  al usuario especiicado'})
          }
        })

      } else {
        callback(403, {"Error" : "Missing required token in header, or token is invalid."})
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required field'})
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
handlers._tokens    = {}
var trimmedToken    = ""
handlers.TokenExistente  = []

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
      "activo": true
    }
*/


handlers._tokens.post = function (data, callback) {
  var phone           = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  var password        = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  /* OJO: validar que solo permita crear un token por usuario, es decir que si ya existe un token para el usuario no permita crearlo!. */
  if (phone && password) {
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

          /* _data.readDir ('tokens', function (err, tokenFiles) {
            if (!err) {
              console.dir(tokenFiles, { 'colors' : true })
              tokenFiles.forEach ( tokenItem => {
                trimmedToken = tokenItem.replace('.json', '')

                console.dir(trimmedToken, { 'colors' : true })

                _data.readToken('tokens', trimmedToken, function (err, TokenData) {
                  if (!err && TokenData) {
                    console.log('phone %s %s\n', phone, TokenData.phone)
                    if (phone == TokenData.phone) {
                      handlers.TokenExistente.push(TokenData.id)
                      console.log('Ya existe un token [ %s ] para este phone %s ', handlers.TokenExistente, phone)
                    }
                  }
                  else {
                    console.log('NO existen Tokens!')
                  }
                })

              })
            }
          }) */
        } else {
          callback (400, {'Error' : 'Password [' + password + '] del token proporcionado no hace match con el del usuario almacenado con telefono [ ' + phone + ' ]'})
        }
      } else {
        callback (400, {'Error' : 'No es posible CREAR TOKEN ya que no se puede localizar al usuario proporcionado [' + phone + ' ]'})
      }
    })

  } else {
    callback (400, {'Error' : 'Faltan campos requeridos'})
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
    _data.read('tokens', id, function (err, tokenData) {
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
          callback(400, {"Error" : "El Token NO ha expirado, por lo tando no puede ser extendido."});
        } else {
          // Configuramos la expiracion a una hora desde ahora.
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Guardamos lo actualizado
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(201 , {"EXITO" : "Token [" + id + "] actualizado y extendido correctamente a una hora desde ahora!"})
            } else {
              callback(500, {'Error' : 'No ha sido posible Actualizar el Token [ ' + id + ' ]' });
            }
          });
        }
      } else {
        callback(400, {'Error' : 'Token especificado no existe.'});
      }
    });
  } else {
    callback(400, {"Error": "Campo(s) Invalido(s) Id del Token faltante ó se ha pasado falso para el Extend"});
  }
}

//                                                                   Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the token
    _data.read('tokens',id,function (err, tokenData) {
      if (!err && tokenData) {
        // Delete the token
        _data.delete('tokens', id, function (err) {
          if (!err) {
            callback(200 , {'EXITO' : 'Token [ ' + id + ' ] ELIMIINADO Exitosamente!'})
          } else {
            callback(500, {'Error' : 'Could not delete the specified token'})
          }
        })
      } else {
        callback(400, {'Error' : 'Could not find the specified token.'})
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required field'})
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

// Export the handlers
module.exports = handlers


