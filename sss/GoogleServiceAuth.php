<?php
/*
Algorithm:
	Look for an auth key that matches the service in gauth.keys. 
	if its timestamp is > 23 hours, then request a new one
	else return it
*/
/*
curl https://www.google.com/accounts/ClientLogin -k -d Email=andres.f.perez@gmail.com -d Passwd='Grace42`' -d accountType=GOOGLE -d source=TESTING -d service=wise

http://code.google.com/apis/gdata/faq.html#clientlogin
Blogger - 		 blogger
Calendar -		 cl
Contacts -		 cp
Documents List - writely
Finance -	 	 finance
Gmail -			 mail
Health -		 health || weaver (H9 sandbox)
Maps -			 local
Picasa Web - 	 lh2
Spreadsheets -	 wise
YouTube - 		 youtube

*/
// Retrieve the service

$authKeysFile = "gen/gauth.keys";
$authKeys = null;
$keysDelim = "&";
$TWENTY_THREE_HOURS = (60*60)-60;
$AUTH_KEY_NAME="Auth=";
function over_23hours($d) {
	return (($d+$TWENTY_THREE_HOURS) < time());
}
function get_keys() {
	global $authKeysFile, $authKeys, $keysDelim;
	$fh = fopen($authKeysFile, 'r');
	while (!feof($fh)) {
		$line = fgets($fh);
		$service_boom = explode($keysDelim, $line);
		if (strlen($service_boom[0]) > 0)
			$authKeys[$service_boom[0]] = array($service_boom[1], $service_boom[2]);
	}
	fclose($fh);
}
function get_key($service) {
	global $authKeys;
	$key = null;
	if ($authKeys == null) get_keys();
    if ($authKeys == null) return $key;
	if (array_key_exists($service, $authKeys) && !over_23hours($authkeys[$service][1]))
		$key = $authKeys[$service][0];
	return $key;
}
function save_keys() {
	global $authKeysFile, $authKeys, $keysDelim;
	$fh = fopen($authKeysFile, 'w');
	foreach ($authKeys as $s => $v)
		fwrite($fh, $s.$keysDelim.$v[0].$keysDelim.$v[1]."\n");
	fclose($fh);
}
function save_key($service, $key) {
	global $authKeys;
	if ($service == "wise")
		$authKeys[$service] = array($key, time()-(60*60));
	else
		$authKeys[$service] = array($key, time());
	save_keys();
}
function parse_content($c) {
	$auth = substr($c, strpos($c, "Auth=")+strlen("Auth="));
	//$auth = substr($c, strpos($c, $AUTH_KEY_NAME)+strlen($AUTH_KEY_NAME));
	//$auth = substr($c, strpos($c, $AUTH_KEY_NAME));
	return $auth;
}
function format_key($key) {
	return $key;
}
function format_error($err) {
	return $err;
}

function GetGoogleServiceAuth($service) {
	$authKey = get_key($service); // Retrieve from file, if possible
	//if ($authKeys != null)
		//echo print_r($authKeys)."<br />";

	if ($authKey == null) { // get a new one
		//$authKey = "IOIAsnasdoas.--....asd292nhaadadkjaksdfhasldfkjasgnkjhiuyhad922l...";
		/*
		echo "SERVICE: ".$service."<br />";

		$gAuth = "SID=DQAAALEAAABW5yE3QB_jka2Unu8X_aya-zvgVhrjFygkk9pEd6P25XOmaY2_PbBvjJl8UnvJVMjcIoBV7WCjeBecxMP3EOjYCqVl90VdgzF38qOAraDM64O5kgKs1XNi4_pM5NjXxO5QDiXXrJLp5G5i_0YaatY53c80jJv6zLscyt_nQZzoxJOPd6KJqV8Ekqr1WHGaIi2aNPZMRHJpi17wcBPb04LN5k58tSExkZx9l_nkWCmuEr56ZxpGyoLb0RZh-Al0RWY
		LSID=DQAAALIAAABGX2i_0TXZRezH0mV1HPv5UwpUc-zpJPRNjXgYChdnl0Rh7niKjU7--6Q3ntFB6QMcxJCfkA8LIE8ZLt-umbhkfQwV1Re42D7VJb6LQdaAHONdY87l_5TwLoHOSPdOnmfUsyVNRLw4X3DS96gqDqqnkwGK8ffGukSkR8nz6HsJrnTEYdJhXEW-nIBUeZg1jhe7J2DoMT1Xg1RBZwOhpnua_Sb1DhYah16YPz76Ip3mObow3A9vrTXilymg4ojm4R0
		Auth=DQAAALIAAABGX2i_0TXZRezH0mV1HPv5UwpUc-zpJPRNjXgYChdnl0Rh7niKjU7--6Q3ntFB6QMcxJCfkA8LIE8ZLt-umbhkfQwV1Re42D7VJb6LQdaAHI54le3LA2RTQ4mwZx8wrCQ-3jd3UIrf97OTQgvmokeElmrG9h9JJh7-UPDNzWoyF1n5aYC-aozgDTfQwBWiIUwfd50HRJI2awwdu9sAST0UvpAmwnwhNm33X2uU4T34qZNvg8xoaeGrU25rj6r96n0";
		*/
		$ch = curl_init();  
  	
		curl_setopt($ch, CURLOPT_URL, "https://www.google.com/accounts/ClientLogin");  
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  
  
		$authData = array('Email' => 'andres.f.perez@gmail.com',  'Passwd' => 'keri2782',  
				  	  	  'accountType' => 'GOOGLE',  'source' => 'hokiegeek.net_TESTING', 
				  	  	  'service' => $service);  
  
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);  
		curl_setopt($ch, CURLOPT_POST, true);  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  
		curl_setopt($ch, CURLOPT_HEADER, true);  
		curl_setopt($ch, CURLOPT_POSTFIELDS, $authData);  

		//$gAuth = curl_redir_exec($ch, $authData);
		$gAuth = curl_exec($ch);  
		if (curl_errno($ch))
			echo "An error occurred with curl: [".curl_errno($ch)."] ".curl_error($ch)."<br />";
		$Headers = curl_getinfo($ch);
 		/* 
		echo "HTTP CODE: ".$Headers['http_code']."<br />";
		echo "OPEN_BASEDIR: ".ini_get('open_basedir')."<br />";
		echo "SAFE_MODE: ".ini_get('safe_mode')."<br />";
		*/
		//echo "CONTENT: ".$gAuth."<br /><br />";
		if ($Headers['http_code'] == 200) {
			$authKey = parse_content($gAuth);
			//echo "AUTH KEY: ".$authKey."<br />";
			//$content_type = explode("/", curl_getinfo($ch, CURLINFO_CONTENT_TYPE));

			save_key($service, $authKey); // save to file
		}
	}
	return format_key($authKey);
}
?>
