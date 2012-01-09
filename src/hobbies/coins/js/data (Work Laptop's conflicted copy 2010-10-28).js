function Currency(data) {
	this.Type = null;
	this.Denomination = null;
	this.Year = null;
	this.MintLocationCode = null;
	this.Country = null;
	this.Acquired = false;
	this.DateAcquired = null;
	this.Notes = null;
	this.pics = null;

	this._loadData = function(d) {
		this.Type = d.type;
		this.Denomination = d.denomination.toLowerCase();
		this.Year = d.year;
		this.MintLocationCode = d.mintlocationcode;
		this.Country = d.country;
		this.Acquired = eval(d.acquired.toLowerCase());
		this.DateAcquired = d.dateacquired;
		this.pics = { "front": d.pics_front, "reverse": d.pics_reverse }
		this.Notes = d.notes;
	}

	this.id = function() {
		var id = this.Year;
		if (this.MintLocationCode.length > 0)
			id += "-"+this.MintLocationCode;
		return id;
	}

	this._loadData(data);
};

function CurrencyCollection(name, match, spreadsheet_url) {
	this.Name = name;
	this.CurrencyList = [];
	this._MatchingCriteria = match;
	this._Spreadsheet = spreadsheet_url;

	this.getCurrencyByID = function(id) {
		for (var i = this.CurrencyList.length-1; i >= 0; i--) {
			if (this.CurrencyList[i].id() == id) return this.CurrencyList[i];
		}
	}

	this.Size = function() {
		return this.CurrencyList.length;
	}
};

var SpreadsheetRetrievals = [];
function SpreadsheetRetrieval(url, cb, cb_args) {
	this.ArrayPos = -1;
	this.SpreadsheetURL = url;
	this.UserCallback = cb;
	this.UserCallbackArguments = cb_args;

	this.Callback = function(pos, ret) {
		console.log("SpreadsheetRetrieval.Callback(): ", pos);
		SpreadsheetRetrievals.splice(pos,1);
		if (this.UserCallbackArguments != null) 
			this.UserCallback(ret, this.UserCallbackArguments);
		else
			this.UserCallback(ret);
	}

	this.Retrieve = function(arrayPos) {
		console.log("SpreadsheetRetrieval.Retrieve: ", this.SpreadsheetURL);
		(new libHTTPRequest()).getData(this.SpreadsheetURL, 
									   "gs=wise", 
									   function(ret) {
											SpreadsheetRetrievals[arrayPos].Callback(arrayPos, ret);
									   },
									   true);
	}
}
function getDataFromSpreadsheet(retriever) {
	console.log("getDataFromSpreadsheet(", retriever,")");
	retriever.ArrayPos = SpreadsheetRetrievals.length;
	SpreadsheetRetrievals.push(retriever);
	retriever.Retrieve(retriever.ArrayPos);
}

function loadCollection(ret, collection) {
	console.log("loadCollection: ", ret, collection);
	loadDummyPennies(collection);
}

function getCollections(collections, cb) {
	for (var i = collections.length-1; i >= 0; i--) {
		//loadCollection("DUMMY", collections[i]);
		getDataFromSpreadsheet(new SpreadsheetRetrieval(collections[i]._Spreadsheet,
								 						loadCollection, collections[i]));
	}
	if (cb != null)
		loadDataWhenAvailable(cb);
}

function loadDataWhenAvailable(cb) {
	if (SpreadsheetRetrievals.length > 0) {
		console.log("loadDataWhenAvailable(): WAITING");
		setTimeout(function() { loadDataWhenAvailable(cb); }, 5000);
	} else {
		console.log("loadDataWhenAvailable(): DONE");
		cb();
	}
}
function loadDummyPennies(c) {
	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1883, "mintlocationcode": "",
									  "country": "US", "acquired": "FALSE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1884, "mintlocationcode": "",
									  "country": "US", "acquired": "FALSE",
									  "dateacquired": "", "notes": "This one is special",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1884, "mintlocationcode": "D",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	for (var i = 0; i < 23; i++) {
		c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
										  "year": (1940+i), "mintlocationcode": "",
									      "country": "US", "acquired": "FALSE",
									      "dateacquired": "", "notes": "",
									      "pics_front":  "", "pics_reverse":  ""
									     }));
	}

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1990, "mintlocationcode": "",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1990, "mintlocationcode": "S",
									  "country": "US", "acquired": "FALSE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 1990, "mintlocationcode": "D",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 2009, "mintlocationcode": "",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 2009, "mintlocationcode": "",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 2009, "mintlocationcode": "D",
									  "country": "US", "acquired": "TRUE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  "" }));

	c.CurrencyList.push(new Currency({"type": "COIN", "denomination": "penny",
									  "year": 2009, "mintlocationcode": "D",
									  "country": "US", "acquired": "FALSE",
									  "dateacquired": "", "notes": "",
									  "pics_front":  "", "pics_reverse":  ""
									 }));
}
