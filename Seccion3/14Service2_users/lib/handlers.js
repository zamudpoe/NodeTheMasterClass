/*
 * Request Handlers
 *
 */

// Dependencies
var _data   = require('./data');
var helpers = require('./helpers');

// Define all the handlers
var handlers = {};

// ping handler
handlers.ping = function (data, callback) {
  callback(200, {'name':'Ping handler'});
};

// Cobranza handler
handlers.cobranza = function (data, callback) {
  var metodo    = data.method

  /* console.log('DATA \n%o', data) */

  metodo == 'get' ? callback(206, {'name':'[GET] cobranza handler'}) : callback(206, {'name':'Cobranza [POST]'})
};

// Ola handler
handlers.ola = function (data, callback) {
  var metodo = data.method
  metodo == 'get' ? callback(200, {'name':'K ASE?, Haciendo Solicitud GET!, o K ASE?'}) : callback(200, {'name':'K ASE?, Haciendo Solicitud POST!, o K ASE?'})
};

// Testing handler
handlers.testing = function (data, callback) {
  callback(200, data);
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback('404');
};

/* :::::::::::::::::::::::::::::::::::::::::::::[ U S E R S ]::::::::::::::::::::::::::::::::::::::::::::: */
/* Contenedor para controlar todos los metodos "Permitidos y No Permitidos" de users */
handlers._users  = {};

// Users
handlers.users = function ( data, callback) {
  var acceptableMethods = ['post','get','put','delete']

  if (acceptableMethods.indexOf(data.method) > -1) {
    console.log('\n\t( ( ( ( ( Metodo [' + data.method + '] ACEPTADO! ) ) ) ) )')
    handlers._users[data.method](data, callback)
  } else {
    console.log('\n\t[ [ [ [ [ Metodo <%s> RECHAZADO ] ] ] ] ]', data.method)
    callback(405, {"error":"[405] Method Not Allowed"}) // <--- Codigo para metodo no permitido
  }

}

//                                                                         S  U  B    M E T O D O S
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
// MODO DE USO:
/**
 * En postman hacemos una consulta GET a localhost:5000/users?phone=2281944928
 *
 */
handlers._users.get = function (data, callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Lookup the user
    _data.read('users', phone, function( err, data) {
      if(!err && data){
        // Remove the hashed password from the user user object before returning it to the requester
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// 00 Users - post
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
              console.log(err);
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

};

// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses.
handlers._users.put = function(data,callback){
  // Check for required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName  = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password  = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if (phone){
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Lookup the user
      _data.read('users', phone, function (err, userData) {
        if (!err && userData) {
          // Update the fields if necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the new updates
          _data.update('users',phone,userData,function(err){
            if (!err) {
              callback(200, {'exito' : 'USUARIO [' + userData.firstName + ' ' + userData.lastName  +'] ACTUALIZADO EXITOSAMENTE! '});
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not update the user.'});
            }
          });
        } else {
          callback(400,{'Error' : 'Specified user does not exist.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.'});
  }

};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function(data,callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        _data.delete('users',phone,function(err){
          if(!err){
            callback(200, {'exito' : 'USUARIO [' + data.firstName + ' ' + data.lastName  +'] ELIMINADO EXITOSAMENTE! '});
          } else {
            callback(500,{'Error' : 'No se puede eliminar el usuario especifico'});
          }
        });
      } else {
        callback(400,{'Error' : 'No se puede encontrar al usuario especificado.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Campo Requerido Faltante'})
  }
};

// Export the handlers
module.exports = handlers;


