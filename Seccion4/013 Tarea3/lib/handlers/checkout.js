/*
*** JSON API Handlers for fcheckout actions
*/
// Dependencies
var _data           = require('../data')
var config          = require('../config')
var tokenHelper     = require('../helpers/token')
var genericHelper   = require('../helpers/generic')

// Define the checkoutHandler
var checkoutHandler = {}

// Checkout
checkoutHandler.checkout = function (data, callback) {
  var acceptableMethods = ['post']
  if (acceptableMethods.indexOf(data.method) > -1) {
    checkoutHandler._checkout[data.method](data, callback)
  } else {
    callback(405)
  }
}

// Container for the checkout submethod
checkoutHandler._checkout = {}

// Checkout - post
// Required data on header  : token, userIdentifier
// Required data on payload : token, orderId
// Optional data : none
checkoutHandler._checkout.post = function (data, callback){
  console.log("data: %o", data.headers.token)
  // Get tokenId and userIdentifier from header
  var token          = typeof(data.headers.token) == 'string' ? data.headers.token : false
  var userIdentifier = typeof(data.headers.userid) == 'string' ? data.headers.userid : false

  if (token && userIdentifier) {
    tokenHelper.verifyToken(token, userIdentifier, function (tokenIsValid) {
      if (tokenIsValid) {
        // Let's get the order id that user wants to checkout
        var orderId = typeof(data.payload.orderId) == 'string' && data.payload.orderId.trim().length == 20 ? data.payload.orderId.trim() : false;
        // Let's get the stripe token from the body
        var stripeToken = typeof(data.payload.stripeToken) == 'string' && data.payload.stripeToken.trim().length > 0 ? data.payload.stripeToken : false;
        if (orderId && stripeToken) {
          _data.read('orders', orderId, function (err, orderData) {
            if (!err && orderData) {
              if (orderData.userId == userIdentifier) {
                var stripeRequestObject = {
                  amount     : (orderData.totalPrice*100),
                  currency   : 'usd',
                  description: (userIdentifier+'_'+token+'_'+Date.now()),   //userData.name+'_'+Date.now(),
                  source     : stripeToken
                }
                genericHelper.sendRequest('https', '443', 'api.stripe.com', 'POST', '/v1/charges',
                'application/x-www-form-urlencoded', ('Bearer ' + config.stripe.secretApiKeyTest), 5, stripeRequestObject, function (err, data) {
                  if (err && data) {
                    //There was a problem placing the charge via stripe, let's alert the user via email the user and return server error.
                    orderData.payed = false
                  } else {
                    //There wasn't any error and charge have been applied through stripe, now let's update the order status and send email to the user afterwards.
                    orderData.payed = true
                  }

                  var emailRequestObject = {
                    'from'   : 'Furio Zamudio <info@'+config.mailgun.domain+'>',
                    'to'     :  config.personalInfo.email ,      /* 'engel_zamudio@icloud.com', */ // <- Your email account  config.email
                    'subject': 'Order No [' + orderData.id +']',
                    'text'   : 'Dear user ('+ userIdentifier +'), the order with a total amout of $' + orderData.totalPrice + ' was made by yourself.'
                  }

                  genericHelper.sendRequest('https', '443', 'api.mailgun.net', 'POST', '/v3/'+config.mailgun.domain+'/messages',
                  'application/x-www-form-urlencoded', ('Basic ' + Buffer.from(('api:'+ config.mailgun.ApiKeyTest)).toString('base64')), 5, emailRequestObject, function (err, data) {
                    if (!err) {
                      orderData.mail_sent = true
                    } else {
                      console.log("There was an error sending the email to the user.")
                    }
                    _data.update('orders', orderId, orderData, function (err) {
                      if (!err) {
                        callback(200, {"success": "order has been payed"})
                      } else {
                        callback(500, {'Error': 'There was an error updating the user\'s order.'})
                      };
                    });
                  });
                });
              } else {
                callback(403, {'Error': 'The identified user is not authorized to perform this action.'});
              }
            } else {
              callback(500, {'Error': 'There was an error obtaining the data of the order.'});
            }
          });
        } else {
          callback(400, {'Error': 'Can\'t proceed the operation, there are missing fields, stripe token and/or orderId, please try again.'});
        }
      } else {
        callback(403, {'Error': 'Missing required token in header, or token is invalid. Please try to login again.'});
      }
    });
  } else {
    callback(403, {'Error': 'Missing required token or userIdentifer in header. Please try again.'});
  }
}

module.exports = checkoutHandler
