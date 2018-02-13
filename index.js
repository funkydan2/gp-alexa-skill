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
  var prompt = 'Welcome to the Gympie Presbyterian Church Skill. You can say something like play sermon.';
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

    //Since this is the first request for a sermon, get the latest episode '0'
    return podcast.getEpisode(0).then(function(podEp) {
      
      var stream = {
        url: podEp.mp3URL,
        token: 0,
        offsetInMilliseconds: 0
      }
            
      res.say(podEp.preRoll);
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    });
  }
);

alexaApp.intent('AMAZON.NextIntent', {},
  function(req, res) {
    // retrieve the podcast Mpeg enclosure from the RSS feed
    var podcast = new GPPodcastHelper();
                  
    if ( _.isUndefined(req.context.AudioPlayer.token) ) {
      res.say("Something has gone wrong skipping to the next track!").send();
      return;
    }
    else {
          var episode = Number(req.context.AudioPlayer.token);
    }
    
    if ( episode < 9 ) {
      var nextEp = episode + 1;
    }
    else {
      res.say("No more sermons. For more sermons, visit our website.").send();
      return;
    }
   
console.log("Next episode is ", nextEp);  

  
    return podcast.getEpisode(nextEp).then(function(podEp) {
      var stream = {
        url: podEp.mp3URL,
        token: nextEp,
        offsetInMilliseconds: 0
      }      
      res.say(podEp.preRoll);
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    });
});

alexaApp.intent('AMAZON.PauseIntent', {},
  function(req, res) {
    console.log('app.AMAZON.PauseIntent');
    res.audioPlayerStop().shouldEndSession(false).send();
  }
);

alexaApp.intent('AMAZON.ResumeIntent', {},
  function(req, res) {
    console.log('app.AMAZON.ResumeIntent');  
    if (req.context.AudioPlayer.offsetInMilliseconds > 0 &&
      req.context.AudioPlayer.playerActivity === 'STOPPED') {
      
        var episode = req.context.AudioPlayer.token;
        var podcast = new GPPodcastHelper();
      
        return podcast.getEpisodeURL(episode).then(function(URL) {
          res.audioPlayerPlayStream('REPLACE_ALL', {
            token: episode,
            url: URL,
            offsetInMilliseconds: req.context.AudioPlayer.offsetInMilliseconds
          });
        });
      res.send();
  }
});

alexaApp.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(req, res) {
    var helpOutput = "Welcome to the Gympie Presbyterian Church skill. You can play the latest sermon by saying 'play sermon', or you can find out about sermon series by asking 'what is the sermon series'.";  

    var reprompt = "What would you like to do?";
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    res.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

alexaApp.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(req, res) {
    var stopOutput = "Good bye. Thanks for using Gympie Presbyterian on Alexa.";
    res.say(stopOutput);
  }
);

alexaApp.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(req, res) {
    var cancelOutput = "No problem. Request cancelled.";
    res.say(cancelOutput);
  }
);


module.exports = alexaApp;
app.listen(PORT, () => console.log("Listening on port " + PORT + "."));