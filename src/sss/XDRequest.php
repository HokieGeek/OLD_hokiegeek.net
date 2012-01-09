<?php
error_reporting(E_ALL ^ E_NOTICE);

include "GoogleServiceAuth.php";
include "XML.php6";

// Decode the variables
$write_to_js = false;
if (array_key_exists("u", $_GET)) $u = urldecode($_GET["u"]); // The URL
if (array_key_exists("l", $_GET)) $l = urldecode($_GET["l"]); // Login
if (array_key_exists("store", $_GET)) $store = urldecode($_GET["store"]); // Stored in a file
if (array_key_exists("gs", $_GET)) $gs = urldecode($_GET["gs"]); // URL is for a google service defined in 'gs'

// Create the curl instance
$ch = curl_init() or die ("Unable to initialize curl");
if ($gs) {
	$gAuth = GetGoogleServiceAuth($gs);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: GoogleLogin auth=$gAuth"));
}
curl_setopt($ch, CURLOPT_URL, $u);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);  
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);  
curl_setopt($ch, CURLOPT_CAINFO, "cacert.pem");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
if (isset($l)) curl_setopt($ch, CURLOPT_USERPWD, $l);

if (count($_POST) > 0) {
	$params = "";
	foreach ($_POST as $i => $value) {
		if (strlen($params) > 0) $params = $params."&";
		//$param = preg_replace("/_/", ".", urldecode($i))."=".urldecode($_POST[$i]);
		$param = preg_replace("/_/", ".", $i)."=".$_POST[$i];
		//echo $param."&";
		$params = $params.$param;
	}
	//echo "PARAMS: ".$params;

	curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
}

//print_r($_POST);

// Perform curl request
$c = curl_exec($ch);
$Headers = curl_getinfo($ch);

//$isJSON = false;
if ($Headers['http_code'] == 200) {
	$content_type = explode("/", curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
	$content_type = explode(";", $content_type[1]);
	$content_type = $content_type[0];
	//echo "Content Type: ".$content_type."<br />";

	switch ($content_type) {
	case "html":
	case "xml": 
	case "atom+xml": 
		$parsedXML = new XML($c);
		$c = $parsedXML->toJSON();
	case "x-javascript": 
	case "json":
		header('Content-Type: text/json');
		//$isJSON = true;
	default: break;
	}
} else {
	(!curl_errno($ch)) 
		or die ($v."var XDRquest_ERR = 'An error ocurred with curl: [".curl_errno($ch)."] ".curl_error($ch)."';");
}
curl_close($ch);

// Store the data if it has been requested
if (isset($store)) {
	//$var = 'var XDRquest_ret = ';
	//$var = "if(typeof(".$store.") == 'undefined') var ".$store." = ";
	//if ($isJSON) $var .= "eval(";
	//$js = $var. $c.";";
	//if ($isJSON) $js .= ");";

	$fh = fopen("gen/".$store.".json", 'w');
	fwrite($fh, $c);
	fclose($fh);
}
echo $c; // Return the parsed content
?>
