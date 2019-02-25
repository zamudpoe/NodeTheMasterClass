/*
 * Frontend Logic for Application
*/

// Container for frontend application
var app = {}

// Config
app.config = {
  'sessionToken' : false
}

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function( headers, path, method, queryStringObject, payload, callback) {

  // Set defaults
  headers           = typeof(headers) == 'object' && headers !== null ? headers : {}
  path              = typeof(path) == 'string' ? path : '/'
  method            = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET'
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {}
  payload           = typeof(payload) == 'object' && payload !== null ? payload : {}
  callback          = typeof(callback) == 'function' ? callback : false
  /* fnCallback        = typeof(fnCallback) == 'function' ? fnCallback : false */

  /* console.dir(payload) */

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?'
  var counter    = 0
  for (var queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if (counter > 1) {
        requestUrl+='&'
      }
      // Add the key and value
      requestUrl+=queryKey+'='+queryStringObject[queryKey]
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest()
  xhr.open(method, requestUrl, true)
  xhr.setRequestHeader("Content-type", "application/json")

  // For each header sent, add it to the request
  for (var headerKey in headers){
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id)
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode       = xhr.status
        var responseReturned = xhr.responseText

        // Callback if requested
        if (callback) {
          try {
            var parsedResponse = JSON.parse(responseReturned)
            callback(statusCode, parsedResponse)
          } catch (e) {
            callback(statusCode, false)
          }

        }
      }
  }

  /* console.log('payload: %o', payload) */

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload)
  xhr.send(payloadString)

}

// Bind the logout button
app.bindLogoutButton = function () {
  document.getElementById("logoutButton").addEventListener("click", function (e) {

    // Stop it from redirecting anywhere
    e.preventDefault()

    // Log the user out
    app.logUserOut()

  })
}

// Log the user out then redirect them
app.logUserOut = function (redirectUser) {
  // Set redirectUser to default to true
  redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true

  // Get the current token id
  var tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id' : tokenId
  }

  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function (statusCode, responsePayload){
    // Set the app.config token as false
    app.setSessionToken(false)

    // Send the user to the logged out page
    if (redirectUser){
      window.location = '/session/deleted'
    }

  })
}

// Bind the logout button
app.bindMakeOrderButton = function () {
  document.getElementById("createOrder").addEventListener("click", function (e) {
    var userIdentifier = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0  ? app.config.sessionToken.userIdentifier.trim() : false
    var idToken        = typeof (app.config.sessionToken.id) == 'string' && app.config.sessionToken.id.trim().length > 0  ? app.config.sessionToken.id.trim() : false

    // Stop it from redirecting anywhere
    e.preventDefault()

    if (userIdentifier) {
      // Fetch the user data
      var headers  = {
        id     : idToken ,
        userid : userIdentifier
      }

      app.client.request( idToken , '/api/users', 'GET', { 'id' : userIdentifier } , undefined, function (statusCode, respUserPayload) {
        if (statusCode == 200) {
          console.log("respUserPayload: %o", respUserPayload)
          if ( respUserPayload.shoppingcart.length > 0 ) {
            if (confirm("Do You Like to place the order for your shopping cart?")) {
              app.client.request(headers, 'order', 'POST', undefined, undefined, function (statusCode, respOrderPayload) {
                if (statusCode == 200) {
                  console.log("respOrderPayload: %o", respOrderPayload)
                  console.log('La orden No. [ ' + respOrderPayload.Order.id + ' ] ha sido creada exitosamente!')
                  window.location = '/shoppingcartList'
                } else {
                  console.log('Error al intentar hacer el post de la orden')
                }
              })
            } else {
              console.info('\n\n\t%cOrder process canceled !\n', 'color: tomato; font-size: 2em')
            }
          }

        } else {
          // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
          console.log('Error al intentar hacer el GET a pi/users')
        }
      })
    } else {
      console.log('There is no user logged in! ')
    }

  })
}


// Bind the forms
app.bindForms = function () {
  if (document.querySelector("form")){

    var allForms = document.querySelectorAll("form");
    for (var i = 0; i < allForms.length; i++){
      allForms[i].addEventListener("submit", function(e) {

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id
        var path   = this.action
        var method = this.method.toUpperCase()

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none'

        // Hide the success message (if it's currently shown due to a previous error)
        if (document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none'
        }

        // Turn the inputs into a payload
        var payload  = {}
        var elements = this.elements

        for (var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement   = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : ''
            var valueOfElement   = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value)
            var elementIsChecked = elements[i].checked

            // Override the method of the form if the input's name is _method
            var nameOfElement    = elements[i].name
            if(nameOfElement == '_method'){
              method = valueOfElement
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method'
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id'
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : []
                  payload[nameOfElement].push(valueOfElement)
                }
              } else {
                payload[nameOfElement] = valueOfElement
              }

            }
          }
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {}

        // Call the API
        app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if (statusCode !== 200) {

            if (statusCode == 403) {
              // log the user out
              app.logUserOut()

            } else {

              // Try to get the error from the api, or set a default error message
              var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again'

              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block'
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload)
          }

        })
      })
    } /* for */
  }
}

// Form response processor
app.formResponseProcessor = function(formId, requestPayload, responsePayload){
  var functionToCall = false
  // If account creation was successful, try to immediately log the user in
  if (formId == 'accountCreate') {

    // Take the emailAddress and password, and use it to log the user in
    var newPayload = {
      'emailAddress': requestPayload.emailAddress,
      'password'    : requestPayload.password
    };

    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
      // Display an error on the form if needed
      if (newStatusCode !== 200) {

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.'

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block'

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload)
        window.location = '/checks/all'
      }
    })
  }
  // If login was successful, set the token in localstorage and redirect the user
  if (formId == 'sessionCreate'){
    app.setSessionToken(responsePayload);
    /* window.location = '/checks/all'; */
    window.location = '/shoppingcartList'
  }

  // If forms saved successfully and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1'];
  if (formsWithSuccessMessages.indexOf(formId) > -1) {
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if (formId == 'accountEdit3') {
    app.logUserOut(false)
    window.location = '/account/deleted'
  }

  // If the user just created a new check successfully, redirect back to the dashboard
  if (formId == 'checksCreate'){
    window.location = '/checks/all';
  }

  // If the user just deleted a check, redirect them to the dashboard
  if (formId == 'checksEdit2'){
    window.location = '/checks/all';
  }

}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
  var tokenString = localStorage.getItem('token')

  if (typeof(tokenString) == 'string') {
    try {
      var token = JSON.parse(tokenString)
      app.config.sessionToken = token

      if (typeof(token) == 'object') {
        app.setLoggedInClass(true)
      } else {
        app.setLoggedInClass(false)
      }

    } catch(e) {
      app.config.sessionToken = false
      app.setLoggedInClass(false)
    }
  }

}

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
  var target = document.querySelector("body")

  if (add) {
    target.classList.add('loggedIn')
  } else {
    target.classList.remove('loggedIn')
  }

}

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
  app.config.sessionToken = token

  var tokenString = JSON.stringify(token)
  localStorage.setItem('token', tokenString)

  if (typeof(token) == 'object') {
    app.setLoggedInClass(true)
  } else {
    app.setLoggedInClass(false)
  }

}

// Renew the token
app.renewToken = function (callback) {
  var currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if (currentToken) {
    // Update the token with a new expiration
    var payload = {
      'id'    : currentToken.id,
      'extend': true,
    };
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function (statusCode, responsePayload) {
      // Display an error on the form if needed
      if (statusCode == 200) {
        // Get the new token details
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
          // Display an error on the form if needed
          if (statusCode == 200) {
            app.setSessionToken(responsePayload)
            callback(false)
          } else {
            app.setSessionToken(false)
            callback(true)
          }
        })
      } else {
        app.setSessionToken(false)
        callback(true)
      }
    })
  } else {
    app.setSessionToken(false)
    callback(true)
  }
}

// Load data on the page
app.loadDataOnPage = function () {
  // Get the current page from the body class
  var bodyClasses  = document.querySelector("body").classList
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false

  // Logic for account settings page
  if (primaryClass == 'index') {

    var btnLoggedIn       =  document.getElementById('btnLoggedIn')
    var btnSignup         =  document.getElementById('btnSignup')
    btnLoggedIn.className == 'cta blue loggedIn' ? btnLoggedIn.classList.add('loggedOut') :   btnLoggedIn.classList.remove('loggedOut')
    btnSignup.className   == 'cta green loggedIn' ? btnSignup.classList.add('loggedOut') :   btnSignup.classList.remove('loggedOut')

  }

  // Logic for account settings page
  if (primaryClass == 'accountEdit') {
    app.loadAccountEditPage()
  }

  // Logic for dashboard page
  if (primaryClass == 'checksList') {
    app.loadChecksListPage()
  }

  // Logic for ordersList page
  if (primaryClass == 'ordersList') {

    app.loadOrdersListPage()
  }

  // Logic for Menu page
  if (primaryClass == 'menuList') {
    app.loadMenuListPage()
  }

  // Logic for check details page
  if (primaryClass == 'checksEdit') {
    app.loadChecksEditPage()
  }

  if (primaryClass == 'shoppingCart' ) {
    app.loadShoppingCartPage()
  }


}

// Load the account edit page specifically
app.loadAccountEditPage = function () {
  // Get the phone number from the current token, or log the user out if none is there
  /* var phone          = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false; */
  var userIdentifier = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0 ? app.config.sessionToken.userIdentifier.trim() : false

  /* console.log("app.config.sessionToken: %o", app.config.sessionToken) */

  if (userIdentifier) {
    // Fetch the user data
    var queryStringObject = {
      'id' : userIdentifier
    }

    /* app.client.request(undefined, "api/users", "GET", undefined, undefined, function (statusCode, responsePayload) { console.log(statusCode, responsePayload ) } ) */
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
      if (statusCode == 200) {
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .fullNameInput").value          = responsePayload.name
        document.querySelector("#accountEdit1 .streetAddressInput").value     = responsePayload.streetAddress
        document.querySelector("#accountEdit1 .displayEmailInput").value      = responsePayload.emailAddress
        document.querySelector("#accountEdit1 .phoneInput").value             = responsePayload.phone

        // Put the hidden email field into both forms
        var hiddenEmailAddressInput = document.querySelectorAll("input.hiddenEmailAddressInput")

        for (var i = 0; i < hiddenEmailAddressInput.length; i++) {
          hiddenEmailAddressInput[i].value = responsePayload.emailAddress
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut()
      }
    })
  } else {
    app.logUserOut()
  }
}

// Load the dashboard page specifically
app.loadChecksListPage = function () {
  // Get the phone number from the current token, or log the user out if none is there
  /* var phone          = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false; */
  var userIdentifier = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0  ? app.config.sessionToken.userIdentifier.trim() : false

  if (userIdentifier) {
    // Fetch the user data
    var queryStringObject = {
      'id' : userIdentifier
    }
    app.client.request(undefined, 'api/users','GET', queryStringObject, undefined, function (statusCode, responsePayload){
      if (statusCode == 200) {

        // Determine how many checks the user has
        var allChecks = typeof(responsePayload.checks) == 'object' && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];

        if(allChecks.length > 0){

          // Show each created check as a new row in the table
          allChecks.forEach(function(checkId){
            // Get the data for the check
            var newQueryStringObject = {
              'id' : checkId
            };
            app.client.request(undefined,'api/checks','GET',newQueryStringObject,undefined,function(statusCode,responsePayload){
              if(statusCode == 200){
                var checkData = responsePayload;
                // Make the check data into a table row
                var table = document.getElementById("checksListTable");
                var tr = table.insertRow(-1);
                tr.classList.add('checkRow');
                var td0 = tr.insertCell(0);
                var td1 = tr.insertCell(1);
                var td2 = tr.insertCell(2);
                var td3 = tr.insertCell(3);
                var td4 = tr.insertCell(4);
                td0.innerHTML = responsePayload.method.toUpperCase();
                td1.innerHTML = responsePayload.protocol+'://';
                td2.innerHTML = responsePayload.url;
                var state = typeof(responsePayload.state) == 'string' ? responsePayload.state : 'unknown';
                td3.innerHTML = state;
                td4.innerHTML = '<a href="/checks/edit?id='+responsePayload.id+'">View / Edit / Delete</a>';
              } else {
                console.log("Error trying to load check ID: ",checkId);
              }
            });
          });

          if (allChecks.length < 5){
            // Show the createCheck CTA
            document.getElementById("createCheckCTA").style.display = 'block';
          }

        } else {
          // Show 'you have no checks' message
          document.getElementById("noChecksMessage").style.display = 'table-row';

          // Show the createCheck CTA
          document.getElementById("createCheckCTA").style.display = 'block';

        }
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
}

// Load the checks edit page  specifically
app.loadChecksEditPage = function(){
  // Get the check id from the query string, if none is found then redirect back to dashboard
  var id = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  if (id) {

    // Fetch the check data
    var queryStringObject = {
      'id' : id
    }

    app.client.request(undefined,'api/checks','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){

        // Put the hidden id field into both forms
        var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for(var i = 0; i < hiddenIdInputs.length; i++){
            hiddenIdInputs[i].value = responsePayload.id;
        }

        // Put the data into the top form as values where needed
        document.querySelector("#checksEdit1 .displayIdInput").value    = responsePayload.id;
        document.querySelector("#checksEdit1 .displayStateInput").value = responsePayload.state;
        document.querySelector("#checksEdit1 .protocolInput").value     = responsePayload.protocol;
        document.querySelector("#checksEdit1 .urlInput").value          = responsePayload.url;
        document.querySelector("#checksEdit1 .methodInput").value       = responsePayload.method;
        document.querySelector("#checksEdit1 .timeoutInput").value      = responsePayload.timeoutSeconds;

        var successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");

        for(var i = 0; i < successCodeCheckboxes.length; i++){
          if(responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1){
            successCodeCheckboxes[i].checked = true;
          }
        }

      } else {
        // If the request comes back as something other than 200, redirect back to dashboard
        window.location = '/checks/all';
      }
    })

  } else {
    window.location = '/checks/all';
  }
}

// Loop to renew token often
app.tokenRenewalLoop = function () {
  setInterval(function () {
    app.renewToken(function(err) {
      if (!err) {
        var fecha   = new Date()
        var FecFull = fecha.getFullYear()+"/"+fecha.getMonth()+"/"+fecha.getDate()+" - "+fecha.getHours()+":"+fecha.getMinutes()+":"+fecha.getSeconds()+":"+fecha.getMilliseconds()

        console.log("%cToken renewed successfully %c[ "+FecFull +" ]", 'color: teal; font-size: 2em;', 'color: tomato;');
      }
    })
  }, 1000 * 60)
}

// Load the Menu page specifically
app.loadMenuListPage = function () {
  // Get the phone number from the current token, or log the user out if none is there
  /* var phone          = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false; */
  var userIdentifier    = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0  ? app.config.sessionToken.userIdentifier.trim() : false
  var idToken           = typeof (app.config.sessionToken.id) == 'string' && app.config.sessionToken.id.trim().length > 0  ? app.config.sessionToken.id.trim() : false

  var arrAddElements    = []
  var arrRemoveElements = []

  /* console.dir(app.config) */

  if (userIdentifier) {
    // Fetch the user data
    var headers  = {
      id     : idToken ,
      userid : userIdentifier
    }
    var putHeaderObject = {
      "userid": headers.userid,
      "id"    : headers.id
    }

    var NoPart = 0

    /* app.client.request(headers , 'menu', 'GET', undefined , undefined, function(statusCode , responsePayload) { console.log(responsePayload) } ) */
    app.client.request(headers, 'menu', 'GET', undefined, undefined, function (statusCode, respMenuPayload) {
      if (statusCode == 200) {
        var menuList = typeof (respMenuPayload) == 'object' && respMenuPayload instanceof Array && respMenuPayload.length > 0 ? respMenuPayload : []

        if (menuList.length > 0) {

          menuList.sort( function (a, b) {
            return (a.id - b.id)
          })

          menuList.forEach(function (elemento) {
            /* console.log(elemento) */
            var table    = document.getElementById("menuListTable")
            var tr       = table.insertRow(-1)
            tr.classList.add('checkRow')
            var td0      = tr.insertCell(0)
            var td1      = tr.insertCell(1)
            var td2      = tr.insertCell(2)
            var td3      = tr.insertCell(3)
            var td4      = tr.insertCell(4)
            var td5      = tr.insertCell(5)

            td0.classList.add('tdId')
            td1.classList.add('tdRemove')
            td2.classList.add('tdNombre')
            td3.classList.add('tdAdd')
            td4.classList.add('tdDesc')
            td5.classList.add('tdPrice')

            td0.innerHTML =  NoPart += 1  /* elemento.id */
            td1.innerHTML = `<input type="button" class="btnRemove" id="js_btnRemove" data-pizza="${elemento.name}" title="Remove item to your shoppingcart!" value="-" >`
            td2.innerHTML = elemento.name
            td3.innerHTML = `<input type="button" class="btnAdd" id="js_btnAdd" data-pizza="${elemento.name}" title="Add Item to your shoppingcart!" value="+" >`
            td4.innerHTML = elemento.displayName
            td5.innerHTML = elemento.price
          })

          document.getElementById("shoppingcartList").style.display = 'block'

        } else {
          document.getElementById("shoppingcartList").style.display = 'none'
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        console.log('NO HAY MENU LIST')
      }

      if ( respMenuPayload.length == NoPart ) {
        arrAddElements    = getElements('#js_btnAdd')
        arrRemoveElements = getElements('#js_btnRemove')

        arrAddElements.forEach((addElement) => {
          addElement.addEventListener("click", function (e) {
            e.preventDefault()

            var bodyPayload = {
              "item" : event.target.getAttribute('data-pizza')
            }

            var pizzaName   = event.target.getAttribute('data-pizza')

            /* console.table(putHeaderObject)
            console.table(bodyPayload) */

            if (confirm("Do You Like to ADD the pizza " + pizzaName +  " to your shopping cart?")) {
              app.client.request (putHeaderObject, 'shoppingcart', 'PUT', undefined, bodyPayload, function (statusShoppingCartCode, respShoppingCartPayload) {
                if (statusShoppingCartCode == 200) {
                  console.log('%c\n\tEUREKAAAA\n\t\tSe ha agregado la especialidad %s  a tu carrito de compra', 'color: teal; font-size: 1.5em; font-weight: bold;', pizzaName)

                } else {
                  console.warn('ERROR [ ' + statusShoppingCartCode + ' ] al conseguir la informacion ')
                }
              })
            }
            else {
              console.log ('NOOOOOO')
            }
          })
        })

        arrRemoveElements.forEach((removeElement) => {
          removeElement.addEventListener("click", function (e) {
            e.preventDefault()

            var bodyPayload = {
              "item" : event.target.getAttribute('data-pizza')
            }

            var pizzaName   = event.target.getAttribute('data-pizza')
            /* debugger */
            console.log('REMOVE -> %s', pizzaName)

            if (confirm("Do You Like to REMOVE the pizza " + pizzaName + " to your shopping cart?")) {
              app.client.request(putHeaderObject, 'shoppingcart', 'DELETE', undefined, bodyPayload, function (statusShoppingCartCode, respShoppingCartPayload) {
                if (statusShoppingCartCode == 200) {
                  console.log('%c\n\tEUREKAAAA\n\t\tSe ha eliminado la especialidad %s  a tu carrito de compra', 'color: teal; font-size: 1.5em; font-weight: bold;', pizzaName)

                } else {
                  console.warn('ERROR [ ' + statusShoppingCartCode + ' ] al conseguir la informacion')
                }
              })
            }


          })
        })

      }


    })

  } else {
    console.log('No existe usuario loggeado! ')
  }
}

// Load the Menu page specifically
app.loadShoppingCartPage = function () {
  var userIdentifier = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0  ? app.config.sessionToken.userIdentifier.trim() : false
  var idToken        = typeof (app.config.sessionToken.id) == 'string' && app.config.sessionToken.id.trim().length > 0  ? app.config.sessionToken.id.trim() : false

  if (userIdentifier) {
    // Fetch the user data
    var headers  = {
      id     : idToken ,
      userid : userIdentifier
    }

    let GranTotal        = 0

    /*app.client.request(headers , 'menu', 'GET', undefined , undefined, function(statusCode , responsePayload) { console.log(responsePayload) } ) */
    app.client.request (headers, 'shoppingcart', 'GET', undefined, undefined, function (statusCode, responsePayload) {
      if (statusCode == 200) {
        let shoppingCartList = typeof (responsePayload) == 'object' && responsePayload instanceof Array && responsePayload.length > 0 ? responsePayload : []
        var myPizzasSet      = new Set(shoppingCartList)
        var NoPart           = 0

        var testing         = 0


        if (shoppingCartList.length > 0) {

          /* Obtenemos la cantidad de pizzas por especialidad en un objeto. accederemos a ella asi CantPizzas["feliantoni"] */
          const CantPizzas = shoppingCartList.reduce((contPizzas, nombre) => {
            contPizzas[nombre] = (contPizzas[nombre] || 0) + 1
            return contPizzas
          }, {})


          myPizzasSet.forEach(function (elemento) {
            app.client.request(headers, 'menu', 'GET', { name:  elemento  }, undefined, function (sCode, respPayload) {

              if (sCode == 200) {
                NoPart += 1

                testing += CantPizzas[elemento]

                console.log("testing: %s", testing)

                var table    = document.getElementById("orderListTable")
                var tr       = table.insertRow(-1)
                tr.classList.add('checkRow')
                var td0      = tr.insertCell(0)
                var td1      = tr.insertCell(1)
                var td2      = tr.insertCell(2)
                var td3      = tr.insertCell(3)
                var td4      = tr.insertCell(4)
                var td5      = tr.insertCell(5)

                td0.classList.add('tdId')
                td1.classList.add('tdPizzaCode')
                td2.classList.add('tdDesc')
                td3.classList.add('tdQty')
                td4.classList.add('tdPrice')
                td5.classList.add('tdSubTotal')

                td0.innerHTML = NoPart
                td1.innerHTML = respPayload[0].name
                td2.innerHTML = respPayload[0].displayName
                td3.innerHTML = CantPizzas[elemento]
                td4.innerHTML = respPayload[0].price
                td5.innerHTML = (CantPizzas[elemento] * respPayload[0].price)
                GranTotal = GranTotal + (CantPizzas[elemento] * respPayload[0].price)

                  /* var trFooter = table.insertRow(-1)
                  var tdFooter = trFooter.insertCell(0)

                  tdFooter.classList.add('tdGTotal')
                  tdFooter.innerHTML = GranTotal */


              } else {
                console.log('There is an error getting data from the server')
              }

            })

            console.log("GranTotal: %s", GranTotal)

          })

        } else {
          console.log('%cShoppingcart empty ', 'color: tomato')
          document.getElementById('jsCreateOrder').style.display = 'none'
          // Show 'you have no items' message
          document.getElementById("noChecksMessage").style.display = 'table-row'
          // Show the createCheck CTA
          document.getElementById("createOrder").style.display = 'block'
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        console.log('NO HAY MENU LIST')
      }

      if ( responsePayload.length > 0 ) {
        console.log('Tienes %s especialidades en tu carrito de compras, con GranTotal por pagar de $ %s', responsePayload.length, testing)

        document.getElementById("jsCreateOrder").addEventListener("click", function (e) {
          e.preventDefault()

          app.client.request( idToken , '/api/users', 'GET', { 'id' : userIdentifier } , undefined, function (statusCode, respUserPayload) {
            if (statusCode == 200) {
              console.log("respUserPayload: %o", respUserPayload)
              if ( respUserPayload.shoppingcart.length > 0 ) {
                if (confirm("Do You Like to place the order for your shopping cart?")) {
                  app.client.request(headers, 'order', 'POST', undefined, undefined, function (statusCode, respOrderPayload) {
                    if (statusCode == 200) {
                      console.table(respOrderPayload)
                      console.log('%cLa orden No. [ ' + respOrderPayload.Order.id + ' ] ha sido creada exitosamente!', 'color: teal; fotn-size: 1.2rem;')
                      window.location = '/orders/all'
                    } else {
                      console.log('Error al intentar hacer el post de la orden')
                    }
                  })
                } else {
                  console.info('\n\n\t%cOrder process canceled !\n', 'color: tomato; font-size: 2em')
                }
              } else {
                console.log('Shopping cart empty!')
              }

            } else {
              // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
              console.log('Error al intentar hacer el GET a pi/users')
            }
          })


        })
      } else {
        document.getElementById("jsCreateOrder").addEventListener("click", function (e) {
          e.preventDefault()
          console.log("vacio")

        })
      }
    })

  } else {
    console.log('There is no user logged in! ')
  }
}

// Load the dashboard page specifically
app.loadOrdersListPage = function () {
  var userIdentifier = typeof (app.config.sessionToken.userIdentifier) == 'string' && app.config.sessionToken.userIdentifier.trim().length > 0  ? app.config.sessionToken.userIdentifier.trim() : false
  var idToken        = typeof (app.config.sessionToken.id) == 'string' && app.config.sessionToken.id.trim().length > 0  ? app.config.sessionToken.id.trim() : false

  var headers        = {
    id               : idToken,
    userid           : userIdentifier
  }

  var userObject     = {}
  var ordSize        = 0
  var NoPart         = 0
  var arrElementos   = []

  if (userIdentifier) {
    app.client.request( headers, '/api/users', 'GET', { 'id' : userIdentifier }, undefined, function (statusCode, responseUserPayload) {

      if (statusCode == 200) {
        userObject = responseUserPayload

        if ( responseUserPayload.orders.length > 0 ) {

          responseUserPayload.orders.forEach( (NoOrder) => {
            app.client.request( headers, '/order', 'GET', { 'id' : NoOrder }, undefined, function (statusOrderCode, respOrderPayload) {
              /* statusOrderCode == 200 ? console.log('respOrderPayload: %o', respOrderPayload)  : console.warn('ERROR AL OBTENER LA ORDEN: %s0', NoOrder) */

              if (statusOrderCode == 200 ) {
                NoPart += 1

                var table    = document.getElementById("orderListTable")
                var tr       = table.insertRow(-1)
                tr.classList.add('checkRow')

                var td0      = tr.insertCell(0)
                var td1      = tr.insertCell(1)
                var td2      = tr.insertCell(2)
                var td3      = tr.insertCell(3)
                var td4      = tr.insertCell(4)
                var td5      = tr.insertCell(5)
                var td6      = tr.insertCell(6)

                td0.classList.add('tdId')
                td1.classList.add('tdOrdNo')
                respOrderPayload.payed     ? td2.classList.add('tdPayed')  : td2.classList.add('tdNotPayed')
                respOrderPayload.mail_sent ? td3.classList.add('tdMailed') : td3.classList.add('tdNotMailed')
                td4.classList.add('tdItems')
                td5.classList.add('tdGranTotal')
                td6.classList.add('tdCheckOut')

                td0.innerHTML = NoPart
                td1.innerHTML = respOrderPayload.id
                td2.innerHTML = respOrderPayload.payed
                td3.innerHTML = respOrderPayload.mail_sent
                td4.innerHTML = respOrderPayload.items
                td5.innerHTML = respOrderPayload.totalPrice.toFixed(2)

                td6.innerHTML = respOrderPayload.payed == false ? `<input type="button" class="btncheckout" id="btncheckout" data-noOrder=${respOrderPayload.id} value="CheckOut" >` : '<p class="pPayed" >Payed</p>'
                /* td6.innerHTML = respOrderPayload.payed == false ? `<a href='/orders/all' data-noOrder=${respOrderPayload.id}  ${onclick=btnCheckOut}>Pagar</a>` : '<span></span>' */
              }

              if ( userObject.orders.length === NoPart ) {
                console.log('%c\n\tEUREKAAAA\n', 'color: teal; font-size: 2em; font-weight: bold;')
                arrElementos = getElements('#btncheckout')
                btnListeners (headers , arrElementos)
              }

            })
          })

        } else if (responseUserPayload.shoppingcart.length > 0) {
          console.log('shoppingcart: %s' , responseUserPayload.shoppingcart)
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        console.log('Error al intentar hacer el GET a pi/users')
      }
    })

  } else {
    app.logUserOut();
  }
}

function getElements(elmSel) {
  return document.querySelectorAll(elmSel);
}

function btnListeners ( header ,arrElements) {

  arrElements.forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault()

      var idOrder   = event.target.getAttribute('data-noOrder')
      var respuesta = confirm("Do you want to pay the order [ " + idOrder + " ] ?")
      var PayObject = {
        "orderId"    : idOrder,
        "stripeToken": "tok_mastercard_debit"
      }

      /* respuesta == true ? alert("You have ben choosed the order id: [ " + idOrder + " ]") : alert("You have canceled the order[ " + idOrder + " ]  process") */

      if (respuesta) {
        /* alert("You have ben choosed the order id: [ " + idOrder + " ]") */

        app.client.request( header, '/checkout', 'POST', undefined, PayObject, function (statusCheckOutCode, respCheckoutPayload) {

          if (statusCheckOutCode == 200 ) {
            alert("The order id: [ " + idOrder + " ] Has been payed already!")
            window.location = '/orders/all'
          } else {
            console.log('%cThere is an error in the Checkout process', 'color: tomato; font-size: 3em; font-weight: bold;')
          }

        })

      } else {
        alert("You have canceled the order[ " + idOrder + " ]  process")
      }

    })
  })
}

// Init (bootstrapping)
app.init = function () {
  console.log('%c\t\t\tWelcome to the index page', 'color: tomato; font-size: 3em;')

  // Bind all form submissions
  app.bindForms()

  // Bind logout logout button
  app.bindLogoutButton()

  // Get the token from localstorage
  app.getSessionToken()

  // Renew token
  app.tokenRenewalLoop()

  // Load data on page
  app.loadDataOnPage()
}

// Call the init processes after the window loads
window.onload = function () {
  app.init()
}
