function Currency(data) {
	this.Collection = null;
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
		this.Collection = d.collection;
		this.Type = d.type;
		this.Denomination = d.denomination.toLowerCase();
		this.Year = d.year;
		this.MintLocationCode = d.mintlocationcode;
		this.Country = d.country;
		this.Acquired = eval(d.acquired.toLowerCase());
		this.DateAcquired = d.dateacquired;
		this.pics = { "obverse": d.pics_obverse, "reverse": d.pics_reverse }
		this.Notes = d.notes;
	}

	this.id = function() {
		var id = this.Year;
		if (this.MintLocationCode != null && this.MintLocationCode.length > 0)
			id += "-"+this.MintLocationCode;
		return id;
	}

	this._loadData(data);
};

function CurrencyCollection(name) {
	this.Name = name;
	this.CurrencyList = [];

	this.getCurrencyByID = function(id) {
		for (var i = this.CurrencyList.length-1; i >= 0; i--) {
			if (this.CurrencyList[i].id() == id) 
				return this.CurrencyList[i];
		}
	}

	this.Size = function() {
		return this.CurrencyList.length;
	}

	this.Sort = function() {
		this.CurrencyList.sort(function(a,b) { 
					return a.Year > b.Year;

					/*if (a.Year > b.Year) return true;
					else if (a.Year < b.Year) return false;
					else {
						if (a.MintLocationCode == null || a.MintLocationCode.length <= 0)
							return true;
						else if (b.MintLocationCode == null || b.MintLocationCode.length <= 0)
							return false;
						else
							return a.MintLocationCode > b.MintLocationCode;
					}*/
					//return a.id() > b.id(); 
					});
	}
};

var collectionsLoaded = false;
function addCurrencyEntry(collections, currency) {
	//console.log("addCurrencyItem(): "+collections.length, currency);
	var match = -1;
	for (var i = collections.length-1; i >= 0; i--) {
		if (collections[i].Name == currency.Collection) {
			//console.log("MATCH ("+i+"): ", currency);
			//console.log("  '"+collections[i].Name+"' == '"+currency.Collection+"'");
			match = i;
			break;
		//} else {
			//console.log("NO MATCH ("+i+"): ", currency);
			//console.log("  '"+collections[i].Name+"' != '"+currency.Collection+"'");
		}
	}
	if (match < 0) {
		//console.log("creating new collection: "+match);
		var collection = new CurrencyCollection(currency.Collection);
		collections.push(collection);
		delete collection;
		match = 0;
	}
	collections[match].CurrencyList.push(currency);

	delete match;
}

function parseCollections(entries, collections) {
	//console.log("parseCollections()", entries);
	if (entries == null) return;
	
	if (entries != null && entries.length > 0) {
		for (var i = entries.length-1; i >= 0; i--) {
			var currency = new Currency(entries[i]);
			addCurrencyEntry(collections, currency);
			delete currency;
		}
	}

	collectionsLoaded = true;
	delete entries;
}

function loadDataWhenAvailable(cb) {
	if (!collectionsLoaded) {
		setTimeout(function() { loadDataWhenAvailable(cb); }, 5000);
	} else {
		delete collectionsLoaded;
		cb();
	}
}

function getCollections(spreadsheet, collections, cb) {
	getDataFromSpreadsheet(new SpreadsheetRetrieval
								(spreadsheet, parseCollections, collections));
	loadDataWhenAvailable(cb);
}

function loadInBulk() {
	if (1 == 1) return;

	var bulk = [
				   [1956, "", "FALSE", ""]
				  ];
	var url = "https://spreadsheets.google.com/formResponse?formkey=dGpnYzlqbjc4aF9kbTlVNjBDRzYyZEE6MQ";
	var defaults = ["entry.10.single=Pennies", "entry.0.group=coin", 
					"entry.1.single=penny", "entry.4.single=US",
					"entry.6.single=", "entry.7.single=", "entry.8.single="];
	var bulk_template = ["entry.2.single", "entry.3.single", 
						 "entry.5.group", "entry.9.single"];
	for (var i = 0; i < bulk.length; i++) {
		var params = [];
		for (var j = 0; j < bulk[i].length; j++) {
			params.push(bulk_template[j]+"="+bulk[i][j]);
		}
		params = params.concat(defaults);
		//console.log("BULK: ", params);
		(new libHTTPRequest()).sendData(url, params);
	}
}
