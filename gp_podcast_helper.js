'use strict';
var parsePodcast = require('node-podcast-parser');
var request = require('request');
var _ = require('lodash');


const URI = "https://feeds.feedburner.com/GympiePresbyterianChurch";

function getPodcast(){
	return new Promise (function (resolve, reject) {
		request(URI, (err, res, data) => {
 			if (err) {
		    	console.error('Network error', err);
			    reject (err);
  			}

			parsePodcast(data, (err, data) => {
    			if (err) {
    	  			console.error('Parsing error', err);
      				reject (err);
    			}

    			console.log("Podcast Retrieved:", data.title);
    			resolve (data);
  			})
		})
	})
}


function GPPodcastHelper () {}

GPPodcastHelper.prototype.getEpisodeURL = function(episode) {
	return getPodcast().then(function(pod){
    if (_.isEmpty(episode)) { episode = 0; }
		console.log("URL", pod.episodes[episode].enclosure.url)
		return pod.episodes[episode].enclosure.url;
	})
}

GPPodcastHelper.prototype.getTitle = function(episode) {
	return getPodcast().then(function(pod){
		if (_.isEmpty(episode)) { episode = 0; }
    return pod.episodes[episode].title;
	})
}

GPPodcastHelper.prototype.getDate = function(episode) {
	return getPodcast().then(function(pod){
		if (_.isEmpty(episode)) { episode = 0; }
    return pod.episodes[episode].published;
	})
}

GPPodcastHelper.prototype.getEpisode = function(episode) {
  //This function will return an object with a pre-roll string and the URL of the episode
  return getPodcast().then(function(pod){
    if (_.isEmpty(episode)) {episode = 0; }
    
    var prompt = "This is a sermon from Gympie Presbyterian Church called " + pod.episodes[episode].title 
                  + " it was recorded on " + pod.episodes[episode].published.toDateString();
    
    var podcast = {preRoll : prompt, mp3URL : pod.episodes[episode].enclosure.url };
    return podcast;
  })
}                                                 

module.exports = GPPodcastHelper;