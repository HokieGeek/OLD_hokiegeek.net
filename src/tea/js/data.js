//https://spreadsheets.google.com/feeds/spreadsheets/private/full
var url_tea_journal = "https://spreadsheets.google.com/feeds/list/tgKsbec6-aJiVrZL6qRJ7hg/od6/private/full";
var url_tea_products = "https://spreadsheets.google.com/feeds/list/tDrCkOvNrsvhJhnt8mpc-lA/od6/private/full";
var TeaJournalEntries = [];
var TeaProductEntries = [];
var TeaAlbum = null;
var TeaFixins = ["Milk", "Cream", "Half & Half",
				 "Sugar", "Brown Sugar", "Raw Sugar",
				 "Honey", "Vanilla Extract", "Vanilla Bean",
				 "Maple Cream", "Maple Sugar"];
var TeaProductRatings = ["Value", "Leaf Aroma", "Brewed Aroma"];
var TeaFlushTypes = [ ["Spring", "Summer", "Fall", "Winter"],
                      ["1st Flush", "2nd Flush", "Monsoon Flush", "Autumn Flush"] ];
var TeaFlushTypes_Std = 0;
var TeaFlushTypes_Indian = 1;
var TeaPackagingTypes = ["Loose Leaf", "Bagged", "Tuo", "Beeng", "Brick", "Mushroom", "Square"];

function TeaProductEntryType(data) {
    this.ID = null;
    this.Date = null;
    this.Name = null;
    this.Type = null; // Black / Flavored, Green / Flavored, White, Yellow, Oolong / Flavored, Sheng Pu-Erh, Shu Pu-Erh, Tisane
    this.Country = null;
    this.Region = null;
    this.Year = null;
    this.Flush = null;
    this.Size = null;
	this.LeafGrade = null;
	this.BlendedTeas = null;
	this.BlendRatio = null;
	this.Stocked = null;
	this.Aging = null;
	this.Packaging = null;
    this.PurchaseLocation = null;
    this.PurchaseDate = null;
    this.PurchasePrice = null;
    this.Ratings = []; 
    this.Comments = null;
    this.Pictures = [];

    this._loadPictures = function(pics) {
        if (pics == undefined) return;

        this.Pictures = HG_retrievePicturesFromAlbum(pics, TeaAlbum);
    }

	this._loadRatings = function(ratings) {
		if (ratings == undefined) return;
		/*var ratings_array = ratings.split(";");

		// var TeaProductRatings = ["Value", "Leaf Aroma", "Brewed Aroma"];
        this.Ratings = { 
						TeaProductRatings[0] :  ratings_array[0],
						TeaProductRatings[1] :  ratings_array[1],
						TeaProductRatings[2] :  ratings_array[2]
					   };
					   */
		this.Ratings = ratings.split(";");
	}

    this._load = function(data) {
        if (data == null) return;

        this.ID = data.id;
        if (data.date != null)
            this.Date = new Date(data.date);
        this.Name = data.name;
        this.Type = data.type;
        this.Country = data.country;
        this.Region = data.region;
        this.Year = data.year;
        this.Flush = data.flush;
        this.Size = data.size;
		this.LeafGrade = data.leafgrade;
		if (this.Type == "Blend") {
			this.BlendedTeas = data.blendedteas; // TODO Explode
			this.BlendRatio = data.blendratio.replace(/;/g, ":");
		}
		this.Stocked = (data.stocked == "TRUE" ? true : false);
		this.Aging = (data.aging == "TRUE" ? true : false);
		this.Packaging = TeaPackagingTypes[data.packaging]; // TODO hmmm
        this.PurchaseLocation = data.purchaselocation;
        if (data.purchasedate != null)
            this.PurchaseDate = new Date(data.purchasedate);
        this.PurchasePrice = data.purchaseprice;
        this.Comments = data.comments;

		this._loadRatings(data.ratings);
        this._loadPictures(data.pictures);
    }

    this.getName = function() {
		var name = "";

        var flush_index = ((this.Country != null && this.Country == "India") ? TeaFlushTypes_Indian : TeaFlushTypes_Std);

		if (this.Year != null) name += this.Year+" ";
		// if (this.Flush != null) name += TeaFlushTypes[this.Flush-1]+" ";
		if (this.Flush != null) name += TeaFlushTypes[flush_index][this.Flush-1]+" ";
		name += this.Name;
		if (this.LeafGrade != null) name += " "+this.LeafGrade;

        return name;
    }

	this.getOrigin = function() {
		var origin = "";

		if (this.Region != null) origin += this.Region+", ";
		if (this.Country != null) origin += this.Country;
		
		return origin;
	}

	this.getType = function() {
		return ((this.Type == "Blend") ? this.BlendRatio+" " : "")+this.Type;
	}

	this.getPackaging = function() {
		return TeaPackagingTypes[this.Packaging];
	}

	this.getJournalEntries = function() {
		var entries = [];

    	for (var ii = 0; ii < TeaJournalEntries.length; ii++) {
			if (TeaJournalEntries[ii].Tea.ID == this.ID) {
				entries.push(TeaJournalEntries[ii]);
			}
		}

		return entries;
	}

    this._load(data);
}

function TeaJournalEntryType(data) {
    this.Date = null;
    this.EntryDate = null;
    this.EntryTime = null;
    this.Tea = null;
    this.SteepTime = null;
    this.SteepingVessel = null;
    this.Temperature = null;
	this.SessionInstance = null;
	this.Fixins = null;
    this.Rating = null;
    this.Comments = null;
    this.Pictures = [];

    this._loadPictures = function(pics) {
        if (pics == undefined) return;

        this.Pictures = HG_retrievePicturesFromAlbum(pics, TeaAlbum);
    }

	this._loadFixins = function(fixs) {
		//console.log("_loadFixins: ", fixs);
		if (fixs == undefined) return;
		if (this.Fixins == null) this.Fixins = [];

		
   		var retrieved = fixs.split(";");
   		for (var i = retrieved.length-1; i >= 0; i--) {
			this.Fixins.push(TeaFixins[retrieved[i]]);
		}
	}

	this._loadSteepTime = function(steeptime) {
        if (steeptime == undefined) return;
		var steeptime_array = steeptime.split(" ");

		var min = 0;
		var sec = 0;
        if (steeptime_array.length > 1) {
		    min = parseInt(steeptime_array[0]);
		    sec = parseInt(steeptime_array[1]);//steeptime_array.length-1]);
        } else {
            var val = steeptime_array[0];
            if (val.substr(-1, 1).toLowerCase() == "m")
                min = parseInt(val);
            else
                sec = parseInt(val);
        }

		this.SteepTime = ((min*60)+sec)*1000;

        //if (this.ID == 2)
            //console.log(this.ID, "_loadSteepTime("+steeptime+"): min = ", min, " sec = ", sec, " >> ", this.SteepTime);

		//this.SteepTime = data.steeptime;
	}

	this._load = function(data) {
		//console.log("TeaJournalEntryType(", data, ")");
		if (data == null) return;

        if (data.date != null) {
        	this.EntryDate = data.date;
			this.Date = new Date(this.EntryDate);
        	if (data.time != null) {
        		this.EntryTime = data.time;
				this.Date.setMinutes(this.EntryTime.substr(-2));
				this.Date.setHours(this.EntryTime.substr(0, this.EntryTime.length-2));
			}
		}

        this.Tea = HG_getProductByID(TeaProductEntries, data.tea);
        this.Temperature = ((data.steeptemperature == null) ? 212 : data.steeptemperature);
        this.SteepingVessel = data.steepingvessel;
		this.SessionInstance = data.sessioninstance;
        this.Rating = data.rating;
        this.Comments = data.comments;

        this._loadSteepTime(data.steeptime);
		this._loadFixins(data.fixins);
        this._loadPictures(data.pictures);
    }

    this._load(data);
}

function sortTeaProducts() {
	TeaProductEntries.sort(function(a,b) { 
		// return a.ID > b.ID ? 1 : a.ID < b.ID : -1 : 0; 
		var aID = parseInt(a.ID);
		var bID = parseInt(b.ID);
		if (aID > bID) return 1;
		if (aID < bID) return -1;
		return 0;
		// return aID > bID ? 1 : aID < bID : -1 : 0; 
	});
}

function sortTeaJournal() {
	TeaJournalEntries.sort(function(a,b) { 
		if (!(a.Date instanceof Date)) return 1;
		if (!(b.Date instanceof Date)) return 0;
		return a.Date.getTime() - b.Date.getTime(); 
	});
}

function formatSteepTime(millis) {
	var seconds = millis/1000;
	var min = Math.floor(seconds / 60);
	var sec = Math.ceil(seconds - (min*60));

    // console.log("formatSteepTime("+millis+"): seconds = ", seconds);
    // console.log("formatSteepTime("+millis+"): min = ", min);
    // console.log("formatSteepTime("+millis+"): sec = ", sec);

    var time = "";
    if (min > 0) time = min+"m";
    if (sec > 0) time += " "+sec+"s";

	return time;
}

function getTeaData(cb) {
    HG_getJournalData(
        {   "album_id" : "HG_Tea",
            "album_var" : "TeaAlbum",
            "spreadsheets" : 
                [   {   "name": "teas",
                        "entries_var" : "TeaProductEntries",
                        "entries_type" : "TeaProductEntryType",
                        "retrieval_url" : url_tea_products
                    }
					 ,
					
                    {   "name": "journal",
                        "entries_var" : "TeaJournalEntries",
                        "entries_type" : "TeaJournalEntryType",
                        "retrieval_url" : url_tea_journal
                    }
                ],
            "loaded_callback" : cb
        },
        HG_Journal_loadingMessage 
    );
}
