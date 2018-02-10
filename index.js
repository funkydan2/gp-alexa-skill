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

//My Helper Objects
var GPDataHelper = require('./gp_data_helper');
var GPPodcastHelper = require('./gp_podcast_helper');

const PORT = process.env.PORT || 3000;

function convertAmDate(amDate){
    // This function returns TODAY's date if the amDate is undefined.
    if (_.isEmpty(amDate)) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      
      if (dd < 10) { dd = '0' + dd;}
      if (mm < 10) { mm = '0' + mm;}
      
      return yyyy + '-' + mm + '-' + dd;
      }
    else {
      var dateObj = new AmazonDateParser(amDate);
      //We're going to assume if the user says 'This Week' they mean 
      //'the sermon at the first service which happens this week!
      return dateObj.startDate.toString();
    }
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
    var date = convertAmDate(req.slot('DATE'));
    var reprompt = 'I don\'t have a sermon title for ' + date + ' Please try again';
    
    var gpHelper = new GPDataHelper();
    return gpHelper.getSermonTitle(date).then(function(sermonTitle) {
    	var prompt = 'The sermon title is ' + sermonTitle;
      console.log(prompt);
      res.say(prompt).send();
    }).catch(function(err) {
      console.log(err.statusCode);
      var prompt = 'I don\'t have a sermon title for ' + date;
      res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
    });
  }
);

alexaApp.intent('sermonpassage', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {sermon|message|preaching} {passage} {|on|for} {-|DATE}']
	},
  function(req, res) {
    var reprompt = 'I don\'t have a sermon passage\. Please try again';

    //get the slot
    var date = convertAmDate(req.slot('DATE'));
    
    var gpHelper = new GPDataHelper();
    return gpHelper.getSermonPassage(date).then(function(sermonPassage) {
    	var prompt = 'The sermon passage is ' + sermonPassage;
      console.log(prompt);
      res.say(prompt).send();
    }).catch(function(err) {
      console.log(err.statusCode);
      var prompt = 'I don\'t have a sermon passage for ' + date;
      res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
    });
  }
);

alexaApp.intent('otherpassage', {
  	'slots': {
    	'DATE' : 'AMAZON.DATE'
  	},
  		'utterances': ['{what is the|tell me the} {other|second} {passage|reading|bible reading} {|is on|for} {-|DATE}']
	},
  function(req, res) {
    //get the slot
    var date = convertAmDate(req.slot('DATE'));
    var reprompt = 'Tell me a date to get the other bible reading. You can say this Sunday.';

    var gpHelper = new GPDataHelper();
    return gpHelper.getOtherPassage(date).then(function(otherPassage) {
    	var prompt = 'The other passage is ' + otherPassage;
      console.log(prompt);
      res.say(prompt).send();
    }).catch(function(err) {
      console.log(err.statusCode);
      var prompt = 'I don\'t have a other bible reading for ' + date;
      res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
    });
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
    var date = convertAmDate(req.slot('DATE'));
    var reprompt = 'I couln\'t get the sermon series\. Please try again\.';
   
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
);

alexaApp.intent('podcast', {
    'slots': {},
    'utterances': ['{play|listen to} {podcast|sermon|message}']
  },
  function(req, res) {
    // retrieve the podcast Mpeg enclosure from the RSS feed
    var podcast = new GPPodcastHelper();

    return podcast.getLatestMP3().then(function(mp3Url) {
      
      var sMp3Url = mp3Url.replace('http://', 'https://');

      var stream = {
        url: sMp3Url,
        token: sMp3Url,
        offsetInMilliseconds: 0
      }
      res.audioPlayerPlayStream('REPLACE_ALL', stream);
      res.send();
    });
  }
);

alexaApp.intent('AMAZON.PauseIntent', {},
  function(req, res) {
    console.log('app.AMAZON.PauseIntent');
    res.audioPlayerStop();
    res.send();
  }
);

alexaApp.intent('AMAZON.ResumeIntent', {},
  function(req, res) {
    console.log('app.AMAZON.ResumeIntent');
    if (req.context.AudioPlayer.offsetInMilliseconds > 0 &&
      req.context.AudioPlayer.playerActivity === 'STOPPED') {
        res.audioPlayerPlayStream('REPLACE_ALL', {
          // hack: use token to remember the URL of the stream
          token: req.context.AudioPlayer.token,
          url: req.context.AudioPlayer.token,
          offsetInMilliseconds: req.context.AudioPlayer.offsetInMilliseconds
      });
    }
    res.send();
  }
);

module.exports = alexaApp;
app.listen(PORT, () => console.log("Listening on port " + PORT + "."));