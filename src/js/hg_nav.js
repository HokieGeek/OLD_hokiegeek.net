var hg_domain_name = "hokiegeek.net";
var hg_subdomains = [["books", "My book library"],
				    ["albums", "Pictures"],
				  	["house", "House-related stuff"],
				  	["shaving", "Shaving stuff"],
				  	["tea", "My tea journal"]];
				  	//["tree", "My genealogical tree"],
var hg_subdomains_public_lim = 6;	
var hg_subdomains_public_only = true;
var domains_per_row = 3;
var hg_nav__id = "hg_nav";
var hg_nav__obj = {
	logo: null,
	subdomains: null,
	timeout: null
};
var hg_nav_main_id = "hg_main_nav";
var hg_nav_subs_id = "hg_subdomains";
var hg_nav__logo_over = "hg_nav_logo_sel";
var hg_logo_class = "hg_logo";
var hg_logo_small_class = "hg_logo_small";
function hg_nav__onmouseover() {
	var logo = hg_nav__obj.logo;
	if (logo != null) {
		if (hg_nav__obj.timeout != null) {
			window.clearTimeout(hg_nav__obj.timeout);
			hg_nav__obj.timeout = null;
		}
		var curr_class = logo.getAttribute("class");
		if (curr_class.indexOf(hg_nav__logo_over) == -1)
			logo.setAttribute("class", curr_class+" "+hg_nav__logo_over);

		setStyle(hg_nav__obj.subdomains, "position: relative; visibility: visible; left: 0px");
	}
}
function hg_nav__onmouseout() {
	var logo = hg_nav__obj.logo;
	if (logo != null) {
		var new_class = hg_nav__obj.logo.getAttribute("class").replace(" "+hg_nav__logo_over, "");
		hg_nav__obj.timeout = 
			window.setTimeout(
					'new function() { hg_nav__obj.logo.setAttribute("class", "'+new_class+'");'+
					'setStyle(hg_nav__obj.subdomains, "position: absolute; visibility: hidden; left: -8000px"); }',
					  400);
	}
}
function hg_nav_main(id, cb) {
	var main = document.getElementById(id);
	//var main = document.createElement('div');
	//main.setAttribute('id', hg_nav_main_id);
	if (main == null) return;

	var logo = document.createElement('div');
	logo.setAttribute('id', 'hg_logo');
	logo.setAttribute('class', hg_logo_class);
	logo.appendChild(document.createTextNode(
					  hg_domain_name.charAt(0).toUpperCase()+hg_domain_name.substring(1))
				    );
	var subLyr = document.createElement('div');
	subLyr.setAttribute('id', hg_nav_subs_id);

	var subrow = document.createElement("div");
	for (var i = 0; i < hg_subdomains.length; i++) {
		//console.log(">>>>>>>>> "+(hg_subdomains.length/2));

		if (hg_subdomains_public_only && i == hg_subdomains_public_lim) break;
		var sub = hg_subdomains[i];

		// Create the basic link
		var link = document.createElement("a");
		link.setAttribute("href", "http://"+sub[0]+"."+hg_domain_name);
		link.setAttribute("target", "_top");
		link.setAttribute("title", sub[1]);
		if (cb)
			link.setAttribute("onmouseover", cb+"("+i+")");

		//var domain = document.createElement("span");
		//domain.appendChild(document.createTextNode("."+hg_domain_name));
		var name = document.createElement("span");
		name.appendChild(document.createTextNode(sub[0]));
		//name.appendChild(domain);
		link.appendChild(name);

		subrow.appendChild(link);
		//subLyr.appendChild(link);
		//subLyr.appendChild(document.createElement("br"));
		//if (i >= domains_per_row && (i % domains_per_row) == domains_per_row-1) {
		if (((i % domains_per_row) == domains_per_row-1) || i == hg_subdomains.length-1) {
			subLyr.appendChild(subrow);
			subrow = document.createElement("div");
		}
	}

	main.insertBefore(subLyr, main.firstChild);
	main.insertBefore(logo, main.firstChild);

	//document.body.insertBefore(main, document.body.firstChild);
}
function hg_small_nav() {
	var nav = document.createElement("div");
	nav.setAttribute("id", hg_nav__id);
	nav.setAttribute("onmouseout", "hg_nav__onmouseout()");
	nav.setAttribute("onmouseover", "hg_nav__onmouseover()");

	var nav_subs = document.createElement("div");
	nav_subs.setAttribute("id", "hg_nav__subdomains");
	for (var i = 0; i < hg_subdomains.length; i++) {
		if (hg_subdomains_public_only && i == hg_subdomains_public_lim) break;

		var sub = hg_subdomains[i];
		var l = document.createElement('a');
		l.setAttribute("href", "http://"+sub[0]+"."+hg_domain_name);
		l.setAttribute("target", "_top");
		l.setAttribute("title", sub[1]);
		l.appendChild(document.createTextNode(sub[0]));

		if (i != 0) nav_subs.appendChild(document.createTextNode("\u00a0\u00a0")); // two NBSP
		nav_subs.appendChild(l);
	}
	nav.appendChild(nav_subs);

	var nav_logo = document.createElement("a");
	nav_logo.appendChild(document.createTextNode(hg_domain_name));
	nav_logo.setAttribute("class", hg_logo_class+" "+hg_logo_small_class);
	nav_logo.setAttribute("href", "http://"+hg_domain_name);
	nav_logo.setAttribute("target", "_top");
	nav.appendChild(nav_logo);

	// Append it to the body
	hg_nav__obj.logo = nav_logo;
	hg_nav__obj.subdomains = nav_subs;

	// Now fade the edges
	var last_op = 9;
	for (var j = 1; j < 6; j++) {
		var common = "opacity: ."+last_op+";";

		var border_fade = document.createElement('div');
		border_fade.setAttribute("class", "hg_nav_fade");
		setStyle(border_fade, common+" left: "+(j-1)+"px; border-right-width: 1px; ");
		nav.insertBefore(border_fade, nav_logo);

		border_fade = document.createElement('div');
		border_fade.setAttribute("class", "hg_nav_fade");
		setStyle(border_fade, common+" left: -"+j+"px; border-left-width: 1px; ");
		nav.insertBefore(border_fade, nav_logo);
							  
		last_op -= 2;
	}

	document.body.appendChild(nav);
}
