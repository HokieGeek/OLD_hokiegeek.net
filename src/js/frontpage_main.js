var twitterJSON = "http://api.twitter.com/1/statuses/user_timeline/hokiegeek.json?count=1";
var nav_desc_lyr = null;
var tweet_msg_lyr = null;
var TWEET_UPDATE_INTERVAL = 50000; // Every 50 seconds
function updateTwitter(ret) {
	var msg = null;
	var time = "\u00a0";
	if (ret == null) {
		msg = "No tweets!";
	} else {
		//console.log("updateTwitter()", ret);
		if (eval(ret) == null || eval(ret)[0] == null) return;
		var update = eval(ret)[0];

		// Format the text by dealing with special strings (replys, links, hashtags)
		var tweet_text = update.text;
		var special = tweet_text.match(/(https?:\/\/|[@#])\S+/g);
		//console.log("special: ", special);
		msg = document.createElement('span');
		if (special != null && special.length > 0) {
			var pos = 0;
			var last_pos = 0;
			for (i in special) {
				//console.log(i);
				if (i == "contains" || i == "indexOf" || i == "shuffle") continue;
				var s = special[i];
				pos = tweet_text.indexOf(s);
				var text = tweet_text.substring(last_pos, pos);
				last_pos = pos+s.length;

				if (text.length > 0) {
					//console.log("TEXT: ", text);
					msg.appendChild(document.createTextNode(text));
				}
				var lnk = document.createElement('a');
				var l = "";
				var ttl = "";
				var s2 = s.substring(1);
				switch (s.charAt(0)) {
				case '@': l = "http://twitter.com/"+s2; 
						  ttl = "View "+s2+"'s twitter stream";
						  break;
				case '#': l = "http://twitter.com/search?q=%23"+s2; 
						  ttl = "Search twitter for how '"+s2+"' is trending";
						  break;
			    	default: l = s; break;
				}
				lnk.setAttribute('href', l);
				lnk.setAttribute('title', ttl);
				lnk.appendChild(document.createTextNode(s));
				//console.log("LINK: ", lnk);
				msg.appendChild(lnk);
			}
		} else
			msg.appendChild(document.createTextNode(tweet_text));

		// Now take care of the time
		var t = update.created_at;
		time = "shhhh....";
		if (t != null)
			time = getVagueTime(t);
	} 

	if (tweet_msg_lyr == null)
		tweet_msg_lyr = document.getElementById("tweet").getElementsByTagName('div')[0];
	if (msg != null) {
		tweet_msg_lyr.removeChild(tweet_msg_lyr.firstChild);
		tweet_msg_lyr.insertBefore(msg, tweet_msg_lyr.firstChild);
		if (time != null)
			tweet_msg_lyr.firstChild.nextSibling.innerHTML = time;
	}
}
function requestTweet() {
	//(new libHTTPRequest()).getData(twitterJSON, "l=HokieGeek:keri2782", updateTwitter, true);
	(new libHTTPRequest()).getData(twitterJSON, null, updateTwitter, true);
}
function showSubDesc(sub) {
	setStyle(nav_desc_lyr, "visibility: visible;");
	nav_desc_lyr.innerHTML = hg_subdomains[sub][1];
}
function setupSubdomainDesc() {
	var subs = document.getElementById(hg_nav_subs_id).getElementsByTagName('a');
	for (var i = subs.length-1; i >= 0; i--) {
		subs[i].setAttribute("onmouseover", "showSubDesc("+i+")");
		subs[i].setAttribute("onmouseout", "setStyle(nav_desc_lyr, 'visibility: hidden;')");
	}
}

function loadingMessage(m) { } // FIXME

var featuresMgr = null;
var readingTabs = null;

function createTableFromObject(obj, props, ratings) {
	var table = document.createElement("table");
    var tr = null;
    var cell = null;
    var prop = null;

	for (var ii = 0; ii < props.length; ii++) {
		p = props[ii];
		var name = p.charAt(0).toUpperCase()+p.substr(1);
		//console.log("OBJ: ", obj, ", p: ", p);
		var val = "n/a";
		if (obj[p] != null) {
			val = (obj[p].getName != undefined) ? obj[p].getName() : obj[p];
			/*
			if (name == "Ratings" && ratings != undefined) {
				name = "Rating";
				//val = ratings[obj[p]];
            	var img = document.createElement("img");
				img.setAttribute("src", ratings[obj[p]]);
				img.setAttribute("title", obj[p]);
				val = img;
				} else
			 */
				//val = document.createTextNode(val);
		}
		tr = document.createElement("tr");
        cell = document.createElement("td");
        cell.appendChild(document.createTextNode(name));
        tr.appendChild(cell);
        cell = document.createElement("td");
        cell.appendChild(document.createTextNode(val));
        tr.appendChild(cell);
		table.appendChild(tr);
	}

	return table;
}
function setupFeatures(e) {
	if (featuresMgr == null) {
		featuresMgr = new HG_FeatureManager()
		featuresMgr.create(e);
	}

	// Retrieve the shaving stuff
	featuresMgr.addFeature(new HG_FeatureView(
		new HG_Feature("Baby Butt Smooth", "http://shaving.hokiegeek.net",
			function() {
				this.data = ShavingJournalEntries[0];
			    this.data_updated = true;
			}, 
			function() {
				getShavingData(null);
                return "(ShavingJournalEntries != undefined && ShavingJournalEntries.length > 0)";
			},
			30),
		function(content_elem) {
			if (content_elem == null) return false;
			if (!this.data.data_updated || this.data.data == null) return false;

			var d = this.data.data;
            if (d == null) {
                console.log("ERROR: Could not find shaving data!");
                return false;
            } else
                console.log("Found shaving data: ", d);

            // TODO: This should be a looping slideshow of all the primary pictures in this shave
			var picLyr = document.createElement("div");
			picLyr.setAttribute("class", "hg_feature_content_pic");
			var shave_image = document.createElement("img");
			var pic = d.Razor.Pictures[0];
			if (pic.getURL != undefined) pic = pic.getURL(200);
            shave_image.setAttribute("src", pic);
			//picLyr.appendChild(shave_image);
			//content_elem.appendChild(picLyr);
			content_elem.appendChild(shave_image);

			var shave_details = document.createElement("div");
			var products = [];
			products.push("Razor");
			products.push("Brush");
            if (d.Strop != null) products.push("Strop");
            else products.push("Blade");
            if (d.Cream != null) products.push("Cream");
            else products.push("Soap");

			var table = createTableFromObject(d, products);
			//shave_details.appendChild(table);

            //var ratings = document.createElement("div");

            var ratings = document.createElement("div");
            for (var ii = 0; ii < grade_scale.length; ii++) {
                var img = document.createElement("img");
                var img_src = "shaving/img/shave_grade_"+grade_scale[ii].toLowerCase();
                img_src += (grade_scale[ii] != d.Grade) ? "_dark" : ""
                img_src += ".png";
                img.setAttribute("src", img_src);
                img.setAttribute("title", grade_scale[ii]);
                ratings.appendChild(img);
            }
			//shave_details.appendChild(ratings);
			tr = document.createElement("tr");
            cell = document.createElement("td");
            //cell.appendChild(document.createTextNode("Rating"));
            tr.appendChild(cell);
            cell = document.createElement("td");
            cell.appendChild(ratings);
            tr.appendChild(cell);
			table.appendChild(tr);
			shave_details.appendChild(table);

			content_elem.appendChild(shave_details);

            return true;
		}
	));

    // Tea
//"http://tea.hokiegeek.net",
    featuresMgr.addFeature(new HG_FeatureView(
        new HG_Feature("Give us a Cuppa, Govna", null,
            function() {
                this.data = TeaJournalEntries[0];
                this.data_updated = true;
            },
            function() {
                getTeaData(null);
                return "(TeaJournalEntries != undefined && TeaJournalEntries.length > 0)";
            },
            30),
        function(content_elem) {
            if (content_elem == null) return false;
            console.log("TEA RENDERER: ", content_elem);

            var d = this.data.data;

			//var pic = document.createElement("div");
			var img = document.createElement("img");
			img.setAttribute("class", "hg_feature_content_pic");
			img.setAttribute("src", d.Tea.Pictures[0].getURL(200));
			//pic.appendChild(img);
			//content_elem.appendChild(pic);
			content_elem.appendChild(img);

			var details = document.createElement("div");

			var table = document.createElement("table");
			var row = null;
			var cell = null;

			// Name
			var tea_name = document.createElement("div");
			tea_name.setAttribute("id", "latest_cuppa_tea_name");
			tea_name.appendChild(document.createTextNode(d.Tea.getName()));
			if (d.Tea.Type != "Blend")
				tea_name.appendChild(document.createTextNode(" ("+d.Tea.Type+")"));
		
			// Fixins
			var tea_fixins = d.Fixins;
			//tea_fixins = ["Milk", "Honey"]; // FIXME
			if (tea_fixins != null) {
				var fixins_list = document.createElement("div");
				fixins_list.setAttribute("id", "latest_cuppa_tea_fixins");
				fixins_list.innerHTML = "with ";
				//for (var i = 0; i < tea_fixins.length; i++) {
				for (var i = tea_fixins.length-1; i >= 0; i--) {
					//if (i == tea_fixins.length-1)
					if (i == 0)
						fixins_list.innerHTML += " and ";
					//else if (i != 0)
					else if (i != tea_fixins.length-1)
						fixins_list.innerHTML += ", ";
					fixins_list.innerHTML += tea_fixins[i].toLowerCase();;
				}
				tea_name.appendChild(fixins_list);
			} 
			// TODO: sessions

			//row = document.createElement("tr");
			//row.appendChild(tea_name);
			//table.appendChild(row);
			content_elem.appendChild(tea_name);

			// Steeping details
			if (d.EntryDate != null || d.SteepTime != null || 
				d.Temperature != null || d.SteepingVessel != null) {

				var steeping_details = document.createElement("div");
				steeping_details.setAttribute("id", "latest_cuppa_steeping_details");
				steeping_details.innerHTML = "Steeped ";
				steeping_details.innerHTML += getVagueTime(d.Date).toLowerCase()+" ";

				if (d.SteepTime != null) 
					steeping_details.innerHTML += "for <i>"+formatSteepTime(d.SteepTime)+"</i> ";
				if (d.Temperature != null) 
				steeping_details.innerHTML += "<br />at <i>"+d.Temperature+"&deg;F</i> ";
				if (d.SteepingVessel != null) 
					steeping_details.innerHTML += "using the "+d.SteepingVessel.toLowerCase();
				//row = document.createElement("tr");
				//row.appendChild(steeping_details);
				//table.appendChild(row);
				content_elem.appendChild(steeping_details);

			}

			// Rating
			var tea_ratings_num = 4;
			var rating = document.createElement("div");
			rating.setAttribute("id", "latest_cuppa_rating");
			for (var ii = 0; ii < tea_ratings_num; ii++) {
				var img = document.createElement("img");
				var img_src = "tea/img/tea_cup";
				if (ii > d.Rating-1) img_src += "_greyed";
				img_src += ".png";
				img.setAttribute("src", img_src);
				img.setAttribute("title", d.Rating+"/"+tea_ratings_num+" steaming tea cups");
				rating.appendChild(img);
			}

			content_elem.appendChild(rating);

			//content_elem.appendChild(details);

            return true;
        }
    ));


            /*

            Developer Key: 056c1a79bdea2f6a0954af3bc69440e5
            http://www.librarything.com/services/webservices.php

            http://www.librarything.com/wiki/index.php/LibraryThing_JSON_Books_API
            Key: 523352441

			var div = document.createElement("div");
			div.setAttribute("id", "w9f8a9b8746cf68a2f7acd097fbb66fec");
			div.setAttribute("style", "border: 1px solid #bfa391;");
			tabc.appendChild(div);

			var script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("charset", "UTF-8");
			script.setAttribute("src", "http://www.librarything.com/widget_get.php?userid=HokieGeek&theID=w9f8a9b8746cf68a2f7acd097fbb66fec");
			//tabc.appendChild(script);
            document.head.appendChild(script);
            */
	// Create the reading corner
    /*
	featuresMgr.addFeature(new HG_FeatureView(
		new HG_Feature("Reading Corner", "http://www.librarything.com/catalog/HokieGeek"
        function() { this.data_updated = true; }, null, -1),
		function(content_elem) {
			if (content_elem == null) return false;

            var tabs = document.createElement("div");
            tabs.setAttribute("class", "feature_tabs");
            var tab = null;
            var tabn = null;
            var tabc = null;

            // Currently reading
            tab = document.createElement("div");
            tab.setAttribute("class", "tab");
            tabn = document.createElement("span");
            tabn.appendChild(document.createTextNode("Currently Reading"));
            tabn.setAttribute("class", "tab_name");
            tabc = document.createElement("div");
            tabc.setAttribute("class", "tab_content");
            tabc.appendChild(document.createTextNode("TODO: List of books currently reading"));
            tab.appendChild(tabn);
            tab.appendChild(tabc);
            tabs.appendChild(tab);

            tab = document.createElement("div");
            tab.setAttribute("class", "tab");
            tabn = document.createElement("span");
            tabn.appendChild(document.createTextNode("Upcoming Reading"));
            tabn.setAttribute("class", "tab_name");
            tabc = document.createElement("div");
            tabc.setAttribute("class", "tab_content");
            tabc.appendChild(document.createTextNode("TODO: List of books reading this year"));
            tab.appendChild(tabn);
            tab.appendChild(tabc);
            tabs.appendChild(tab);

            tab = document.createElement("div");
            tab.setAttribute("class", "tab");
            tabn = document.createElement("span");
            tabn.appendChild(document.createTextNode("Read This Year"));
            tabn.setAttribute("class", "tab_name");
            tabc = document.createElement("div");
            tabc.setAttribute("class", "tab_content");
            tabc.appendChild(document.createTextNode("TODO: List of books read this year"));
            tab.appendChild(tabn);
            tab.appendChild(tabc);
            tabs.appendChild(tab);
            content_elem.appendChild(tabs);

            readingTabs = new LibTabs("readingTabs", tabs, 0, LibTabs_Orientation.BOTTOM);

            var tab_gutter = document.createElement("div");
            tab_gutter.setAttribute("class", "tab_gutter");
            content_elem.appendChild(tab_gutter);
            //content_elem.innerHTML = "TODO: A bottom-tabbed view of: Currently Reading, Upcoming books, Books Read";
            //content_elem.innerHTML = "";
		}
	));

    // Drinks
    featuresMgr.addFeature(new HG_FeatureView(
        new HG_Feature("Speakeasy", "http://speakeasy.hokiegeek.net",
            function() {
                this.data = null;
                this.data_update = false;
            },
            function() {
                return "(false)";
            },
            -1),
        function(content_elem) {
            if (content_elem == null) return false;

            content_elem.innerHTML = "TODO";
            return true;
        }
    ));

    // Cheese/Food?
    featuresMgr.addFeature(new HG_FeatureView(
        new HG_Feature("Glorious Food", "http://food.hokiegeek.net",
            function() {
                this.data = null;
                this.data_update = false;
            },
            function() {
                return "(false)";
            },
            -1),
        function(content_elem) {
            if (content_elem == null) return false;

            content_elem.innerHTML = "TODO";
            return true;
        }
    ));

    // Smoking
    featuresMgr.addFeature(new HG_FeatureView(
        new HG_Feature("Veil of Smoke", "http://smoke.hokiegeek.net",
            function() {
                this.data = null;
                this.data_update = false;
            },
            function() {
                return "(false)";
            },
            -1),
        function(content_elem) {
            if (content_elem == null) return false;

            content_elem.innerHTML = "TODO";
            return true;
        }
    ));
    */

    /*
    // Last set of links?
		//<!--a href="http://del.icio.us/HokieGeek" title="My Delicious Bookmarks"><img src="img/delicious.png" /></a-->

    // Latest project

    // Latest pictures
    // Smoking
    featuresMgr.addFeature(new HG_FeatureView(
        new HG_Feature("Adventures", 
            function() {
                this.data = null;
                this.data_update = false;
            },
            function() {
                return "(false)";
            },
            -1),
        function(content_elem) {
            if (content_elem == null) return false;

            content_elem.innerHTML = "TODO";
            return true;
        }
    ));
    */
}
