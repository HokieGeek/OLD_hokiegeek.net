//// <script src="picasaweb.js" type="text/javascript"></script>

/*
 USAGE:
  var pw = new Picasaweb(USER_NAME);
  var album = pw.getAlbum(ALBUM_NAME);
  var pic = album.getPicture(PICTURE_NAME);
*/

//*****************************************************************//
//**********************  PicasaWeb_Pic  **************************//
//*****************************************************************//
function PicasaWeb_Pic (data) 
{
    this.data = data;
    this.id = null;
    this.name = null;
    this.url = null;
    this.caption = null;
    this.width = 0;
    this.height = 0;
    this.loaded = false;

    this._load();
}

PicasaWeb_Pic.prototype.isLoaded = function() {
    return this.loaded;
}

PicasaWeb_Pic.prototype.getURL = function(res) {
    var url = this.url;
    // TODO: if res > this.width || this.height
    if (res != undefined && res != null)
        url += ("/s"+res);
    url += ("/"+this.name);
    return url;
}

PicasaWeb_Pic.prototype._load = function() {
    if (this.data == null && this.data == undefined) return;

    // retrieve and parse img object
    for (var i = this.data.length-1; i >= 0; i--) {
        var prop = this.data[i];
        if (prop == null) continue;
        if (prop.title) {
            this.name = prop.title["$"];
        } else if (prop.id) {
            var prop_id = prop.id["$"];
            if (prop_id != null && prop_id != undefined) {
                this.id = prop_id.slice(prop_id.lastIndexOf("/")+1);
                // TODO: use prop_id to retrieve more information about this image
                // https://picasaweb.google.com/data/entry/api/user/andres.f.perez/albumid/5533061156109921889/photoid/5533062752388785458
            }
        } else if (prop.content) {
            if (prop.content != null) {
                var prop_content = prop.content["@"].src;
                this.url = prop_content.substr(0, prop_content.lastIndexOf("/"));
            }
        }
    }
    this.loaded = true;
    //console.log(" LOADED PW PIC: ", this.name, this.data);
}

//*****************************************************************//
//*********************  PicasaWeb_Album  *************************//
//*****************************************************************//
function PicasaWeb_Album (user, data) 
{
    this.ALBUM_PICS_URL = "https://picasaweb.google.com/data/feed/api/user/"+user+"/albumid";
    this.user = user;
    this.data = data;
    this.name = null;
    this.id = -1;
    this.url = null;
    this.summary = null;
    this.updated = null; // TODO
    
    this.Pics = null;

    this._load();
}

PicasaWeb_Album.prototype.isLoaded = function() {
    return this.isLoaded(null);
}

PicasaWeb_Album.prototype.isLoaded = function(name) {
    if (this.Pics == null) return false;
    for (var i = this.Pics.length-1; i >= 0; i--) {
        if (name != undefined && name != null && this.Pics[i].name != name) continue;
        if (!this.Pics[i].isLoaded()) return false;
    }
    return true;
}

PicasaWeb_Album.prototype.Size = function() {
    if (this.Pics == null) return 0;
    return this.Pics.length;
}

PicasaWeb_Album.prototype.getPicture = function (name) {
    // Loop through each entry in this.Pics looking for
    for (var i = this.Pics.length-1; i >= 0; i--) {
        if (this.Pics[i].name == name) 
            return this.Pics[i];
    }
    return null;
}

// Retrieve all of the album pictures
PicasaWeb_Album.prototype._retrievePics = function (entries) {
    //console.log("PicasaWeb_Album{"+this.name+"}._retrievePics()");

    if (this.Pics == null || this.Pics == undefined) this.Pics = [];
    if (entries != null && entries.length > 0) {
        for (var i = entries.length-1; i >= 0; i--) {
            if (entries[i] != null)
                this.Pics.push(new PicasaWeb_Pic(entries[i]));
        }
    }
}

// Retrieve the album metadata and get the pics
PicasaWeb_Album.prototype._load = function() {
    for (var i = this.data.length-1; i >= 0; i--) {
        var prop = this.data[i];
        if (prop == null) continue;
        if (prop.title) {
            this.name = prop.title["$"];
        } else if (prop.id) {
            //console.log(" ID: ", prop.id["$"]);
            var id_prop = prop.id["$"];
            this.id = id_prop.slice(id_prop.lastIndexOf("/")+1);
            this.url = this.ALBUM_PICS_URL+"/"+this.id;
            //console.log("  ID: ", this.id);
            //console.log("  URL: ", this.url);
        } else if (prop.summary) {
            this.summary = prop.summary["$"];
        // TODO } else if (prop.updated) {
            //this.updated = prop.updated["$"];
        }
    }
    //console.log("  ALBUM: ", this.name);
    if (this.name != "HG_Shaving" && 
        this.name != "HG_Tea" &&
        this.name != "Our First House") return; // FIXME: remove

    if (this.id != null) {
        PicasaWebObjects_retrieving.push(this); 
        var apos = PicasaWebObjects_retrieving.length-1;
        getGoogleData(new PicasaWebRetrieval(this.url, 
            function (entries) {
                var pwa = PicasaWebObjects_retrieving[apos];
                if (pwa != null || pwa != undefined)
                    pwa._retrievePics(entries);
                //PicasaWebObjects_retrieving.splice(apos, 1); FIXME
            }, null));
    }
}

//*****************************************************************//
//************************  PicasaWeb  ****************************//
//*****************************************************************//
function PicasaWeb (user) 
{
    // Member variables
    this.USER_ALBUMS_URL = "https://picasaweb.google.com/data/feed/api/user/"+user+"&access=private";
    this.user = user;
    this.cover = null;
    
    this.Albums = null;

    this._load();
}

PicasaWeb.prototype.isLoaded = function() {
    return this.isLoaded(null);
}

PicasaWeb.prototype.isLoaded = function(name) {
    if (this.Albums == null) return false;
    for (var i = this.Albums.length-1; i >= 0; i--) {
        if (name != undefined && name != null && this.Albums[i].name != name) continue;
        if (!this.Albums[i].isLoaded()) return false;
    }
    return true;
}

PicasaWeb.prototype.getAlbum = function (name) {
    if (this.Albums != null) {
        for (var i = this.Albums.length-1; i >= 0; i--) {
            if (this.Albums[i].name == name) 
                return this.Albums[i];
        }
    }
    return null;
}

PicasaWeb.prototype._retrieveAlbums = function (entries) {
    if (this.Albums == null || this.Albums == undefined) this.Albums = [];
    if (entries != null && entries.length > 0) {
        for (var i = entries.length-1; i >= 0; i--) {
            if (entries[i] != null || entries[i] != undefined)
                this.Albums.push(new PicasaWeb_Album(this.user, entries[i]));
        }
    }
}

// Load all of the albums for the user
PicasaWeb.prototype._load = function() {
    PicasaWebObjects_retrieving.push(this); 
    var apos = PicasaWebObjects_retrieving.length-1;
    getGoogleData(new PicasaWebRetrieval(this.USER_ALBUMS_URL, 
            function (entries) {
                PicasaWebObjects_retrieving[apos]._retrieveAlbums(entries);
                //PicasaWebObjects_retrieving.splice(apos, 1); // TODO
            }, null));
}

var PicasaWebObjects_retrieverCount = -1;
var PicasaWebObjects_retrieving = [];

//*****************************************************************//
//**********************  Retrieval code  *************************//
//*****************************************************************//
PicasaWebRetrieval.prototype = new GoogleDataRetrieval;
function PicasaWebRetrieval(url, cb, cb_args) {
    this.URL = url;
    this.UserCallback = cb;
    this.UserCallbackArguments = cb_args;
    this.Service = "lh2";

    // FIXME: This is dumb... What's the point of inheritance?!
    this.ArrayPos = -1;
    this.httpReq = new libHTTPRequest(); 
}

//*****************************************************************//
//***********************  PicasaWeb_PicView  **********************//
//*****************************************************************//
function PicasaWeb_PicView(pic, elem) { // Expects a PicasaWeb_Pic object
    this.pic = pic;
    this.elem = elem;

    this.PIC_CLASSNAME = "PicasaWeb_PicView";
    this.PIC_SIZE = 300;

    //console.log("ASDFSADFSADFSAD");
    this._load();
}

PicasaWeb_PicView.prototype._load = function() {
    //console.log("PicasaWeb_PicView._load(): ", this.pic);
    if (this.elem == null) return;

    this.elem.innerHTML = "";
    addClass(this.elem, this.PIC_CLASSNAME);

    var img = document.createElement("img");
    img.setAttribute("src", this.pic.getURL(this.PIC_SIZE));
    this.elem.appendChild(img);
}

//*****************************************************************//
//**********************  PicasaWeb_AlbumView  *********************//
//*****************************************************************//
function PicasaWeb_AlbumView(album, elem, display_header) { // Expects a PicasaWeb_Album object
    this.album = album;
    this.elem = elem;
    this.display_header = display_header;
    this.header_view = null;
    this.pics_view = null;
    //this.pics = null;

    this.ALBUM_CLASSNAME = "PicasaWeb_AlbumView";
    this.ALBUM_HEADER_CLASSNAME = "PicasaWeb_AlbumView_Header";
    this.ALBUM_PICS_CLASSNAME = "PicasaWeb_AlbumView_Pics";

    this._load();
}

PicasaWeb_AlbumView.prototype._load = function() {
    //console.log("PicasaWeb_AlbumView{}._load()", this.album);
    if (this.elem == null) return;
    //console.log("    this.elem = ", this.elem);

    this.elem.innerHTML = "";
    addClass(this.elem, this.ALBUM_CLASSNAME);

    // The title
    if (this.display_header) {
        this.header_view = document.createElement("div");
        addClass(this.header_view, this.ALBUM_HEADER_CLASSNAME);
        var title = document.createElement("span");
        title.appendChild(document.createTextNode(this.album.name));
        this.header_view.appendChild(title);
        this.elem.appendChild(this.header_view);
    }

    // The pics
    this.pics_view = document.createElement("div");
    addClass(this.pics_view, this.ALBUM_PICS_CLASSNAME);
    for (var i = this.album.Pics.length-1; i >= 0; i--) {
    //for (var i = 0; i < this.album.Pics.length; i++) {
        var pic = document.createElement("span");
        var pic_view = new PicasaWeb_PicView(this.album.Pics[i], pic);
        //console.log("  PIC: ", this.album.Pics[i], pic);
        //this.pics_view.appendChild(pic);
        this.pics_view.insertBefore(pic, this.pics_view.firstChild);
    }
    this.elem.appendChild(this.pics_view);
}

//*****************************************************************//
//************************  PicasaWeb_View  ************************//
//*****************************************************************//
function PicasaWeb_View(albums, elem) { // Expects a PicasaWeb object
    this.albums = albums;
    this.elem = elem;
    this.album_views = null;

    this.ALBUMS_CLASSNAME = "PicasaWeb_View";

    //this._load();
}

PicasaWeb_View.prototype._load = function() {
    this.elem.innerHTML = "";
    addClass(this.elem, this.ALBUMS_CLASSNAME);
}

//*****************************************************************//
//*********************  PicasaWeb_PicSelect  *********************//
//*****************************************************************//
var PicasaWeb_PicSelectObjs = [];
function PicasaWeb_PicSelect(album, elem, cb, multiselect) {
    console.log("PicasaWeb_PicSelect()");
    var view = new PicasaWeb_PicSelect_View(album, elem, cb);
    if (view == null) return [];
    console.log("   creating selection control");
    view.pos = PicasaWeb_PicSelectObjs.length;
    PicasaWeb_PicSelectObjs.push(view);

    view.show_header = false; // FIXME: not cool

    view.multiselect = multiselect;
    view.load();

    return view;
}

function PicasaWeb_PicSelect_View (album, elem, cb) {
    // console.log("PicasaWeb_PicSelect_View()");
    this.album = album;
    this.elem = elem;
    this.pos = -1;

    this.thumb_size = 50;
    this.show_header = true;
    this.multiselect = true;
    this.callback = cb;
    this.Selected = []; // A list of indices to return

    this.PICSELECT_CLASSNAME = "PicasaWeb_PicSelect";
    this.PICSELECT_PICS_CLASSNAME = "PicasaWeb_PicSelect_Pics";
    this.PICSELECT_PIC_CLASSNAME = "PicasaWeb_PicSelect_Pic";
    this.PICSELECT_SELECTED_CLASSNAME = "PicasaWeb_PicSelect_Pic_Selected";
    this.PICSELECT_HDR_CLASSNAME = "PicasaWeb_PicSelect_Header";
    this.PICSELECT_BTN_CLASSNAME = "PicasaWeb_PicSelect_Button";
    
}

PicasaWeb_PicSelect_View.prototype.select = function(id, img) {
    // console.log("PicasaWeb_PicSelect.select("+id+")");
    if (this.Selected.contains(id)) {
        this.Selected.splice(this.Selected.indexOf(id), 1);
        removeClass(img, this.PICSELECT_SELECTED_CLASSNAME);
    } else {
        this.Selected.push(id);
        addClass(img, this.PICSELECT_SELECTED_CLASSNAME);

        if (!this.multiselect) {
            this.close();
        }
    }
    // console.log("  selected = ", this.Selected);
}

PicasaWeb_PicSelect_View.prototype.getSelected = function() {
    var pics = [];
    for (var i = 0; i < this.Selected.length; i++)
        pics.push(this.album.Pics[this.Selected[i]]);
    return pics;
}

PicasaWeb_PicSelect_View.prototype.close = function() {
    // console.log("PicasaWeb_PicSelect_View.close()");
    // Delete the GUI element
    if (this.elem != null)
        this.elem.innerHTML = "";

    // Call any interested parties
    if (this.callback != null)
        this.callback(this.getSelected());
}

PicasaWeb_PicSelect_View.prototype.load = function() {
    // console.log("PicasaWeb_PicSelect_View.load()");
    if (this.album == null || this.elem == null) {
        console.log("WTF?", this.album, this.elem);
        return;
    }

    // Create the main element
    var mainElem = document.createElement("div");
    addClass(mainElem, this.PICSELECT_CLASSNAME);

    // Create the header
    if (this.show_header) {
        var header = document.createElement("div");
        addClass(header, this.PICSELECT_HDR_CLASSNAME);

        if (this.multiselect) {
            var done = document.createElement("div");
            addClass(done, this.PICSELECT_BTN_CLASSNAME);
            done.setAttribute("onclick", "PicasaWeb_PicSelectObjs["+this.pos+"].close()");
            done.appendChild(document.createTextNode("Done"));
            header.appendChild(done);
        }

        // Title
        var title = document.createElement("div");
        title.appendChild(document.createTextNode(this.album.name+" ("+this.album.Pics.length+")"));
        header.appendChild(title);
        mainElem.appendChild(header);
    }

    // Add the pics
    var picsList = document.createElement("div");
    addClass(picsList, this.PICSELECT_PICS_CLASSNAME);
    var pics = this.album.Pics;
    for (var i = 0; i < pics.length; i++) {
        var img = document.createElement("img");
        img.setAttribute("src", pics[i].getURL(this.thumb_size));
        img.setAttribute("onclick", "PicasaWeb_PicSelectObjs["+this.pos+"].select("+i+", this)");
        addClass(img, this.PICSELECT_PIC_CLASSNAME);
        picsList.appendChild(img);
    }
    mainElem.appendChild(picsList);

    // Now add the main element to the requested "location"
    this.elem.appendChild(mainElem);
}
