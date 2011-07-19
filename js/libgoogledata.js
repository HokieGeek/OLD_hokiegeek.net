/* REQUIRES LIBHTTPREQUEST */

var GoogleDataRetrievals = [];
function GoogleDataRetrieval(url, service, cb, cb_args) {
	this.ArrayPos = -1;
	this.URL = url;
	this.Service = service;
	this.UserCallback = cb;
	this.UserCallbackArguments = cb_args;
	this.httpReq = new libHTTPRequest();
}

GoogleDataRetrieval.prototype.createObjectFromEntry = function(entry) {
	var obj = entry;

	var matches = entry.match(/,\s*[a-z_]*:\s/g);
	matches.push(obj.match(/^[a-z_]*:\s/)[0]);
	//console.log(" >> MATCHES: ", matches);

	var m = null;
	for (var i = matches.length-1; i >= 0; i--) {
		m = matches[i];
		obj = obj.replace(m, "\""+m.replace(/:\s/, "\":")
		.replace(/,\s/, ", \"")+"\"");
	delete m;
	}
	//obj += "\"";
	obj = "[{"+obj+"\"}]";

	delete matches;

	return eval(obj)[0];
}

GoogleDataRetrieval.prototype.retrieveEntries = function(feed) {
	var entries = [];
	//var children = null;
	//console.log("  FEED:", feed);
	if (feed.entry) {
		//children = feed.entry["#"];
		entries.push(feed.entry["#"]);	
	} else if (feed.feed) {
		var children = feed.feed["#"];
		var child_children = null;
		var content = null;
		for (var i = children.length-1; i >= 0; i--) {
			if (children[i].entry) {
				//console.log("  children["+i+"]", children[i]);
				child_children = children[i].entry["#"];
				entries.push(child_children);	
				//entries.push(this.createObjectFromEntry(child_children));	
			}
		}
		delete children;
	}

	return entries;
}

GoogleDataRetrieval.prototype.Callback = function(ret) {
	//console.log("GoogleDataRetrieval.Callback(): ", ret);
	//console.log("GoogleDataRetrieval.Callback(): "+this.UserCallback);
    var entries = null;
	try {
        if (ret != "Token invalid") {
		    ret = ret.replace(/\s/g, " ");
                     //.replace(/'/g, "");
				     //.replace(/Andr.s P.rez/g,"AP")
		    entries = this.retrieveEntries(eval(ret)[0]);
		    //console.log("      entries[0] = ", entries[0]);
		    //console.log("DONE");
		    //if (true) return;
        }
	} catch (err) {
		//console.log("GoogleDataRetrieval.Callback(): "+this.UserCallback);
		console.log("  RET: ", ret);
		console.log("GoogleDataRetrieval.Callback: err = "+err);
		console.trace();
        entries = null;
	} finally {
		if (this.UserCallbackArguments != null)  {
			this.UserCallback(entries, this.UserCallbackArguments);
		} else {
			this.UserCallback(entries);
		}
    }

}

GoogleDataRetrieval.prototype.Retrieve = function(arrayPos) {
	//console.log("GoogleDataRetrieval.Retrieve("+arrayPos+"): ", this.URL+", "+this.Service);
	this.httpReq.getData(this.URL, 
		"gs="+this.Service,
		function(ret) {
			var retriever = GoogleDataRetrievals[arrayPos];
			if (retriever != null && retriever != undefined) {
				//console.log("   GoogleDataRetrieval retrieving: ", retriever);
				retriever.Callback(ret);
				//GoogleDataRetrievals.splice(arrayPos, 1); TODO
			//} else {
				//console.log(">>>> SKIPPING!! <<<< ", arrayPos, GoogleDataRetrievals);
			}
		},
		true);
}

function getGoogleData(retriever) {
	retriever.ArrayPos = GoogleDataRetrievals.length;
	//console.log("******** getGoogleData(", retriever.URL,"): ", retriever.ArrayPos);
	GoogleDataRetrievals.push(retriever);
	retriever.Retrieve(retriever.ArrayPos);
	//console.log(">> GoogleDataRetrievals: ", GoogleDataRetrievals);
}
