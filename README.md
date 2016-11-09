# service-decision-tree
Facebook `Message Parser` and `Decision Maker`  : This microservice parses all messages and respond back required messages by 
utilizing [AIML](https://en.wikipedia.org/wiki/AIML) and calling various other microservices.

##Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
See deployment for notes on how to deploy the project on a live system.

###Prerequisites
* Install [Node.js] (https://nodejs.org/en/download/) - Runtime for your application.
* [Clone] (https://git-scm.com/docs/git-clone) code to your local pc or development location : `git clone <.git path>` 

###Installing

[Add required dependencies] (https://docs.npmjs.com/getting-started/installing-npm-packages-locally) - `npm install ` from your application root folder.

###run
From your application root folder`npm start`

###Swagger Rest api
Application URL/documentation - Look on `src\config\settings.js` file for local port number cloud url/port settings. 

`http://localhost:3002/documentation`

## Deployment - PCF 
[cf push](https://docs.cloudfoundry.org/devguide/deploy-apps/deploy-app.html) -f manifest.yml   