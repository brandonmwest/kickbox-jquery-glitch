 // init project
var express = require('express');
var rp = require('request-promise');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var api_host = "https://api.kickbox.io/v2/";

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/thanks", function (req, response){
  response.sendFile(__dirname + '/views/thanks.html');
});

// add "activate" route to receive a GET, log some data, and render a view saying "thanks for activating"
app.post("/status", function (req, response) {
  var job_id = req.query.job_id;

  //call the Kickbox API and check the job status
  var options = {
    uri: api_host + "authenticate" + "/" + req.query.app_code + "/" + job_id,
    qs: {
      apikey: process.env.KICKBOX_KEY
    },
    headers: { 'User-Agent': 'Glitch-Kickbox-Demo' },
    json: true // Automatically parses the JSON string in the response
  };

  // make the call
  var result = rp(options).then(function(result){
    response.send(result);
  }).catch(function(err){
    response.send(err.response);
  })
  .catch(function(err){
    console.error(err); // This will print any error that was thrown in the previous error handler.
  });
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/verify", (req, response) => {
  var email = req.query.email;
  
  var options = {
    uri: api_host + "verify",
    qs: {
      apikey: process.env.KICKBOX_SANDBOX_KEY, // -> uri + '?apikey=xxxxx'
      email: email
    },
    headers: { 'User-Agent': 'Glitch-Kickbox-Demo' },
    json: true // Automatically parses the JSON string in the response
  };
  
  // make the call
  var result = rp(options).then(function(result){
    response.send(result);
  }).catch(function(err){
    response.send(err.response);
  })
  .catch(function(err){
    console.error(err); // This will print any error that was thrown in the previous error handler.
  });
});

//handle authentication requests from the Kickbox client-side library
app.post("/authenticate", (req, response) => {
  //the email address from the form
  var email = req.body.email;
  var kickbox_app_code = req.body.kickbox_app_code;
  var fingerprint = req.body.fingerprint;
 
  var call = authenticate(req.body.email, req.body.fingerprint, req.body.kickbox_app_code);
  
  rp(call).then(function(result){
    response.send(result);
  }).catch(function(err){
    response.send(err.response);
  })
  .catch(function(err){
    console.error(err); // This will print any error that was thrown in the previous error handler.
  });
});

var authenticate = function(email, fingerprint, kickbox_app_code)
{
  //we're going to send a multipart form-data POST, just like an HTML form
  var options = {
    uri: api_host + "authenticate" + "/" + kickbox_app_code,
    method: "POST",
    form: {
      apikey: process.env.KICKBOX_KEY, //your kickbox
      email: email,
      fingerprint: fingerprint
    },
    headers: { 'User-Agent': 'Glitch-Kickbox-Auth-Demo' },
    json: true
  };

  return options;
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
