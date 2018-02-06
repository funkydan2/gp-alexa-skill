/* global describe, it, context */

'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var GPPodcastHelper = require('../gp_podcast_helper');
chai.config.includeStack = true;

describe('GPPodcastHelper', function() {
  var subject = new GPPodcastHelper();
  var date;
  describe('#getPodcastURL', function() {
    context('with the Gympie Pres Feedburner Podcast RSS', function() {
      it('returns matching url', function() {
        date = '2018-01-29';
        var value = subject.getLatestMP3().then(function(url) {return url});
        return expect(value).to.eventually.eq('http://feedproxy.google.com/~r/GympiePresbyterianChurch/~5/wHLguVbVFnA/20180204_NewLife_DS.mp3');
      })
    })
  })
})