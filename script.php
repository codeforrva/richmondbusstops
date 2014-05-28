<?php
$finalArray = array();
 $file = fopen('TransportationRoutePlanforMr.Henderson.csv', 'r');
 $currentSchool = '';
 $currentRouteNumber = '';
 while( ($row = fgetcsv($file,0, "|")) !== false){
 	//skip the first row
 	if($row[0] == "4/2/2013 4:35:29 PM"){
 		$currentSchool = '';
 		$currentRouteNumber = '';
 		continue;
 	}
 	if(preg_match('/^Bus Stop Locations For ([\d]{3})/',$row[3], $matches) === 1){
 		//skip the Bus Stop Locations row as well
 		continue;
 	}

 	if($row[0] == "Anchor:"){
 		
 		$currentSchool = strtoupper($row[1]);
	
 	}

 	if($row[0] == "Route:"){
 		$currentRouteNumber = $row[1];
 	}

 	if(preg_match('/([\d]):([\d]{2}) ([a-z]{2})/',$row[0], $matches) == 1){
 		//in the matches, index 1 is the hours, index 2 is the minutes, and index 3 is the meridan
 		$hours = (int)$matches[1];
 		$minutes = (int)$matches[2];
 		if($matches[3] == "pm"){
 			$hours = $hours + 12;
 		}

 		$routeInfo = array();
 		$routeInfo['time'] = $hours . ":" . $minutes;
 		$routeInfo['type'] = $row[1];

 		$routeInfo['address'] = wrangleAddr($row[3]);

 		$latlng = getLatLang($routeInfo['address']);
 		
 		$routeInfo['loc'][] = $latlng->results[0]->geometry->location->lng;
 		$routeInfo['loc'][] = $latlng->results[0]->geometry->location->lat;

 		if($row[9] !== null && $row[9] !== ''){
 			$routeInfo['kids_effected'] = $row[9];
 		}else{
 			$routeInfo['kids_effected'] = $row[10];
 		}

 		$routeInfo['school'] = $currentSchool;
 		$routeInfo['route_num'] = $currentRouteNumber;
 		$finalArray[] = $routeInfo;

 	}
 	var_dump($finalArray);

 }

fclose($file);


file_put_contents('result.json', json_encode($finalArray));

function wrangleAddr($addr){
	//replace @ with AT
	$addr = str_replace('@', ' AT ' , $addr);

	//let's see if we need to strip brackets or parentheses
	//and also strip the 'No Intersection' shit
	$patterns[0] = '/\[[A-Za-z]+\]/';
	$patterns[1] = '/\(  [A-Za-z ]+\)/';
	$patterns[2] = '/No Intersection/';
	$replacements = array('', '', '');
	return preg_replace($patterns, $replacements, $addr);

}

function getLatLang($addr){
	 $coord_url = "http://www.datasciencetoolkit.org/maps/api/geocode/json?sensor=false&address=" . urlencode($addr . ",Richmond, VA");
	 $ch = curl_init();
	 curl_setopt($ch, CURLOPT_URL, $coord_url);
	 curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	 $output = curl_exec($ch);
	 curl_close($ch);
	 return json_decode($output);

}


?>