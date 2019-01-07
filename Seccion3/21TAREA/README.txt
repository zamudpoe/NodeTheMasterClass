Homework Assignment #2

This is the second of several homework assignments you'll receive in this course.
In order to receive your certificate of completion (at the end of this course) you must complete all the assignments and receive a passing grade.

How to Turn It In:
  1. Create a public github repo for this assignment.
  2. Create a new post in the Facebook Group  and note "Homework Assignment #2" at the top.
  3. In that thread, discuss what you have built, and include the link to your Github repo.

The Assignment (Scenario):

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager:

  1. New users can be created, their information can be edited, and they can be deleted.
     We should store their name, email address, and street address.
  2. Users can log in and log out by creating or destroying a token.

  3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).
  4. A logged-in user should be able to fill a shopping cart with menu items
  5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment.
      Note: Use the stripe sandbox for your testing.
            Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is
            working: https://stripe.com/docs/testing#cards

  6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this.
      Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default.
            So, there's no need to setup any DNS for your domain for this
            task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements.
It can include anything else you wish as well.


Creamos el usuario:

{
  "phone"   : "2281944939",
  "fullName": "Fulanito Perez Gonzalez",
  "email"   : "fulanito@fulanito.com",
  "address" : "La Calle de las sirenas 689",
  "password": "TooManySecrets",
  "activo" : true
}

{
  "phone"   : "2281944928",
  "fullName": "Engelbert Zamudio Ponzzi",
  "email"   : "engel_zamudio@icloud.com",
  "address" : "Lazaro Cardenas 112",
  "password": "TooManySecrets",
  "activo"  : true
}

creamos el token
{
	"phone" : "2281944939",
	"password" : "TooManySecrets"
}

PENDIENTE o trabjaando en que si un usuario ya tiene token que no permita crear uno nuevo.
