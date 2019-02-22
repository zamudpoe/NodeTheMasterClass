/*
 * Request Handlers
 *
 */

// Dependencies
var _data         = require('../data')
var genericHelper = require('../helpers/generic')
/* var config  = require('./config'); */

// Define all the handlers
var handlers = {}

// Tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post','get','put','delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for all the tokens methods
handlers._tokens  = {}

// Tokens - post
// Required data: emailAddress, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
  /* var phone    = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false */
  var emailAddress = typeof(data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 && data.payload.emailAddress.indexOf('@') > -1 ? data.payload.emailAddress.trim() : false
  var password     = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

  if (emailAddress && password) {

    var userIdentifier = genericHelper.hash(emailAddress)

    if (userIdentifier) {
      _data.read('users', userIdentifier, function (err, userData) {
        if (!err && userData) {

          // Hash the sent password, and compare it to the password stored in the user object
          var hashedPassword = genericHelper.hash(password)
          if (hashedPassword == userData.hashedPassword) {
            // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
            var tokenId     = genericHelper.createRandomString(20)
            var expires     = Date.now() + 1000 * 60 * 60
            var tokenObject = {
              'userIdentifier': userIdentifier,
              'id'          : tokenId,
              'expires'     : expires
            }

            // Store the token
            _data.create('tokens', tokenId, tokenObject, function (err) {
              if (!err){
                callback(200, tokenObject)
              } else {
                callback(500, {'Error' : 'Could not create the new token'})
              }
            })
          } else {
            callback(400, {'Error' : 'Password did not match the specified user\'s stored password'})
          }
        } else {
          callback(400, {'Error' : 'Could not find the specified user.'})
        }
      })
    } else {
      // User alraedy exists
      callback(500, {'Error' : 'There was a problem creating the new user, please try again.'})
    }

    // Lookup the user who matches that phone number

  } else {
    callback(400, {'Error' : 'Missing required field(s).'})
  }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // Check that id is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback (200, tokenData)
      } else {
        callback (404)
      }
    })
  } else {
    callback (400, {'Error' : 'Missing required field, or field invalid'})
  }
}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback){
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){
    // Lookup the existing token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()){
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens',id,tokenData,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not update the token\'s expiration.'});
            }
          });
        } else {
          callback(400,{"Error" : "The token has already expired, and cannot be extended."});
        }
      } else {
        callback(400,{'Error' : 'Specified user does not exist.'});
      }
    });
  } else {
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback){
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


// Export the handlers
module.exports = handlers
