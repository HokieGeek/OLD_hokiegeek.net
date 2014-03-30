/* REQUIRES LIBGOOGLEDATA */

GSpreadsheetRetrieval.prototype = new GoogleDataRetrieval;
function GSpreadsheetRetrieval(url, cb, cb_args) {
    //this.prototype = new GoogleDataRetrieval;

    this.URL = url;
    this.UserCallback = cb;
    this.UserCallbackArguments = cb_args;
    this.Service = "wise";

    // FIXME: This is dumb... What's the point?!
    this.ArrayPos = -1;
    this.httpReq = new libHTTPRequest(); 
}

GSpreadsheetRetrieval.prototype.retrieveEntries = function(feed) {
    var entries = [];
    var child_children = GoogleDataRetrieval.prototype.retrieveEntries(feed);

    for (var j = child_children.length-1; j >= 0; j--) {
        //console.log("  child_children["+j+"]", child_children[j][4]);
        for (var k = child_children[j].length-1; k >= 0; k--) {
            if (child_children[j][k].content) {
                content = child_children[j][k].content["$"];
                if (content != null) 
                    entries.push(this.createObjectFromEntry(content));    
                //console.log(" content #"+entries.length+": ", entries[entries.length-1]);
                delete content;
            } 
        }
    }
    delete child_children;

    return entries;
}
