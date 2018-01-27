# Planum Polare OAuth2 Server #

OAuth server has two entry points:

* **POST** /oauth/token: used for requesting and refreshing auth tokens.
* **GET** /auth/test: used to test authorization, should respond with {"ok": true} if authorized correctly, will respond with 400 otherwise.

**Dependencies**

The server works with mongodb as a backend database. You must have a db named '**planum**'. To perform the tests it is also required to create the following documents

* Under the collection '**oauthclients**': {"clientId": "s6BhdRkqt3", "clientSecret": "12345", "redirectUri": ""}
* Create a user under the collection '**oauthusers**' like the following: {"username" : "jorge", "password" : "password", "firstname" : "Jorge", "lastname" : "Madrid", "email" : "jorgemadridportillo@gmail.com" }


## How to install ##

To install dependencies '**npm install**' under project directory.
To run tests mocha is required. Run '**mocha**' under project directory.

## Requesting Tokens ##

To request a new token you must POST to /oauth/token with the following

* Content-Type header with "application/x-www-form-urlencoded" value.
* Authorization header with the following value: "Basic base64(client_id:client_secret).
* The following POST params: **grant_type**: password, **username**: {username}, **password**: {password}. The server should respond with a json containing the needed tokens and info.

To refresh a token you should POST to /oauth/token also with the following

* Content-Type header with "application/x-www-form-urlencoded" value.
* Authorization header with the following value: "Basic base64(client_id:client_secret).
* The following POST params: **grant_type**: refresh_token, **refresh_token**: {refresh_token}. The server should respond with a json containing the needed tokens and info.

## Using the token ##

In order to access the the areas which require authorization you must first get the token as explained above. Once the server have responded with the token the only thing you need to do is to add the following **header**

* Authorization: Bearer {token}.