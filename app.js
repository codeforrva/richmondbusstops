var express = require('express');
var http = require('http');
var app = express();
var map_util = require('./maputils/index.js');



app.use(express.static(__dirname + "/public"));
app.use("/packages", express.static(__dirname + "/bower_components"));
app.use(express.bodyParser());
app.use("views", express.static(__dirname + "/views"));
app.use(app.router);
app.use(function(err, req, res, next){
	res.status(500);
	res.render("error.html", {error: err});
});

app.engine('html', require('ejs').renderFile);





app.get('/', function(req, res){
	res.render('login.html');
});

app.post('/login', function(req, res){
	if(req.body.username !== 'richmond804' && req.body.password !== 'this is for code for america'){
		res.render('error.html');
	}else{
		res.redirect('/form');
	}
});

app.get('/form', function(req, res){
	res.render('index.html');
});


app.post('/find_address', function(req, res, next){
	var app_res = res;
	var app_req = req;
	var app_next = next;
	var	myLocation, nearestBusStop, nearestBusStopAddress;
	var routes_coordinates = [];
	var school = req.body.school;
	if(req.body.address.match(/[ /](richmond|Richmond),[ /](va|VA)/i)) {
		var address = req.body.address;
	}else{
		var address = req.body.address + ' ,Richmond, VA';
	}
	var clientHours = req.body.hours;
	console.log(clientHours);
	//we need to geocode the user's address. 
	var geoAddressData= '';
	var geocodeAPI = "http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=" + encodeURIComponent(address);
	var geoAddress = http.get(geocodeAPI, function(res){
		res.on('data', function(chunk){
			geoAddressData += chunk;
		});

		res.on('end', function(){
			geoAddressData = JSON.parse(geoAddressData);
			myLocation = [geoAddressData.results[0].geometry.location.lat, 
								geoAddressData.results[0].geometry.location.lng];

			
			map_util.findNearestBusStop(geoAddressData, clientHours, school, function(err, data){
					if(err){
						var error = err;
						console.log(err);
						app_next(error);
					}else if(data.length == 0){
						app_res.render('no_results.html');
					}else{
						console.log(data[0]);
						nearestBusStop = map_util.normalizeLatLng(data[0].loc);
						nearestBusStopAddress = data[0].address;
						//then get the route
						//but first let's see if we get the morning or afternoon route
						console.log("the hours is " + clientHours);
						var route_num = data[0].route_num;
						
						map_util.getRoute(route_num, function(err, data){
							console.log(data);
							routes_coordinates = data;
							for(var i = 0; i < routes_coordinates.length; i++){
								routes_coordinates[i].loc = map_util.normalizeLatLng(routes_coordinates[i].loc);
							}
							app_res.render('results.html', {myBusStop: nearestBusStop, nearestBusStopAddress: nearestBusStopAddress, myLocation: myLocation, routes_coordinates: routes_coordinates});
						});
					}
			});
		});
	}).on('error', function(e){
		console.log(e);
		app_next(new Error("Could not connect to geocoding service!"));
	});

});	





app.listen(10817);


