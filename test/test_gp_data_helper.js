/* global describe, it, context */

'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var GPDataHelper = require('../gp_data_helper');
chai.config.includeStack = true;

describe('GPDataHelper', function() {
  var subject = new GPDataHelper();
  var date;
  describe('#getSermonTitle', function() {
    this.timeout(5000);
    context('with a valid date code', function() {
      it('returns matching sermon title', function() {
        date = '2018-01-29';
        var value = subject.getSermonTitle(date).then(function(sermonTitle) {return sermonTitle});
        return expect(value).to.eventually.eq('New Life');
      });
    });
  });
  
  describe('#getSermonPassage', function(){
  this.timeout(5000);
  	context('with a valid date code', function(){
  		it('returns matching bible passage', function(){
  			date = '2018-02-06';
  			var value = subject.getSermonPassage(date).then(function(sermonPassage){return sermonPassage});
  			return expect(value).to.eventually.eq('John 4:1-26');
  		});
  	});
  });
  
  describe('#getSermonPassage', function(){
  this.timeout(5000);
  	context('with a valid date code', function(){
  		it('returns matching bible passage', function(){
  			date = '2018-02-06';
  			var value = subject.getSermonPassage(date).then(function(sermonPassage){return sermonPassage});
  			return expect(value).to.eventually.eq('John 4:1-26');
  		});
  	});
  })
  
  describe('#getSermonSeries', function(){
  this.timeout(5000);
  	context('with a valid date code', function(){
  		it('returns matching sermon series', function(){
  			date = '2016-11-25';
  			var value = subject.getSermonSeries(date).then(function(sermonSeries){return sermonSeries});
  			return expect(value).to.eventually.eq('Great Expectations');
  		});
  	});
  })
})