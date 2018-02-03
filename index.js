'use strict';
module.change_code = 1;
var _ = require('lodash');
var express = require('express');
var alexa = require('alexa-app');
var app = express();
    // Setup the alexa app and attach it to express before anything else.
    //alexaApp = new alexa.app("");
var alexaApp = new alexa.app('');//gympiepres');
var AmazonDateParser = require('amazon-date-parser');
var GPDataHelper = require('./gp_data_helper');

const PORT = process.env.PORT || 3000;

function convertAmDate(amDate){
    var dateObj = new AmazonDateParser(amDate);
    //We're going to assume if the user says 'This Week' they mean 
    //'the sermon at the first service which happens this week!
    return dateObj.startDate.toString();
}

// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production.
  debug: true
});

app.set("view engine", "ejs");

alexaApp.launch(function(req, res) {
  var prompt = 'For information about this week\'s sermon say what is the current Sermon Series.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});


alexaApp.intent('sermontitle', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {sermon|message} {|title} {|on|for} {-|DATE}']
	},
  function(req, res) {
    //get the slot
    var amDate = req.slot('DATE');
    var reprompt = 'Tell me a date to get the sermon title. You can say this Sunday.';
    if (_.isEmpty(amDate)) {
      var prompt = 'I didn\'t hear a date. Please tell me a date.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var date = convertAmDate(amDate);
      var gpHelper = new GPDataHelper();
      return gpHelper.getSermonTitle(date).then(function(sermonTitle) {
      	var prompt = 'The sermon title is ' + sermonTitle;
        console.log(prompt);
        res.say(prompt).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have a sermon title for ' + date;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
    }
  }
);

alexaApp.intent('sermonpassage', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {sermon|message|preaching} {passage} {|on|for} {-|DATE}']
	},
  function(req, res) {
    //get the slot
    var amDate = req.slot('DATE');
    var reprompt = 'Tell me a date to get the sermon passage. You can say this Sunday.';
    if (_.isEmpty(amDate)) {
      var prompt = 'I didn\'t hear a date. Please tell me a date.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var date = convertAmDate(amDate);
      var gpHelper = new GPDataHelper();
      return gpHelper.getSermonPassage(date).then(function(sermonPassage) {
      	var prompt = 'The sermon passage is ' + sermonPassage;
        console.log(prompt);
        res.say(prompt).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have a sermon passage for ' + date;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
    }
  }
);

alexaApp.intent('otherpassage', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {other|second} {passage|reading|bible reading} {|on|for} {-|DATE}']
	},
  function(req, res) {
    //get the slot
    var amDate = req.slot('DATE');
    var reprompt = 'Tell me a date to get the other bible reading. You can say this Sunday.';
    if (_.isEmpty(amDate)) {
      var prompt = 'I didn\'t hear a date. Please tell me a date.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var date = convertAmDate(amDate);
      var gpHelper = new GPDataHelper();
      return gpHelper.getOtherPassage(date).then(function(otherPassage) {
      	var prompt = 'The other passage is ' + otherPassage;
        console.log(prompt);
        res.say(prompt).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have a other bible reading for ' + date;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
    }
  }
);

alexaApp.intent('sermonseries', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {|sermon} {series} {|on|for} {-|DATE}']
	},
  function(req, res) {
    //get the slot
    var amDate = req.slot('DATE');
    var reprompt = 'Tell me a date to get the sermon series. You can say this Sunday.';
    if (_.isEmpty(amDate)) {
      var prompt = 'I didn\'t hear a date. Please tell me a date.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var date = convertAmDate(amDate);
      var gpHelper = new GPDataHelper();
      return gpHelper.getSermonSeries(date).then(function(sermonSeries) {
      	var prompt = 'The sermon series is ' + sermonSeries;
        console.log(prompt);
        res.say(prompt).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have a sermon series for ' + date;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
    }
  }
);

module.exports = alexaApp;
app.listen(PORT, () => console.log("Listening on port " + PORT + "."));