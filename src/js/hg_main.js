var isIE = /*@cc_on!@*/false;
//var isIE = document.all ? true : false

/********* PATTERNS **********/
var url_match = /https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?/;

/********* POSITIONING **********/
function findMousePos(e) {
	var X = 0;
	var Y = 0;
	var evt = (e) ? e : window.event;
	if (isIE) { 
		X = event.clientX + document.body.scrollLeft;
		Y = event.clientY + document.body.scrollTop;
	} else if (evt != undefined) {
		// FIXME: why is 'evt' undefined in FFX?
		X = evt.pageX;
		Y = evt.pageY;
  	}  
  	// catch possible negative values in NS4
  	if (X < 0) X = 0;
  	if (Y < 0) Y = 0;

	return [X, Y];
}
function findPos(e) {
	var eleft = etop = 0;
	if (e.offsetParent) {
		do {
			eleft += e.offsetLeft;
			etop += e.offsetTop;
		} while (e = e.offsetParent);
		return [eleft, etop];
	}
}
function findElemPos(e) { return findPos(e); }

function scrollToElem(e) {
	var pos = findPos(e);
 	window.scrollTo(pos[0], pos[1]);
}

/********* STYLES **********/
function _removeDupStyle(e, ns) {
	var old_styles = null;
	if (typeof(e.style.cssText) == 'string')
		old_styles = e.style.cssText.split(";");
	else
		old_styles = e.getAttribute("style").split(";");
	var clean_style = "";
	for (var i = old_styles.length-1; i >= 0; i--) {
		var os = old_styles[i].split(":");
		if (ns.indexOf(os[0]+":") == -1)
			clean_style += old_styles[i]+";";
	}
	return clean_style;
}
function setStyle(e, s) {
	if (e == null || s == null) return;

	var clean = _removeDupStyle(e, s);
	if (typeof(e.style.cssText) == 'string')
  		e.style.cssText = clean+s;
	e.setAttribute('style', clean+s);
}
function getStyleProperty(e, pn) {
	if (e == null || pn == null) return "";

	var s = null;
	if (typeof(e.style.cssText) == 'string')
		s = e.style.cssText.split(";");
	else
		s = e.getAttribute("style").split(";");
	for (var i = s.length-1; i >= 0; i--) {
		var p = s[i].split(":");
		if (pn == p[0])
			return p[1].replace(/^\s+|\s+$/, "");
	}
	return "";
}

function addClass(e, c) {
	if (e == null) return;

	var classes = e.getAttribute("class");
	if (classes != null && classes.length > 0) classes += " ";
	else classes = "";
	classes += c;
	e.setAttribute("class", classes);
}

function removeClass(e, c) {
	if (e == null) return;

	var classes = e.getAttribute("class");
	if (classes == null || classes.length <= 0) return;
	var pat=eval("/\\\s*"+c+"/");
	classes = classes.replace(pat, "");
	e.setAttribute("class", classes);
}


/********* ONKEYDOWN HANDLING **********/
var OKDListeners = null;
function fireOnKeyDown(e) {
	for (var i = 0; i < OKDListeners.length; i++) {
		//console.log("OKD Listener:", OKDListeners[i]);
		OKDListeners[i](e);
	}
}
function SetupOnKeyDown() {
	if (OKDListeners == null) OKDListeners = [];
	if (document.onkeydown != null) {
		OKDListeners.push(document.onkeydown);
		//console.log("Previous listener: ", OKDListeners[0]);
	}
	if (top.location.href != window.location.href) {
		//console.log("I'VE BEEN FRAMED! p.f.d = ", parent.frames[0].document);
		//parent.frames[0].document.onkeydown = function() { console.log("w00t!!!!"); };
		//parent.frames[0].document.onkeydown = fireOnKeyDown;
		document.onkeydown = fireOnKeyDown;
	} else {
		document.onkeydown = fireOnKeyDown;
	}
	if (document.layers) document.captureEvents(Event.KEYDOWN);
}
function AddOKDListener(f) {
	if (OKDListeners == null) 
		SetupOnKeyDown();
	OKDListeners.push(f);
	return OKDListeners.length-1;
}
function RemoveOKDListener(f) {
	var idx = OKDListeners.indexOf(f);
	//console.log("RemoveOKDListener(", f, "): ", idx);
	if (idx < 0) return;
	var newArray = [];
	for (var i = OKDListeners.length-1; i >= 0; i--) {
		if (i == idx) continue;
		newArray.unshift(OKDListeners[i]);
	}
	OKDListeners = newArray;
}

/********* OVERLOADS **********/
Array.prototype.contains = function(o) {
  	var i = this.length;
  	while (i--) {
		if (this[i] == null) continue;

		var t = this[i];
		if (t.equals != undefined && t.equals(o)) return true;
    	if (t === o) return true;
  	}
  	return false;
}
Array.prototype.indexOf = function(o) {
  	var i = this.length;
  	while (i--) {
		var t = this[i];
		if (t.equals != undefined && t.equals(o)) return i;
    	if (t === o) return i;
  	}
  	return -1;
}
//Array.prototype.toString = function() { }
Object.prototype.toString = function() {
		var str = "{";
		var start = true;
		for (p in this) {
			if (!start) str += ",";
			else start = false;
			str += "'"+p+"': ";
			var val = this[p];
			if (val instanceof Array) {
				str += "[";
				for (var ii = 0; ii < val.length; ii++) {
					if (ii != 0) str += ",";
					str += "'"+val[ii]+"'";
				}
				str += "]";
			} else {
				str += "'"+val+"'";
			}
		}
		str += "}";

		return str;
}

/********* DATE FUNCTIONS **********/
var weekdays_short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var months_short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function sameDay(d1, d2) {
	if (d1.getFullYear() != d2.getFullYear()) return false;
	if (d1.getMonth() != d2.getMonth()) return false;
	if (d1.getDate() != d2.getDate()) return false;
	return true;
}
function sameWeek(d1, d2) {
	if (d1.getFullYear() != d2.getFullYear()) return false;
	if (d1.getMonth() != d2.getMonth()) return false;

	// If d1 day falls on same week as d2
	var week_top = d1.getDate()-d1.getDay();
	var week_end = week_top+6;
	if (d2.getDate() < week_top || d2.getDate() > week_end) return false

	return true;
}

function getVagueTime(t) {
	var today = new Date();
	t = new Date(t);
	var time = "";

	// First we do the date. We only care if it's not from today
	if (today.getFullYear() != t.getFullYear()) {
		time = (t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()+" ";
	} else if (!sameDay(today, t)) {
		if (today.getDate()-1 == t.getDate()) { // Check if it's yesterday
				time = "Yesterday ";
		} else if (today.getDate()-t.getDate() < 3) { // if it's less than 2 days ago
				time = "A couple of days ago ";
		} else {
			if (sameWeek(today, t)) { // this week
				time = weekdays_short[t.getDay()]+" ";
			} else { // this month
				time = months_short[t.getMonth()]+" "+t.getDate()+" ";
			}
		}
	}

	// Next we do the time	
	if (sameDay(today, t)) { //<1hr ago
		var delta_hours = today.getHours()-t.getHours();
		if (t.getHours() > today.getHours()) // The FUTURE!
			time = "From the mysterious future!";
		else if (delta_hours < 1) 
			time = "A few minutes ago";
		else if (delta_hours >= 1 && delta_hours < 2) 
			time = "About an hour ago";
		else if (delta_hours >= 2 && delta_hours < 4)
			time = "A couple of hours ago";
		else if (delta_hours >= 4 && delta_hours <= 6)
			time = "A few hours ago";
		else {
			if (t.getHours() < 11)
				time = "This morning";
			else if (t.getHours() >= 17)
				time = "Earlier this evening";
			else
				time = "This afternoon";
		}
	} else if (today.getDate()-1 == t.getDate()) { // Yesterday
		if (t.getHours() < 11)
			time += "morning";
		else if (t.getHours() >= 17)
			time += "evening";
		else
			time += "afternoon";
	} else if (today.getDate()-t.getDate() > 3) {
		time += (t.getHours() % 12)+":"+t.getMinutes();
		time += (t.getHours() > 11) ? "pm" : "am";
	}

	return time;
}

/********* MISC **********/
function getRandom(lim) { return Math.floor(Math.random()*lim); }
function textToDOM(t) {
	if (t == null) return null;
	//console.log("textToDOM(): ", t);
	if (t.indexOf(">") == -1 && t.indexOf("<") == -1) 
		return document.createTextNode(t);

	var dom = [];
	while (t.length > 0) {
		var text = null;
		if (t.charAt(0) != "<") {
			text = t.substring(0, t.indexOf("<"));
			t = t.substring(t.indexOf("<"));
			dom.push(document.createTextNode(text));
		} else {
			// TODO: attributes will break this! \/
			var tag = t.substring(t.indexOf("<")+1, t.indexOf(">"));
			var elem = document.createElement(tag);

			var tag_end_single = t.indexOf("/>");
			var tag_end_multi = t.indexOf("</"+tag+">");

			if (tag_end_single < 0 || tag_end_single >= tag_end_multi) {
				var tag_end = tag_end_multi;

				var content = t.substring(t.indexOf(">")+1, tag_end);
				if (content.indexOf("<") == -1) {
					elem.appendChild(document.createTextNode(content));
				} else {
					var elems = textToDOM(content);
					for (var i = 0, len = elems.length; i < len; i++) {
						var e = elems[i];
						if (e != null) 
							elem.appendChild(e);
					}
				}
				t = t.substring(tag.length+tag_end+3);
			} else {
				t = t.substring(tag.length+2);
			}
			dom.push(elem);

			//console.log("\t\tT: ", t);
		}
	}

	//console.log("textToDOM(): DONE >> ", dom);
	return dom;
}
function setTitle(t) {
	var title = document.getElementsByTagName('title');
	if (title.length > 0) {
		title.innerHTML = t;
	} else {
		title = document.createElement('title');
		title.appendChild(document.createTextNode(t));
		document.head.appendChild(title);
	}
}

function getDocHeight() {
    return Math.max(
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
        Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
}

function HG_loadOnCondition(condition, cb, time) {
    //console.log("HG_loadOnCondition(", condition, ", ", cb, ", ", time, ")");
    if (cb == null) return;
    if (eval(condition)) {
        //console.log("HG_loadOnCondition("+condition+"): DONE");
		cb();
	} else {
        //console.log("HG_loadOnCondition("+condition+"): WAITING");
		setTimeout(function() { HG_loadOnCondition(condition, cb, time); }, time);
	}
}
