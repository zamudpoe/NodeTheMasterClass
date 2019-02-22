# Pirple Homework Assignment #2

This is my public repo for the Pirple **Homework Assignment #2**

---
## Steps to setup

1. Clone or download the project
1. Create folder ```users, menuitems, tokens, orders``` under the ```**.data**``` folder
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
    >**Note :** You need to setup your own API Keys tokens

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
      }
    }

    // Production environments
    environments.production = {
      'httpPort'     : 5000,
      'httpsPort'    : 5001,
      'envName'      : 'production',
      'hashingSecret': 'thisIsAlsoASecret',
      'maxChecks'    : 5,
      'twilio'       : {
        'accountSid' : envJSON[0].twilio.accountSid,
        'authToken'  : envJSON[0].twilio.authToken,
        'fromPhone'  : '+15005550006'
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
## API - How it works

>**Advice:** You can use **Postman** for testing the Api

### /users

#### [POST] http://localhost:3000/users

Example payload request:

```json
{
    "name"         : "Full Name",
    "emailAddress" : "email@domain.com",
    "streetAddress": "The full street address",
    "password"     : "TooManySecrets",
}
```

**Response :**
An empty object ```{}``` with the status code **200 OK**

#### [GET]  http://localhost:3000/users?id=75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

Requires authentication in **header** with  the Content-Type and the **token** key like this:

**Content-Type :** application/json
**token** : db99cw1vohor3swbbaba

The required **id** in **querystring** is the **hashed emailAddres**

>**Note :** First We need to login the user, in the route http://localhost:3000/login ,

**Responses**

```json
{
    "id": "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
    "name": "Full Name",
    "emailAddress": "email@domain.com",
    "streetAddress": "The full street address",
    "orders": [],
    "shoppingcart": []
}
```


#### [PUT]  http://localhost:3000/users

Requires authentication in header, the token key like this:

**Content-Type :** application/json
**token** : db99cw1vohor3swbbaba


```json
{
	"id": "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
	"name":"New Full Name",
	"streetAddress":"New Street",
	"password":"TooManySecrets"
}
```

**Responses :** An empty object ```{}``` with the status code **200 OK**

>If we make a new GET request we going to get the following response

```json
{
    "id": "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
    "name": "New Full Name",
    "emailAddress": "email@domain.com",
    "streetAddress": "New Street",
    "orders": [],
    "shoppingcart": []
}
```


#### [DELETE] http://localhost:3000/users?id=75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

Requires authentication in header, like this:

**Content-Type :** application/json
**token** : db99cw1vohor3swbbaba

>**Note :** it removes the token associated with the user.

---

### /login

#### [POST]  http://localhost:3000/login

Requires authentication in header,  like this:

**Content-Type :** application/json


```json
{
	"emailAddress" : "email@domain.com",
	"password" : "TooManySecrets"
}
```


**Response :**
```json
{
    "userIdentifier": "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
    "id": "db99cw1vohor3swbbaba",
    "expires": 1544636800290
}
```

>**Note:** it doesn't create more tokens if there is already a valid (not expired) token for the user.


### /logout

#### [POST]  http://localhost:3000/logout

Requires authentication in header,  like this:

**Content-Type :** application/json
**token** : db99cw1vohor3swbbaba

>**Note :** it removes the token from the system itself.

---
### /menu

#### [GET] http://localhost:3000/menu

Requires authentication in header,  like this:

**Content-Type :** application/json
**token** : db99cw1vohor3swbbaba
**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

Returns the list of possible pizza's to select, not hardcoded, but each pizza exist on a separate file called 'menuitems' in the data folder.

>**Note :** previously you need to create the menu items , for every item in the json format in the menuitems folder.

```json
[
    {
        "id": 1,
        "name": "delicatessen",
        "displayName": "Delicatessen",
        "price": 11.99
    },
    {
        "id": 0,
        "name": "suprema",
        "displayName": "Suprema",
        "price": 14.99
    },
    {
        "id": 2,
        "name": "cheese_bacon",
        "displayName": "Cheese & Bacon",
        "price": 14.99
    },
    {
        "id": 6,
        "name": "feliantoni",
        "displayName": "feliantoni",
        "price": 16.99
    },
    {
        "id": 7,
        "name": "Cheff Choice",
        "displayName": "Cheff Choice",
        "price": 20.99
    }
]
```

---
### /cart

#### [PUT] http://localhost:3000/cart

Requires token and userid authentication and userid in header, like this:

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

```json
{
  "item":"feliantoni"
}
```

>**Note :** item should be a valid pizza name from the list of available pizzas. It allows multiple to add multiple pizzas with same name to the cart. After adding the shoppingcart array of the user object is updated.

**Response :**

Now the user object has the item "feliantoni" in the shopping cart

```json
{
    "id": "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
    "name": "Full Name",
    "emailAddress": "email@domain.com",
    "streetAddress": "The full street address",
    "hashedPassword": "80384349460bb25e591b4a99dd76baa62f0bc6b990e226704716625b26c93504",
    "orders": [],
    "shoppingcart": [
        "feliantoni"
    ]
}
```

### /cart

#### [GET] http://localhost:3000/cart

Requires  **token** and **userid** authentication in header, the token key like this:

**Content-Type :** application/json

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

Returns the current list of items in user's cart.

### /cart
#### [DELETE] http://localhost:3000/cart

Requires authentication like this:

**Content-Type :** application/json

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

In the **body payload :**

```json
{
	"item":"feliantoni"
}
```

>**Note :** it removes the first single pizza on the shoppingcart array of the user with the same pizza name requested. It doesn't remove nor update if pizza name wasn't found or shopping cart is empty.


---
#### [POST] http://localhost:3000/order

Requires authentication and userid in header, like this:

**Content-Type :** application/json

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38


>**Note :** it creates a new order with all the items on user's shopping cart and save it on the system, using the data folder called 'orders', the total price of the order is also calculated based on each price of each pizza on the order.
After placing the order the shopping cart gets empty and a new order id goes to the orders array of user object as the following example shows.

**Responses :** An empty object ```{}``` with the status code **200 OK**

### /order

#### [GET] http://localhost:3000/order?id=h68rh90yobeau6q2g6oe

Requires authentication like this:

**Content-Type :** application/json

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

>**Note :** Using the id of the order on query string, lookup and fetch the order object from the orders data folder.

**Response :**
```json
{
  "id"        : "h68rh90yobeau6q2g6oe",
  "userId"    : "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
  "payed"     : false,
  "mail_sent" : false,
  "totalPrice": 12.99,
  "items"     : [
      "feliantoni"
  ]
}
```

> As you can see the order isnt payed and mailed yet

Now our user object has the following updates:

```json
{
  "id"            : "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
  "name"          : "Full Name","emailAddress":"email@domain.com",
  "streetAddress" : "The full street address",
  "hashedPassword": "80384349460bb25e591b4a99dd76baa62f0bc6b990e226704716625b26c93504",
  "orders"        : ["h68rh90yobeau6q2g6oe"],
  "shoppingcart"  : []
}

```

---

### /checkout

#### [POST] http://localhost:3000/checkout

Requires authentication in header, like this:

**Content-Type :** application/json

**token** : db99cw1vohor3swbbaba

**userid** : 75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38

Also requires the following data on body (json format), the id of the order to checkout and the stripe token to apply the charge (in this case it's a test token)

```json
{
	"orderId"    : "h68rh90yobeau6q2g6oe",
	"stripeToken": "tok_mastercard_debit"
}
```
**Responses :** An empty object ```{}``` with the status code **200 OK**

After charging an email is sent to the user, and the variables regarding 'payment' and 'email sent' of the order are updated depending on the success of both operations.
Example of a order in which both payment and email were sent with success:

```json
{
  "id"        : "h68rh90yobeau6q2g6oe",
  "userId"    : "75a136d679b5b6c2166f11e445640bf04aab8ba7c99acaaa732c318537372d38",
  "payed"     : true,
  "mail_sent" : true,
  "totalPrice": 12.99,
  "items"     : ["feliantoni"]
}
```

###### *Note: Public and Private key generated using a third-party library (at https://wiki.openssl.org/index.php/Binaries) of OpenSSL.*
