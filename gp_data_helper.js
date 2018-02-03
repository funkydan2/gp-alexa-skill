'use strict';
var Airtable = require('airtable');
var _ = require('lodash');

const ENDPOINT = 'https://api.airtable.com';
const BASE = process.env.GP_AIRTABLE_BASE;
const API_KEY = process.env.AIRTABLE_API_KEY;

var base = new Airtable({apiKey: API_KEY}).base(BASE);

function getRecordForNextService(date){
	//This function grabs the row/record from Airtable for either today (if date = a day with a service) or the next date when there is a service.
	return new Promise (function (resolve, reject) {
		
		var records, record;
		var filter = 'OR(IS_SAME({Date}, "' + date + '"),  IS_AFTER({Date}, "' + date + '"))';
	
		base('Week').select({
		maxRecords: 1,
		view: 'Main View',
		filterByFormula: filter,
		sort: [{field: "Date"}]
		}).firstPage(function(err,records) {
			if (err) { console.error(err); reject(err); }
			if (_.isEmpty(records)){
				reject('No data found.')
			} else {
				record = records[0];
				console.log('Retrieved', record.get('Date'));
				resolve(record);
				}
			})
	})
}

function GPDataHelper() { }

GPDataHelper.prototype.getSermonSeries = function(date){
	var err, records, weekRecord, seriesRecord;
	return new Promise (function(resolve,reject){
	
		getRecordForNextService(date).then(function(record){
			if (_.isEmpty(record.get('Series'))) {
				reject ('No data found.'); return;
			} else {
				var seriesID = record.get('Series')[0]; //This returns an array of ID's
													//but multiple isn't allowed
				base('Sermon Series').find(seriesID, function(err, record){
					if (err) {console.error(err); return;}
					console.log('Series Title:', record.get('Series Title'));
					resolve(record.get('Series Title'));
				})
			}
		})
	}) 
}	 

GPDataHelper.prototype.getSermonPassage = function(date){
return getRecordForNextService(date).then(function(record){
    		console.log(record.get('Sermon Passage'));
			return record.get('Sermon Passage');
		}).catch(function(error){
			console.log('Failed', error);
			return error;
		});
}

GPDataHelper.prototype.getOtherPassage = function(date){
return getRecordForNextService(date).then(function(record){
    		console.log(record.get('Other Reading'));
			return record.get('Other Reading');
		}).catch(function(error){
			console.log('Failed', error);
			return error;
		});
}

GPDataHelper.prototype.getSermonTitle = function(date){
	return getRecordForNextService(date).then(function(record){
    		console.log(record.get('Sermon Title'));
			return record.get('Sermon Title');
		}).catch(function(error){
			console.log('Failed', error);
			return error;
		});
}

module.exports = GPDataHelper;