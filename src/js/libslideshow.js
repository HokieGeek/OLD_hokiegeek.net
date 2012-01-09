var LibSlideshow_Active = [];
function LibSlideshow(pics) {
//function LibSlideshow(pics,size) {
	this._MainLayer = null;
	this._ImgLayer = null;
	this._ThumbnailsLayer = null;
	this._isListening = false;
	this._previousListener = null;
	this.Pictures = pics;
	this.CurrentPicture = -1;

	if (pics != null)
		this.LoadLarge();
}
LibSlideshow_KeyboardHandler = function(e) {
	//console.log("LibSlideshow_KeyboardHandler(", e,")");
	var evt = (e) ? e : ((window.event) ? window.event : null);
	for (var i = LibSlideshow_Active.length-1; i >= 0; i--) {
		var obj = LibSlideshow_Active[i]
		if (obj._isListening)
			obj._fireKeyboardEvent(evt);
	}
}

LibSlideshow.prototype._fireKeyboardEvent = function(evt) {
	if (evt) {
		//console.log("LibSlideshow._fireKeyboardEvent(", evt,"): ", this);
		var charCode = (evt.charChode) ? evt.charCode : 
						((evt.keyCode) ? evt.keyCode : 
		 					((evt.which) ? evt.which : 0));
		switch (charCode) {
		case 72: // h	
			this.Previous(); break;
		case 76: // l	
			this.Next(); break;
		case 27: // ESC
			this.Exit(); break;
		}
		//console.log("KEY: ", String.fromCharCode(charCode),"\tCODE: ", charCode);
	}
}
LibSlideshow.prototype.ViewPicture = function(idx) {
	//console.log("LibSlideshow.ViewPicture(", idx,")");
	var thisObj = this;
	if (thisObj._ImgLayer == null) return;
	var classes = "";
	if (this._ThumbnailsLayer != null) {
		var thumbs = this._ThumbnailsLayer.getElementsByTagName("img");
		if (this.CurrentPicture >= 0) {
			var old_pic = thumbs[thisObj.CurrentPicture];
			classes = old_pic.getAttribute("class");
			if (classes != null && classes.length > 0)
				old_pic.setAttribute("class", classes.replace(/ current/, ""));
		}
	}

	// Switch the image and store the current value
	thisObj._ImgLayer.setAttribute("src", thisObj.Pictures[idx]);
	thisObj.CurrentPicture = idx;
	if (this._ThumbnailsLayer != null) {
		var new_pic = thumbs[thisObj.CurrentPicture];
		classes = new_pic.getAttribute("class");
		if (classes == null) classes = "";
		new_pic.setAttribute("class", classes+" current")
	}
}
LibSlideshow.prototype._slidePicture = function(thisObj, offset) {
	if (thisObj == null) return;
	var next = (eval(thisObj.CurrentPicture)+eval(offset)) % thisObj.Pictures.length;
	if (next < 0) next = thisObj.Pictures.length-1;
	return thisObj.ViewPicture(next);
}
LibSlideshow.prototype.Next = function(idx) {
	if (idx < 0 || idx > LibSlideshow_Active.length) return;
	var thisObj = LibSlideshow_Active[idx];
	if (thisObj == null || thisObj.Pictures.length <= 1) return;
	return thisObj._slidePicture(thisObj, 1);
}
LibSlideshow.prototype.Previous = function(idx) {
	if (idx < 0 || idx > LibSlideshow_Active.length) return;
	var thisObj = LibSlideshow_Active[idx];
	if (thisObj == null || thisObj.Pictures.length <= 1) return;
	//return thisObj._viewPicture(thisObj, -1);
	return thisObj._slidePicture(thisObj, -1);
}
LibSlideshow.prototype.Next = function() {
	//console.log("LibSlideshow.Next()");
	return this._slidePicture(this, 1);
}
LibSlideshow.prototype.Previous = function() {
	//console.log("LibSlideshow.Previous()");
	return this._slidePicture(this, -1);
}

LibSlideshow.prototype.Exit = function() {
	// Remove listener
	if (this._previoustListener)
		document.onkeydown = this._previoustListener;

	// Delete Layer
	this._MainLayer.parentNode.removeChild(this._MainLayer);

	// Remove from array
	var newArray = [];
	for (var i = LibSlideshow_Active.length-1; i >= 0; i--) {
		if (LibSlideshow_Active[i] == this) continue;
		//if (idx == i) continue;
		newArray.unshift(LibSlideshow_Active[i]);
	}
	LibSlideshow_Active = newArray;
}

LibSlideshow.prototype.LoadLarge = function() {
	LibSlideshow_Active.push(this); // Keep track of it
	var idx = LibSlideshow_Active.length-1;

	// Create the main layer
	var lyr = document.createElement("div");
	lyr.setAttribute("class", "LibSlideshow");
	lyr.setAttribute("LibSlideshow_idx", idx);

	// Create the transparent background
	var bg = document.createElement("div");
	bg.setAttribute("class", "background");
	lyr.appendChild(bg);

	// Create the image
	var div_img = document.createElement("div");
	var img = document.createElement("img");
	div_img.appendChild(img);
	lyr.appendChild(div_img);
	//lyr.appendChild(img);
	
	var thumbs = null;
	if (this.Pictures.length > 1) {
		// Create the controls
		var close = document.createElement("span");
		close.setAttribute("class", "LibSlideshow_Close");
		var prev = document.createElement("span");
		prev.setAttribute("class", "LibSlideshow_Previous");
		var next = document.createElement("span");
		next.setAttribute("class", "LibSlideshow_Next");
		// TODO

		// Add the thumbnails
		thumbs = document.createElement("div");
		for (var i = this.Pictures.length-1; i >= 0; i--) {
			var t = document.createElement("img");
			t.setAttribute("src", this.Pictures[i]);
			t.setAttribute("onclick", "LibSlideshow_Active["+idx+"].ViewPicture("+i+");");
			thumbs.insertBefore(t, thumbs.firstChild);
		}
		lyr.appendChild(thumbs);
	}


	// Add the main layers to the document and store in object
	document.body.appendChild(lyr);
	this._MainLayer = lyr;
	this._ImgLayer = img;
	this._ThumbnailsLayer = thumbs;

	// Now add the keyboard handler
	if (document.onkeydown != null)
		this._previoustListener = document.onkeydown;
	document.onkeydown = LibSlideshow_KeyboardHandler;
	//document.onkeydown = LibSlideshow_Active[idx]._fireKeyboardEvent;
	this._isListening = true;

	// Display the first image
	this.Next();
}
