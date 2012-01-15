/*
Retrieving a spreadsheet as a table:
http://code.google.com/apis/spreadsheets/data/3.0/developers_guide_protocol.html#RetrievingTables

https://spreadsheets.google.com/feeds/spreadsheets/private/full

REVIEWS WS: https://spreadsheets.google.com/feeds/worksheets/tALoFhT7abBDqZ7s0IHAQpg/private/full
JOURNAL WS: https://spreadsheets.google.com/feeds/worksheets/tCDnYTlWeLx4Y8C-7jYtK1g/private/full
*/
var url_journal = "https://spreadsheets.google.com/feeds/list/tCDnYTlWeLx4Y8C-7jYtK1g/od6/private/full";
var url_reviews = "https://spreadsheets.google.com/feeds/list/tALoFhT7abBDqZ7s0IHAQpg/od6/private/full"
var ShavingAlbum = null;
var ShavingReviewedProducts = [];
var ShavingJournalEntries = [];
var ShavingCombos = [];
var grade_scale = ["Meh", "CCS", "DFS", "BBS"];
var PRODUCT_CATEGORIES = ["razor", "blade", "strop", "brush", "cream", "soap", "preshave", "aftershave", "cologne", "other"];
var PRODUCT_GRADES = [["Weight", "Aggresiveness", "Balance", "Grip", "Look", "Price", "Quality"], // Razor
					   ["Longevity", "Sharpness", "Price", "Quality"], // Blade
					   ["Draw", "Thickness", "Ergonomic", "Look", "Efficacy", "Price", "Quality"], // Strop
					   ["Density", "Stiffness", "Softness", "Ergonomic", "Latherability", "Price", "Quality"], // Brush
					   ["Lather", "Scent", "Efficacy", "Slickness", "Price", "Quality"], // Soap
					   ["Lather", "Scent", "Efficacy", "Slickness", "Price", "Quality"], // Cream
					   ["Scent", "Efficacy", "Price", "Quality"], // Preshave
					   ["Cooling", "Burn", "Scent", "Efficacy", "Price", "Quality"], // Aftershave
					   ["Scent", "Longevity", "Price", "Quality"], // Cologne
					   ["Efficacy", "Price", "Look", "Quality"] // Cologne
					  ];

function ShavingComboType(data) {
	this.Razor = null;
	this.Blade = null;
	this.Brush = null;
	this.Cream = null;
	this.Soap = null;
	this.PreShave = null;
	this.Aftershave = null;
	this.Dates = [];
	this.Grades = [];
	this.Grade = -1;

	this._calculateGrade = function() {
		// FORMULA: combo_grade = SUM_Per_Grade*(combo_instance_grade_count*grade_weight);
		/* NEXT FORMULA TWEAK:
		 *    If a combo contains something other than a DFS shave, 
		 *    then DFS shaves count as negative points
		 */
		this.Grade = 0;
		// Create and initialize the grade counter
		var grade_counts = [grade_scale.length];
		for (var i = grade_scale.length-1; i >= 0; i--) grade_counts[i] = 0;
	
		// Now count the grades by type for this combination
		for (var i = this.Grades.length-1; i >= 0; i--)
			grade_counts[grade_scale.indexOf(this.Grades[i])]++;

		for (var i = grade_counts.length-1; i >= 0; i--)
			this.Grade += grade_counts[i]*grade_scale.indexOf(grade_scale[i]);
			//this.Grade += grade_counts[i]*getGradeWeight(grade_scale[i]);
	}

	this.loadCombo = function(d) {
		this.Razor = d.Razor;
		this.Blade = d.Blade;
		this.Brush = d.Brush;
		this.Soap = d.Soap;
		this.Cream = d.Cream;
		this.Preshave = d.Preshave;
		this.Aftershave = d.Aftershave;
		//this.NumPasses = d.NumPasses;
		this.Dates.push(d.Date);
		this.Grades.push(d.Grade);
		this._calculateGrade();
	}

	this.addDate = function(dt) {
		this.Dates.push(dt);
	}
	this.addGrade = function(g) {
		this.Grades.push(g);
	}
	this.merge = function(o) {
		// TODO: Don't add dups?
		this.Dates.push(o.Date);
		this.Grades.push(o.Grade);
		this._calculateGrade();
	}

	this.equals = function(c) {
		if (this.Razor != c.Razor) return false;
		if (this.Blade != c.Blade) return false;
		if (this.Brush != c.Brush) return false;
		if (this.Soap != c.Soap) return false;
		if (this.Cream != c.Cream) return false;
		if (this.Preshave != c.Preshave) return false;
		//if (this.Aftershave != c.Aftershave) return false;
		//if (this.NumPasses != c.NumPasses) return false;
		//if (this.Dates != c.Dates) return false;
		//if (this.Grade != c.Grade) return false;
		return true;
	}

	//Main
	this.loadCombo(data);
};
function ProductType(data) {
	this.ID = null;
	this.Type = null;
	this.Vendor = null;
	this.Name = null;
	this.Size = null;
	this.Color = null;
	this.Scent = null;
	this.Attributes = null; // TODO
	this.PurchaseDate = null;
	this.inDen = true;
	this.Price = null;
	this.Location = null;
	this.Grades = null;
	this.Grade = -1;
	this.ReviewDate = null;
	this.ReviewComments = null;
	this.Pictures = [];

	this._loadPictures = function(pics) {
		if (pics == undefined) return;
		this.Pictures = pics.split(";");
		this.Pictures.pop(); // Last one is always empty
		for (var i = this.Pictures.length-1; i >= 0; i--) {
			var orig = this.Pictures[i];
			if (ShavingAlbum != null) {
				this.Pictures[i] = ShavingAlbum.getPicture(this.Pictures[i]);
			} else
				this.Pictures[i] = null;

			if (this.Pictures[i] == null)
				this.Pictures[i] = "img/default.png";
		}
	}

	this._calculateGrade = function(grades) {
		if (grades == null || grades.length <= 0) return;
		//console.log("Calculating grade for: "+this.Name);

		var boom = grades.split(";");
		if (boom.length <= 0) return;

		var sum = 0;
		for (var i = boom.length-1; i >= 0; i--)
			sum += eval(boom[i]);
		//console.log("   SUM:", sum);

		//this.Grade = Math.ceil(sum / boom.length);
		this.Grade = Math.floor(sum / boom.length);
		//console.log("   GRADE:", this.Grades, ": ", this.Grade);
	}

	this._load = function(data) {
		if (data == null) {
			return;
		}

		this.ID = data.id;
		this.Type = data.producttype;
		this.Vendor = data.productvendor;
		this.Name = data.productname;
		this.Size = data.size;
		this.Color = data.color;
		this.Scent = data.scent;
		if (data.purchasedate != null)
			this.PurchaseDate = new Date(data.purchasedate);
		this.Price = data.purchaseprice;
		this.Location = data.purchaselocation;
		this.Grades = data.grades;
		this.ReviewDate = new Date(data.reviewdate);
		this.ReviewComments = data.comments;
		if (data.inden != null)
			this.inDen = eval(data.inden.toLowerCase());
		this._loadPictures(data.pictures);
		this._calculateGrade(this.Grades);
	}

	this.search = function(pat) {
		var all = this.Vendor+" "+this.Name;
		if (this.Color != null) all += " "+this.Color;
		if (this.Size != null) all += ", "+this.Size;
		if (this.Scent != null) all += " "+this.Scent;

		return all.search(pat);//.replace(/,/g, "")); TODO?
	}

	this.equals = function(c) {
		for (var p in this)
			if (c[p] == undefined || this[p] != c[p]) return false;
		return true;
	}

	this.getName = function() {
		//return getProductName(this);
	    var name = this.Name;
	    if (this.Vendor != undefined) {
		    name = this.Vendor;
		    if (this.Scent != null && this.Scent.length > 0) name += " "+this.Scent;
		    if (this.Name != null && this.Name.length > 0) name += " "+this.Name;
		    if (this.Color != null && this.Color.length > 0) name += " "+this.Color;
		    if (this.Size != null && this.Size.length > 0) name += " ("+this.Size+")";
	    }  //else
		    //console.log("getProductName() wtf:", product, name);
	    return name;
	}

	this._load(data);

};
function JournalEntryType(data) {
	this.Date = null;
	this.Razor = null;
	this.Strop = null;
	this.Blade = null;
	this.Brush = null;
	this.Soap = null;
	this.Cream = null;
	this.Preshave = null;
	this.Aftershave = null;
	this.AdjustableSetting = null;
	this.NumPasses = null;
	this.Grade = null;
	this.Grades = { "Lather": 0, 
				    "Closeness": 0, 
					"Nicks": 0 
					};
	this.Notes = null;

	this._getReview2 = function(type, p) {
		if (p == null) return p;
		var boom = p.split(' ');
		for (var i = ShavingReviewedProducts.length-1; i >= 0; i--) {
			var r = ShavingReviewedProducts[i];
			//console.log("HERE1");
			if (r.Type.toLowerCase() != type.toLowerCase()) continue;
			//console.log("HERE2");

			//var name = getProductName(p);
			//var strings = r.Vendor+" "+r.Name;
			var strings = r.Vendor;
			if (r.Scent != null) strings += " "+r.Scent;
			if (r.Name != null && r.Name.length > 0) strings += " "+r.Name;
			if (r.Color != null) strings += " "+r.Color;
			if (r.Size != null) strings += " "+r.Size;
			
			var miss = false;
			for (var j = 0; j < boom.length; j++) {
				var pat = boom[j].replace(/(\(|\))/g, "");
				//.replace(/^\s*/, "").replace(/\s*$/, "");
				
				if (strings.indexOf(pat) == -1) {
					//console.log("_getReview(): '"+strings+"' doesn't include '"+pat+"'");
					miss = true;
					break;
				}
			}
			if (!miss) {
				if (ShavingReviewedProducts[i].Type.toLowerCase() == "soap")
					//console.log("   PRODUCT: ", strings, ShavingReviewedProducts[i]);
					//console.log("   PRODUCT: ", strings, getProductName(ShavingReviewedProducts[i]));
				return ShavingReviewedProducts[i];
			}
		}

		return p
	}

	this._getReview = function(type, p) {
        /*
		if (isNaN(p)) {
			return this._getReview2(type, p);
		} else {
			var prod = HG_getProductByID(ShavingReviewedProducts, eval(p));
			if (prod != null) return prod;
		}
        */

        if (p != undefined && isNaN(p)) {
            return this._getReview2(type, p);
        } else {
            // console.log("_getReview(", type, ", ", p, ")");
            if (type == "Preshave" && p != undefined && (p == -1 || isNaN(p))) {
                return "Softening with lather"
            } else {
                var prod = HG_getProductByID(ShavingReviewedProducts, eval(p));
                if (prod != null) return prod;
            }
        }

		return p;
	}
	this._load = function(data) {
		if (data == null) {
			return;
		}
		//console.log("  data = ", data);

		this.Date = new Date(data.date);
		this.Razor = this._getReview("Razor", data.razor);
		this.Strop = this._getReview("Strop", data.strop);
		this.Blade = this._getReview("Blade", data.blade);
		this.Brush = this._getReview("Brush", data.brush);
		if (data.soap != null && data.soap.length > 0)
			this.Soap = this._getReview("Soap", data.soap);
		else
			this.Cream = this._getReview("Cream", data.cream);
		this.Preshave = this._getReview("Preshave", data.preshave);
		this.Aftershave = this._getReview("Aftershave", data.aftershave);
		this.NumPasses = data.numpasses;
		this.Notes = data.notes;

		this.Grades.Lather = data.gradelather; 
		this.Grades.Closeness = data.gradecloseness; 
		this.Grades.Nicks = data.gradenicks; 
		this._calculateGrade();
		//console.log("  this = ",this);
	}

	this.equals = function(o) {
	}

	this._calculateGrade = function() {
		var num_categories = 0;
		var grade = 0;
		for (var c in this.Grades) {
			grade += eval(this.Grades[c]);
			num_categories++;
		}
		//console.log("grade: ", grade, "\tnum_cat: ", num_categories);
		// Essentially adds another 0 to the grade if it took too many passes!
		//console.log("Num Passes: ", this.NumPasses);
		if (this.NumPasses > 4) num_categories++;
		grade = Math.floor(grade / num_categories);
		this.Grade = grade_scale[grade];
		//console.log("Calculated vs. Given Entry Grade ["+this.Date+"]: ", grade_scale[grade], this.Grade);
		//console.log("GRADES ["+this.Date+"]: ", "["+this.Grades.Lather+", "+this.Grades.Closeness+", "+this.Grades.Nicks+"], ", "("+grade+")", this.Grade);
	}

	// Main
	this._load(data);
};
function sortJournalEntries(attrib) {
	if (attrib == undefined || attrib == null) {
		ShavingJournalEntries.sort(function(a,b) { 
							if (!(a.Date instanceof Date))
								return 1;
							if (!(b.Date instanceof Date))
								return 0;

							return a.Date.getTime() - b.Date.getTime(); 
							});
	} 
}
function sortProducts(attrib) {
	if (attrib == undefined || attrib == null) {
		ShavingReviewedProducts.sort( function(a,b) {
			if (a.ReviewDate.getTime() == b.ReviewDate.getTime())
				return a.Grade - b.Grade;
			else
				return a.ReviewDate.getTime() - b.ReviewDate.getTime();
		});
	} else {
		// TODO: sort by individual grade
		//console.log(" ATTRIB: "+attrib);
		ShavingReviewedProducts.sort( function(a,b) {
			if (a[attrib] != null && b[attrib] != null)
				return a[attrib] - b[attrib];
			else if (a.ReviewDate.getTime() == b.ReviewDate.getTime())
				return a.Grade - b.Grade;
			else
				return a.ReviewDate.getTime() - b.ReviewDate.getTime();
		});
	}
}
function sortShavingCombos() {
	// Always ASC from the END
	ShavingCombos.sort(function(a,b) { return a.Grade - b.Grade; });
}
function createShavingCombos() {
	for (var i = ShavingJournalEntries.length-1; i >= 0; i--) {
		var c = new ShavingComboType(ShavingJournalEntries[i]);
		var dup = ShavingCombos.indexOf(c);
		if (dup != -1)
			ShavingCombos[dup].merge(ShavingJournalEntries[i]);
		else
			ShavingCombos.push(c);
	}
}

function getShavingData(cb) {
    HG_getJournalData(
        {   "album_id" : "HG_Shaving",
            "album_var" : "ShavingAlbum",
            "spreadsheets" : 
                [   {   "name": "reviews",
                        "entries_var" : "ShavingReviewedProducts",
                        "entries_type" : "ProductType",
                        "retrieval_url" : url_reviews
                    }
					 ,
					
                    {   "name": "journal",
                        "entries_var" : "ShavingJournalEntries",
                        "entries_type" : "JournalEntryType",
                        "retrieval_url" : url_journal
                    }
                ],
            "loaded_callback" : cb
        },
        HG_Journal_loadingMessage 
    );
}

/*
function loadUnreviewed() {
	// SOAPS/CREAMS
	UnreviewedProducts.push(new ProductType({
		"producttype": "Cream",
		"purchasedate": "02/05/2011",
		"purchaselocation": "SaintCharlesShave.com",
		"productvendor": "Saint Charles Shave",
		"productname": "Shave Cream",
		"scent": "Fairway",
		"purchaseprice": 6.38
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Cream",
		"purchasedate": "08/19/2010",
		"purchaselocation": "B&B User: The Knize",
		"size": "sample",
		"purchaseprice": 0
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Soap",
		"purchasedate": "02/05/2011",
		"purchaselocation": "SaintCharlesShave.com",
		"productvendor": "Saint Charles Shave",
		"productname": "Shave Soap",
		"scent": "Mochaccino",
		"size": "sample",
		"purchaseprice": 0
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Soap",
		"purchasedate": "02/06/2011",
		"purchaselocation": "MamaBearsSoaps.com",
		"productvendor": "Mama Bear's",
		"productname": "Glycerin Shaving Soap",
		"scent": "Dragon's Blood | Bonsai | Sapmoss | Diogenes Club",
		"purchaseprice": 1
	}));

	"purchasedate": "02/20/2011",
	"purchaselocation": "VintageScent.com",
		444 Aftershave Balm, 5.43

	"purchasedate": "02/21/2011",
	"purchaselocation": "B&B User: life2short1971",
		Coticule, 65

	// AFTERSHAVES
	UnreviewedProducts.push(new ProductType({
		"producttype": "Aftershave",
		"purchasedate": "08/20/2010",
		"purchaselocation": "TruefittAndHill.com",
		"productvendor": "Truefitt And Hill",
		"productname": "Aftershave Balm",
		"size": "sample",
		"scent": "",
		"purchaseprice": 0.77
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Aftershave",
		"purchasedate": "02/05/2011",
		"purchaselocation": "SaintCharlesShave.com",
		"productvendor": "Saint Charles Shave",
		"productname": "Aftershave Splash",
		"scent": "Hydro",
		"purchaseprice": 11
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Aftershave",
		"purchasedate": "02/14/2011",
		"purchaselocation": "ShoeboxShaveShop.com",
		"productvendor": "Booster",
		"productname": "Aftershave",
		"scent": "Iced Limes",
		"size": "sample",
		"purchaseprice": 2.5
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Aftershave",
		"purchasedate": "02/14/2011",
		"purchaselocation": "ShoeboxShaveShop.com",
		"productvendor": "Alcolado",
		"productname": "Aftershave",
		"scent": "Glacial",
		"size": "sample",
		"purchaseprice": 1.99
	}));
	UnreviewedProducts.push(new ProductType({
		"producttype": "Aftershave",
		"purchasedate": "02/14/2011",
		"purchaselocation": "ShoeboxShaveShop.com",
		"productvendor": "Superior 70",
		"productname": "Aftershave",
		"scent": "Mentholated Bay Rum",
		"purchaseprice": 7.49
	}));

	Razor
	08/27/2011
	Antique Emporium (Booth B-7)
	Giesen & Forsthoff
	Adoration Ax
	?SIZE?
	$18

	Razor
	03/19/2011
	Old Glory Antique Marketplace in Frederick, MD
	Union Cutlery
	Spike
	5/8 Half hollow
	$12
}
*/
