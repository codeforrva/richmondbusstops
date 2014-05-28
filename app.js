var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var socket = require('socket.io').listen(server);
var map_util = require('./maputils/index.js');
app.use(express.static(__dirname + "/public"));
app.use("/packages", express.static(__dirname + "/bower_components"));
app.use(express.bodyParser());
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res){
	res.render('index.html');
});

app.post('/find', function(req, res){
	var route_list = [];
	var myLocation = map_util.normalizeLatLng([-77.520968,37.513003]);
	var nearestBusStop = map_util.normalizeLatLng([-77.520626, 37.512143]);
	//get the routes where that bus stop belongs to
	var routes_coordinates = [
					{time: '19:02', loc:[-77.517848,37.511092], type:'start'},
					{time: '19:10', loc:[-77.519779,37.510266], type:'stop'},
					{time: '19:12', loc:[-77.520626, 37.512143], type:'stop'},
					{time: '19:14', loc:[-77.522971,37.515355], type:'stop'},
					{time: '19:15', loc:[-77.524939,37.51584], type:'dest'}
														];
	for(var i = 0; i < routes_coordinates.length; i++){
		routes_coordinates[i].loc = map_util.normalizeLatLng(routes_coordinates[i].loc);
	}

	
	res.render('results.html', {myBusStop: nearestBusStop, myLocation: myLocation, routes_coordinates: routes_coordinates} );
});

app.post('/find_address', function(req, res){
	var app_res = res;
	var app_req = req;
	var	myLocation, nearestBusStop, nearestBusStopAddress;
	var routes_coordinates = [];
	var school = req.body.school;
	var address = req.body.address;
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

			
			map_util.findNearestBusStop(geoAddressData, school, function(err, data){
					console.log(data);
					nearestBusStop = map_util.normalizeLatLng(data[0].loc);
					nearestBusStopAddress = data[0].address;
					//then get the route
					//but first let's see if we get the morning or afternoon route
					if(new Date().getHours() < 8){
						//P is for pickup
						var route_num = data[0].route_num.slice(0,5) + "P" + data[0].route_num.slice(-2);
					}else{
						//D is for dropoff
						var route_num = data[0].route_num.slice(0,5) + "D" + data[0].route_num.slice(-2);
					}
					map_util.getRoute(route_num, function(err, data){
						console.log(data);
						routes_coordinates = data;
						for(var i = 0; i < routes_coordinates.length; i++){
							routes_coordinates[i].loc = map_util.normalizeLatLng(routes_coordinates[i].loc);
						}
						app_res.render('results.html', {myBusStop: nearestBusStop, nearestBusStopAddress: nearestBusStopAddress, myLocation: myLocation, routes_coordinates: routes_coordinates});
					});
			});
		});
	}).on('error', function(e){
		console.log(e);
	});

});	





server.listen(8080);


