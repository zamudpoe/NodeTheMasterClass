# Pirple Homework Assignment #4

This is my public repo for the Pirple **Homework Assignment #4**

---
## Steps to setup

1. Clone or download the project
1. Create folder ```users, menuitems, tokens, orders``` under the ```data``` folder.
    > **Info :** You need to create your pizzas objects, the pizza object for the data folder is the following:
    ```json
      {
        "id":1,
        "name":"delicatessen""displayName":"Delicatessen",
        "price":10.99
      }
    ```

1. Setup the following environment variables in a file ```env.config.json``` in the **JSON format**  like this:

    ```json
    [{"stripe": {
      "secretApiKeyTest": "stripekey",
      "stripeToken" : "tok_mastercard_debit"
    },"twilio"            : {
        "accountSid"      : "_________________c54c665d25e5c5d",
        "authToken"       : "_________________e3d8c92768f7a67",
        "fromPhone"       : "+15005551010"
      },
      "mailgun"           : {
        "ApiKeyTest"      : "________________________________-9525e19d-db1cab1f",
        "boundary"        : "________________________________-9525e19d-60c575ce",
        "domain"          : "sandbox__________________________c.mailgun.org"
      }
    }]
    ```
    >**Note :** You need to setup your own **API Keys tokens**

    And we need to setup the ```config.js``` file like this:

    ```javascript
        /*
        * Create and export configuration variables **
        */

        // setup env in json format
        var envJSON = require('./../env.config.json')

        // Container of all the environments
        var environments = {}

        // Staging (default) environment
        environments.staging = {
        'httpPort'          : 3000,
        'httpsPort'         : 3001,
        'envName'           : 'staging',
        'hashingSecret'     : 'thisIsASecret',
        'maxChecks'         : 5,
        'personalInfo'      : {
            'email'           : 'yourownemail@domain.com'
        },
        'twilio'            : {
            'accountSid'      : envJSON[0].twilio.accountSid,
            'authToken'       : envJSON[0].twilio.authToken,
            'fromPhone'       : '+15005550006'
        },
        'stripe'            : {
            'secretApiKeyTest': envJSON[0].stripe.secretApiKeyTest
        },
        'mailgun'           : {
            'ApiKeyTest'      : envJSON[0].mailgun.ApiKeyTest ,
            'boundary'        : envJSON[0].mailgun.boundary ,
            'domain'          : envJSON[0].mailgun.domain
        },
        'templateGlobals'   : {
            'appName'         : 'Pizzas Feliantoni',
            'companyName'     : 'Pizzas Feliantoni, Inc.',
            'slogan'          : 'Dejate consentir por el sason de mama',
            'mision'          : 'El sason familiar desde 1985 directamente de la cocina de italia de la casa de mama' ,
            'yearCreated'     : '1985',
            'baseUrl'         : 'http://localhost:3000/'
        }
        }

        // Production environments
        environments.production = {
        'httpPort'       : 5000,
        'httpsPort'      : 5001,
        'envName'        : 'production',
        'hashingSecret'  : 'thisIsAlsoASecret',
        'maxChecks'      : 5,
        'personalInfo'   : {
            'email'        : 'yourownemail@domain.com'
        },
        'twilio'         : {
            'accountSid'   : envJSON[0].twilio.accountSid,
            'authToken'    : envJSON[0].twilio.authToken,
            'fromPhone'    : '+15005550006'
        },
        'templateGlobals': {
            'appName'      : 'Pizzas Feliantoni',
            'companyName'  : 'Pizzas Feliantoni, Inc.',
            'slogan'       : 'Dejate consentir por el sason de mama',
            'mision'       : 'El sason familiar desde 1985 directamente de la cocina de italia de la casa de mama' ,
            'yearCreated'  : '1985',
            'baseUrl'      : 'http://localhost:5000/'
        }
        }

        // Determine which environment was passed as a command-line argument
        var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

        // Check that the current environment is one of the environments above, if not, default to staging
        var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

        // Export the module
        module.exports = environmentToExport

    ```

1. Once the environment variables are set, **You are ready to go!**, run node ```node index.js``` .

---
## Pizzas Webapp - How is works

>**Advice:** At this time you need to open ```localhost:3000``` or ```localhost:5000``` in your browser.

1. **Create an new account :**, just click to the Get Started Button.
1. **Loggin :** , just click to the Login Button.
1. Go to the **Menu** opcion in the top menu. to see the menu and to add items to your shoppingcart with the **"+" button**
1. Go to the **Shoppingcart** top Menu or just click the **shoppingcart button** in the menu page.
1. To create your order just click the **Make Your Orders** in the **Shoppingcart**
1. If you want to checkout your order just click the **checkout button**  and thats it!, have Fun!!!


---
## Pizzas CLI APP - How is works

1. Write ```node index.js```
1. Write ```man``` or ```help``` and follow the instructions on the screen.





