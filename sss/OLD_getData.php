<?php
// Decode the variables
$write_to_js = false;
if (array_key_exists("u", $_GET)) $u = urldecode($_GET["u"]); // The URL
if (array_key_exists("l", $_GET)) $l = urldecode($_GET["l"]); // Login
if (array_key_exists("v", $_GET)) $v = urldecode($_GET["v"]); // JS var name
if (array_key_exists("js", $_GET)) $write_to_js = true; // Save data to a JS file

/* TODO
 IF js AND file has been created AND it's < some_arbitrary_age (like 3s)
 	then just say you're done and don't bother the nice people at twitter
*/

// Perform curl request
$ch = curl_init() or die ($v." = [null]; var getData_ERR = 'Unable to initialize curl';");
curl_setopt($ch, CURLOPT_URL, $u);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_GET, true);
if ($l) curl_setopt($ch, CURLOPT_USERPWD, $l);

$c = curl_exec($ch);
$Headers = curl_getinfo($ch);
/*echo "URL: ".$u."<br />";
echo "Login: ".$l."<br />";
echo "HTTP CODE: ".$Headers['http_code']."<br />";
echo "ERROR: [".curl_errno($ch)."] ".curl_error($ch)."<br />";*/

if ($Headers['http_code'] == 200) {
	$content_type = explode("/", curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
	$content_type = explode(";", $content_type[1]);
	$content_type = $content_type[0];

	//echo "Content Type: ".$content_type."<br />";

	switch ($content_type) {
	case "x-javascript": 
	case "json":
		if (!$write_to_js)
			header('Content-Type: text/json');

		// Fix the content  
		break;
	//case "html":
	case "plain":
		// Fix the content  
		//if (!array_key_exists("txt", $_GET)) $c = str_replace("\n", "", $c);
		//$c = str_replace("\r\n", "AFP", $c);
		//$c = nl2br($c);
		/*$c = preg_replace("/(\r\n)+|(\n|\r)+/", " ", $c);
		$c = str_replace("\"", "\\\"", $c);
		if ($c[0] != '[') $c = '"'.$c.'"';
		$c = 'if(typeof('.$v.') == \'undefined\') '.$v.' = {}; var '.$v.' = '.$c.';';*/
		//$c = "html";
		break;
	case "html":
	case "xml": 
		/*$c = preg_replace("/(\r\n)+|(\n|\r)+/", " ", $c);
		$c = str_replace("\"", "\\\"", $c);
		
		if (!array_key_exists("v", $_GET))
			$c = 'getData_ret = "'.$c.'";';	
		else
			$c = $v.' = "'.$c.'";';	*/
		//$c = ' = "html"';
		break;
	default: break;
	}
} else {
	(!curl_errno($ch)) 
		or die ($v."var getData_ERR = 'An error ocurred with curl: [".curl_errno($ch)."] ".curl_error($ch)."';");
	//if(!ereg("[123][0-9][0-9]", curl_getinfo($ch, CURLINFO_HTTP_CODE))) 
		//$c = "null"; 
}

curl_close($ch);

if (isset($v)) {
	$c = 'if(typeof('.$v.') == \'undefined\') var '.$v.' = {}; '.$v.' = '.$c.';';
} else if ($write_to_js) {
	$c = 'ver getData_ret = '.$c.';';
}

// Now output the data
if ($write_to_js) {
	header('Content-Type: text/html');

	$fh = fopen($v.".js", 'w');
	fwrite($fh, $c);
	fclose($fh);

	echo "DONE";
} else {
	echo $c; // Return the content
}

?>
