//******************************************************************************

// Detects the user's browser and creates a variable that identifies it.
var agt=navigator.userAgent.toLowerCase();
var is_major = parseInt(navigator.appVersion);
var is_ns     = ((agt.indexOf('mozilla') != -1) && (agt.indexOf('spoofer') == -1)
                 && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera') == -1)
                 && (agt.indexOf('webtv') == -1) && (agt.indexOf('hotjava') == -1));
var is_ns6    = (is_ns && (is_major == 5) && (agt.indexOf('rv:0.9') != -1));
var is_ns7up  = (is_ns && !is_ns6);
var is_gecko   = (agt.indexOf('gecko') != -1);
var is_ie      = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));

if (document.all) {
	var detect = navigator.userAgent.toLowerCase();
	var browser,thestring;
	var version = 0;

	if (checkIt('msie')) 
	{
		browser = "IE "
		browser += detect.substr(place + thestring.length,3);
		document.title = browser + ' - ' + document.title;
	}
}

function checkIt(string) {
	place = detect.indexOf(string) + 1;
	thestring = string;
	return place;
}

var is_ie55 = (is_ie && browser == "IE 5.0");
var is_ie55 = (is_ie && browser == "IE 5.5");
var is_ie60 = (is_ie && browser == "IE 6.0");

