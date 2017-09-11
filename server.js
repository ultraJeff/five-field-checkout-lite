'use strict';

const config = require('./config');
//////////////////////////
//Start Express
let express = require('express');
let app = express();
let server = require('http').createServer(app);

let compression = require('compression');
let bodyParser = require('body-parser');
let fs = require('fs');

let apiai = require('apiai')(config.apiaiClientToken);
// Generate a v4 UUID (random)
const uuidV4 = require('uuid/v4');

//////////////////////////
//Google Vision
const Vision = require('@google-cloud/vision')({
  projectId: config.projectId,
  keyFilename: config.keyFilename,
  //promise: require('bluebird')
});

//////////////////////////
//Google Speech
const Speech = require('@google-cloud/speech')({
  projectId: config.projectId,
  keyFilename: config.keyFilename
});

const request = {
  config: {
    // Only need encoding and sampleRateHertz for formats that aren't WAV (what we're using) or FLAC
    // encoding: 'LINEAR16',
    // sampleRateHertz: 44100,
    languageCode: 'en-US',
    speechContexts: {
      phrases:["four", "two", "two day", "deck", "decks", "wheel", "wheels", "truck", "trucks", "four trucks", "four axles", "four wheels", "four decks", "two trucks", "two axles", "two decks", "two wheels", "four truck", "four wheel", "four deck", "two truck", "two deck", "two wheel"]
     }
  },
  singleUtterance: false,
  interimResults: true
};

//////////////////////////
//Probably figure these options out more!
let options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['htm', 'html'],
  index: 'index.html',
  lastModified: true,
  maxAge: '1d',
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
    res.header('Cache-Control', 'public, max-age=1d');
  }
};

//////////////////////////
//Compression for gzipping
app.use(compression());
//////////////////////////
//Body parser to obtain POST parameters
app.use(bodyParser.json({
  limit: '5mb'
}));
// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//////////////////////////
//Middleware to serve up static page no matter the route requested
app.use('/', express.static(__dirname + '/dist', options));
app.use('*', express.static(__dirname + '/dist', options));

//////////////////////////
//API.AI
//TODO: Make this into a class
function apiaiBot(resolvedQuery, req, res) {
  //Need to send the contexts from API.AI response
  //back to API.AI to have a conversation with the bot
  let apiaiContexts = req.body.apiaiContexts
  let textRequest = apiai.textRequest(resolvedQuery, {
    sessionId: uuidV4(),
    contexts: apiaiContexts
  });

  textRequest.on('response', function(response) {
    console.log(response);
    res.send(response);
  })

  textRequest.on('error', (error) => {
    console.log(error)
  })

  textRequest.end();
}

//////////////////////////
//POST to Google Vision
app.post('/vision', function(req, res) {
  let base64Data = req.body.base64Image
    .replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
  let buffer = new Buffer(base64Data, 'base64');

  // require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
  //   if (err) { console.log(err); }
  // });

  Vision.detectText(buffer, {verbose: true})
    .then(
      data => {
        let fullText = data[0][0].desc;
        let pattern = /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})/;
        let fullTextNoSpace = fullText.replace(/ /g, '');
        let cardNumber = fullTextNoSpace.match(pattern);

        res.send(cardNumber)
      },
      err => res.status(500).send(err.message)
    )
});

//////////////////////////
//POST to Google Speech
app.post('/speech', function(req, res) {
  let audioBlob = req.body.audioBlob
  // Would be great to get back to OGG_OPUS someday, once it works
  // .replace(/^data:audio\/ogg; codecs=opus;base64,/, "")
    .replace(/^data:audio\/wav;base64,/, "")
  let buffer = new Buffer(audioBlob, 'base64');

  Speech.recognize(buffer, request.config)
    .then(
      data => {
        //data[0] is the text of what Google Speech parsed out
        apiaiBot(data[0], req, res)
      },
      err => res.status(500).send(err.message)
    );
});

//////////////////////////
//POST to "Database" for API.AI webhook
app.post('/mockdb', function(req, res) {
  //TODO: Replace with a real database and auth system
  //so that only the auth'd user's accounts are selected from
  let apiaiResult = req.body.result;
  let customer = {};
  let webhookResponse = {
    "speech": "Sorry, no account by that name was found",
    "displayText": "Sorry, no account by that name was found",
    "data": customer,
    "contextOut": "",
    "source": "FFC/mockdb"
  }

  if (apiaiResult.action === 'order.from-account') {
    let {
      name: name,
      'last-name': lastName,
      'type': type,
    } = apiaiResult.parameters['account-identity'];

    let accountId = [name, lastName, type].join('').toLowerCase().trim();

    switch (accountId) {
      case 'sampersonal':
      case 'samsmithpersonal':
        customer = {
          "name": "Sam Smith",
          "billingAddress": "123 Main St, San Luis Obispo, CA 93401",
          "shippingAddress": "123 Main St, San Luis Obispo, CA 93401",
          "place": "123 Main St",
          "email": "sam@smith.com",
          "phone": "555-123-4567",
          "card": {
            "number": "4444222222222222",
            "expiration": "06/22",
            "cvc": "123"
          }
        }
        break;
      case 'smithfamily':
        customer = {
          "name": "The Smith Family",
          "billingAddress": "123 Main St, San Luis Obispo, CA 93401",
          "shippingAddress": "123 Main St, San Luis Obispo, CA 93401",
          "place": "123 Main St",
          "email": "sam@smith.com",
          "phone": "555-123-4567",
          "card": {
            "number": "37123456789012",
            "expiration": "06/22",
            "cvc": "123"
          }
        }
        break;
      case 'sambusiness':
      case 'samsmithbusiness':
        customer = {
          "name": "Sam Smith",
          "billingAddress": "2001 The Embarcadero, SF CA 94116",
          "shippingAddress": "2001 The Embarcadero, SF CA 94116",
          "place": "2001 The Embarcadero",
          "email": "sam.smith@razorfish.com",
          "phone": "415-635-5954",
          "card": {
            "number": "4444333322221111",
            "expiration": "06/22",
            "cvc": "123"
          }
        }
        break;
      default:
        res.send(webhookResponse);
    }

    webhookResponse = {
      "speech": `OK. using ${customer.name}'s account. Would you like to review your order now?`,
      "displayText": `OK. using ${customer.name}'s account. Would you like to review your order now?`,
      "data": customer,
      "contextOut": apiaiResult.contexts,
      "source": "FFC/mockdb"
    }
  }

  res.send(webhookResponse);
})

/**
 * Starts the server.
 */
if (module === require.main) {
  server.listen(process.env.PORT || 8080, function() {
    console.log('App listening on port %s', server.address().port);
  });
}

module.exports = app;
