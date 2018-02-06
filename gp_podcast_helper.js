'use strict';
var parsePodcast = require('node-podcast-parser');
var request = require('request');

const URI = "http://feeds.feedburner.com/GympiePresbyterianChurch";

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

GPPodcastHelper.prototype.getLatestMP3 = function() {
	return getPodcast().then(function(pod){
		console.log("URL", pod.episodes[0].enclosure.url)
		return pod.episodes[0].enclosure.url;
	})
}

GPPodcastHelper.prototype.getLatestTitle = function() {
	return getPodcast().then(function(pod){
		return pod.episodes[0].title;
	})
}

module.exports = GPPodcastHelper;