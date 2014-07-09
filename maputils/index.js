var mquery = require('mquery');
var mongo = require('mongodb').MongoClient;
var mongo_cred = require('../db/index.js');


exports.normalizeLatLng = function(coordinates){
	//this is lng, lat order
	var lng = coordinates[0],
	 	lat = coordinates[1];

	return [lat,lng];

};

exports.findNearestBusStop = function(geoInfo, clientHours, school, cb){
	mongo.connect(mongo_cred.db_uri, function(err, db){
		if(err){
		 cb(err, []);
		}else{
			console.log(school);
			var busstops = db.collection('routes');
			var letter;
			(clientHours < 8) ? letter = "P" : letter = "D";
			console.log(letter);

			mquery(busstops).where('loc').near({ center: [geoInfo.results[0].geometry.location.lng, geoInfo.results[0].geometry.location.lat], 
				spherical: true, maxDistance: 0.3 })
					.where('school').regex('.*' + school +'.*')
					.where('route_num').regex(letter)
					.where('type').equals('STOP')
					.exec(function(err, docs){
						var error = null;
						if(err) error = err;
						console.log('found bus stop!');
						db.close();
						cb(error, docs);
			});
		}		
	});
}


exports.getRoute = function(routeLabel, cb){
	mongo.connect(mongo_cred.db_uri, function(err, db){
		if(err) throw err;
		console.log(routeLabel);
		var busstops = db.collection('routes');

		mquery(busstops)
			.where('route_num')
			.equals(routeLabel)
			.sort({time:'asc'})
			.exec(function(err, docs){
				var error = null;
				if(err) error = err;
				console.log('found routes!');
				db.close();
				cb(error, docs);
			});
	
	});	
}