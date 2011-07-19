//https://spreadsheets.google.com/feeds/spreadsheets/private/full
var url_tea_journal = "https://spreadsheets.google.com/feeds/list/tgKsbec6-aJiVrZL6qRJ7hg/od6/private/full";
var url_tea_products = "https://spreadsheets.google.com/feeds/list/tDrCkOvNrsvhJhnt8mpc-lA/od6/private/full";
var TeaJournalEntries = [];
var TeaProductEntries = [];
var TeaAlbum = null;
var TeaFixins = ["Milk", "Cream", "Half & Half",
				 "Sugar", "Brown Sugar", "Raw Sugar",
				 "Honey", "Vanilla Extract", "Vanilla Bean"];

/* Product Ratings
 *      Tea: Leaf Aroma, Brewed Aroma, Taste, Value
 * Journal Rating:
 *      Taste
 */

function TeaProductEntryType(data) {
    this.ID = null;
    this.ReviewDate = null;
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
    this.Ratings = null; 
    this.Comments = null;
    this.Pictures = [];

    this._loadPictures = function(pics) {
        if (pics == undefined) return;

        this.Pictures = HG_retrievePicturesFromAlbum(pics, TeaAlbum);
    }

    this._load = function(data) {
        if (data == null) return;

        this.ID = data.id;
        if (data.date != null)
            this.ReviewDate = new Date(data.date);
        this.Name = data.name;
        this.Type = data.type;
        this.Country = data.country;
        this.Region = data.region;
        this.Year = data.year;
        this.Flush = data.flush;
        this.Size = data.size;
		this.LeafGrade = data.leafgrade;
		if (this.Type == "Blend") {
			this.BlendedTeas = data.blendedteas;
			this.BlendRatio = data.blendratio;
		}
        this.PurchaseLocation = data.purchaselocation;
        if (data.purchasedate != null)
            this.PurchaseDate = new Date(data.purchasedate);
        this.PurchasePrice = data.purchaseprice;
        this.Ratings = data.ratings;
        this.Comments = data.comments;
        this._loadPictures(data.pictures);
    }

    this.getName = function() {
        return this.Name;
    }

    this._load(data);
}

function TeaJournalEntryType(data) {
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

	this.getEntryDate = function() {
		var d = new Date(this.EntryDate);
		d.setMinutes(this.EntryTime.substr(-2));
		d.setHours(this.EntryTime.substr(0, this.EntryTime.length-2));
		return d;
	}

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

    this._load = function(data) {
        //console.log("TeaJournalEntryType(", data, ")");
        if (data == null) return;

        //if (data.date != null)
        this.EntryDate = data.date;
        //if (data.time != null)
        this.EntryTime = data.time;

        this.Tea = HG_getProductByID(TeaProductEntries, data.tea);
        this.SteepTime = data.steeptime;
		if (data.steeptemperature != null)
        	this.Temperature = data.steeptemperature;
		else
			this.Temperature = 212;
        this.SteepingVessel = data.steepingvessel;
		this.SessionInstance = data.sessioninstance;
        this.Rating = data.rating;
        this.Comments = data.comments;
		this._loadFixins(data.fixins);
        this._loadPictures(data.pictures);
    }

    this._load(data);
}

function sortTeaProducts() {
}

function sortTeaJournal() {
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
