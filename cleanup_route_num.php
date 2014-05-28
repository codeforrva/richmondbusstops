<?php
$contents = json_decode(file_get_contents('routes.json'));

preg_match('/(\d{3}[A-Z]{3}\d{2})/',"108RGP07 driver update 12/28/2012", $matches);
var_dump($matches);
for($i=0; $i < count($contents); $i++){
	preg_match('/(\d{3}[A-Z]{3}\d{2})/',$contents[$i]->route_num, $matches);
	var_dump($matches);
	$contents[$i]->route_num = $matches[0];
}

file_put_contents('routes.json', json_encode($contents));

?>

"time": "14:00",
    "type": "STOP",
    "address": "Test Stop",
    "loc": [
        -77.517848,
        37.511092
    ],
    "school": "TEST",
    "route_num": "111TTP01"