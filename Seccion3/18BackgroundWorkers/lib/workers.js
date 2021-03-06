/*
 * Worker-related tasks
 *
 */
// Dependencies
var path    = require('path')
var fs      = require('fs')
var _data   = require('./data')
var https   = require('https')
var http    = require('http')
var helpers = require('./helpers')
var url     = require('url')

// Instantiate the worker module object
var workers = {}
console.log("\n\t: : : : : : : : : W O R K E R S  EN CONTRUCCION : : : : : : : : :\n")

// Buscamos todos los checks, obtenemos sus datos, los enviamos al validador
workers.gatherAllChecks = function () {
  // Obtenemos todos los archivos checks "solo los nombres"
  _data.list('checks', function (err, checks) {
    if (!err && checks && checks.length > 0) {
      checks.forEach(function (check) {

        console.log("\n\tCheck: %s ", check)
        //Leemos el contenido del archivo check y regresamos su contenido en originalCheckData
        _data.read('checks', check, function (err, originalCheckData) {
          if (!err && originalCheckData) {

            /* console.dir (originalCheckData, {'colors': 'true'}) */
            // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
            workers.validateCheckData(originalCheckData)
          } else {
            console.log("Error leyendo uno de los datos del check: ", err)
          }
        })
      })
    } else {
      console.log('Error: No es posible encontrar ningun check para proceder!.')
    }
  })
}

// Sanity-check the check-data,
workers.validateCheckData = function (originalCheckData) {
  /* originalCheckData                = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {} */
  originalCheckData                = typeof(originalCheckData) == 'object' && Object.keys(originalCheckData).length > 0 ? originalCheckData : {}
  originalCheckData.id             = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false
  originalCheckData.userPhone      = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false
  originalCheckData.protocol       = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false
  originalCheckData.url            = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
  originalCheckData.method         = typeof(originalCheckData.method) == 'string' &&  ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false
  originalCheckData.successCodes   = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false
  originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false

  // Configuramos las claves que no puedan setearse (Si el worker nunca ha visto este check antes)
  originalCheckData.state          = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down'
  originalCheckData.lastChecked    = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

  // If all checks pass, pass the data along to the next step in the process
  if (originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol &&
      originalCheckData.url && originalCheckData.method && originalCheckData.successCodes &&
      originalCheckData.timeoutSeconds) {
        /* console.dir(originalCheckData, {'colors' : 'true'}) */
        workers.performCheck(originalCheckData)
  } else {
    // Si falla el chekeco , mandamos mensaje de error
    console.log("Error: Uno de los checks no esta correctamente formateado. Skipping.")
  }
}

// Perform the check, send the originalCheck data and the outcome of the check process to the next step in the process.
// Realice la verificación, envíe los datos de "OriginalCheck"
//  y el resultado del proceso de verificación al siguiente paso del proceso.
workers.performCheck = function (originalCheckData) {
  console.log('workers.performCheck')

  /* Preparar el resultado de la comprobación inicial */
  var checkOutcome = {
    'error'        : false,
    'responseCode' : false
  }

  // Mark that the outcome has not been sent yet.
  // Marcamos que resultado de envio  no ha sido enviado aun.
  var outcomeSent = false

  // Analisamos el hostname y el path por fuera del objeto originalCheckData
  var parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true)
  var hostName  = parsedUrl.hostname
  var path      = parsedUrl.path // Using path not pathname because we want the query string

  // Construimos el objeto request
  var requestDetails = {
    'protocol': originalCheckData.protocol+':',
    'hostname': hostName,
    'method'  : originalCheckData.method.toUpperCase(),
    'path'    : path,
    'timeout' : originalCheckData.timeoutSeconds * 1000
  }

  /* console.dir(requestDetails, {'colors':'true'}) */
  // Creeamos una instancia del objeto de solicitud (utilizando el módulo http o https)
  var _moduleToUse = originalCheckData.protocol == 'http' ? http : https
  var req = _moduleToUse.request(requestDetails, function (res) {
      // Toma el estado de la solicitud enviada
      var status =  res.statusCode

      // Actualice el checkOutcome y pase los datos
      checkOutcome.responseCode = status
      if (!outcomeSent) {
        workers.processCheckOutcome(originalCheckData, checkOutcome)
        outcomeSent = true
      }
  })

  // Se vinclua al evento de error para que no se lance
  req.on('error', function (e) {
    // Actualice el checkOutcome y pase los datos
    checkOutcome.error = {'error' : true, 'value' : e}
    /* console.dir(checkOutcome, {'colors':'true'}) */
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  // Vincularse al evento de timeout
  req.on('timeout', function () {
    // Actualice el checkOutcome y pase los datos
    checkOutcome.error = {'error' : true, 'value' : 'timeout'}
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome)
      outcomeSent = true
    }
  })

  // Finalizamos el request.
  req.end()
}

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = function (originalCheckData, checkOutcome) {
  // Decide if the check is considered up or down

  var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'
  // Decide if an alert is warranted
  var alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false
  // Update the check data
  var newCheckData         = originalCheckData
  newCheckData.state       = state
  newCheckData.lastChecked = Date.now()

  /* console.dir(originalCheckData) */

  // Save the updates
  _data.update('checks', newCheckData.id, newCheckData, function (err) {
    if (!err) {
      // Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        console.log('\n\noriginalCheckData.successCodes.indexOf(checkOutcome.responseCode): %s \noriginalCheckData.successCodes: %s\ncheckOutcome.responseCode: %s\n', originalCheckData.successCodes.indexOf(checkOutcome.responseCode), originalCheckData.successCodes, checkOutcome.responseCode)
        workers.alertUserToStatusChange(newCheckData)
      } else {
        console.log("\n\tCheck: " + originalCheckData.id + " outcome has not changed, no alert needed\n")
      }
    } else {
      console.log("\n\tError trying to save updates to one of the checks\n")
    }
  })
}

// Alert the user as to a change in their check status.
workers.alertUserToStatusChange = function (newCheckData) {
  var msg = 'Alert: Tu check: ' + newCheckData.id + ' para ' + newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' esta actualmente '+newCheckData.state.toUpperCase()
  /* console.dir(newCheckData) */
  helpers.sendTwilioSms(newCheckData.userPhone, msg, function (err) {
    if (!err) {
      console.log("EXITO: Usuario fue alertado de un cambio de status en su check [ " + newCheckData.id + " ], via sms: \n\t", msg)
    } else {
      console.log("Error: No podemos enviar alertas sms al usuario que tiene un cambio de estado eb su check ", err)
    }
  })
}

// Timer to execute the worker-process once per minute
workers.loop = function () {
  setInterval(function () {
    workers.gatherAllChecks()
  }, 1000 * 60)
}

// Init script
workers.init = function () {
  // Execute all the checks immediately
  workers.gatherAllChecks()

  // Call the loop so the checks will execute later on
  workers.loop()
}

// Export the module
module.exports = workers
