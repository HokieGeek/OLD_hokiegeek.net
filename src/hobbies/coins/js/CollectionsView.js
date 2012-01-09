var CollectionsViews = [];
function CollectionsView_Item(currencyPos, listItem, detailsItem) {
	this.CurrencyPos = currencyPos;
	this.ListItem = listItem;
	this.DetailsItem = detailsItem;

	this.IsSelected = false;

	this.SelectToggle = function() {
		if (this.IsSelected) {
			removeClass(this.ListItem, "CurrencyList_Item_Selected");
			removeClass(this.DetailsItem, "CurrencyDetails_Item_Selected");
		} else {
			addClass(listItem, "CurrencyList_Item_Selected");
			addClass(detailsItem, "CurrencyDetails_Item_Selected");
		}
		this.IsSelected = !this.IsSelected;
	}

};
function CollectionsView(tab_id, collection) {

	this.Me = null;
	this.Tab = null;
	this.ListLyr = null;
	this.Collection = collection;

	this.CurrenciesView = null;
	this.CurrencyListView = null;
	this.CollectionItemViews = [];
	this.Selected = -1;

	this.scrollToCurrency = function(pos) {
		var item = this.CollectionItemViews[pos];
		var listItem = item.ListItem;
		var detailsItem = item.DetailsItem;
		//var sH = detailsItem.scrollHeight;
		var item_pos = findPos(detailsItem);
		this.CurrenciesView.scrollTop = item_pos[1]-50;
		//var item_pos = [0, detailsItem.offsetTop]; //findPos(detailsItem);
		//this.CurrenciesView.scrollTop = detailsItem.offsetTop-50;

		if (this.Selected >= 0)
			this.CollectionItemViews[this.Selected].SelectToggle();
		item.SelectToggle();
		this.Selected = pos;

		delete item;
		delete listItem;
		delete detailsItem;
	}

	this.addItemToCurrencyList = function(t, item, pos) {
		var opt = document.createElement("div");
		if (item.Acquired) 
			opt.setAttribute("class", "CurrencyList_Acquired");
		opt.setAttribute("onclick", "CollectionsViews["+t.Me+"].scrollToCurrency('"+pos+"')");
		opt.appendChild(document.createTextNode(item.id()));
		return opt;
	}

	this.createCurrencyItem = function(currency) {
		var item = document.createElement("div");

		var classes = "CurrencyDetails_Item";
		if (currency.Acquired)
			classes += " CurrencyDetails_Item_Acquired"
		item.setAttribute("class", classes);

		// Pictures (TODO: make a slideshow-like object)
		var pics = document.createElement("div");
		pics.setAttribute("class", "CurrencyDetails_Item_Pics");
		var pic_obverse = document.createElement("img");
		if (currency.pics.obverse != null && currency.pics.obverse != "")
			pic_obverse.setAttribute("src", currency.pics.obverse);
		else
			pic_obverse.setAttribute("src", "img/coins_default_obverse.png");

		var pic_reverse = document.createElement("img");
		if (currency.pics.reverse != null && currency.pics.reverse != "")
			pic_reverse.setAttribute("src", currency.pics.reverse);
		else
			pic_reverse.setAttribute("src", "img/coins_default_reverse.png");
		pics.appendChild(pic_obverse);
		pics.appendChild(pic_reverse);

		// ID
		var id = document.createElement("div");
		id.setAttribute("class", "CurrencyDetails_Item_Id");
		id.appendChild(document.createTextNode(currency.id()));

		// Country + denomination
		var countryDenom = document.createElement("div");
		countryDenom.setAttribute("class", "CurrencyDetails_Item_CountryDenom");
		var denom = currency.Denomination;
		var countryDenom_txt = denom[0].toUpperCase()+denom.substr(1).toLowerCase();
		countryDenom_txt += " ("+currency.Country+")"
		countryDenom.appendChild(document.createTextNode(countryDenom_txt));

		// Notes
		var notes = document.createElement("div");
		notes.setAttribute("class", "CurrencyDetails_Item_Notes");
		if (currency.Notes != null && currency.Notes.length > 0) {
			notes.appendChild(document.createTextNode(currency.Notes));
		}

		item.appendChild(pics);
		item.appendChild(id);
		item.appendChild(countryDenom);
		item.appendChild(notes);

		delete classes;
		delete pic_obverse;
		delete pic_reverse;
		delete pics;
		delete id;
		delete denom;
		delete countryDenom_txt;
		delete countryDenom;
		delete notes;

		return item;
	}

	this._loadCollection = function(tab_id, collection, sort_field, sort_dir, filter) {
		//console.log("CollectionsView.loadCollection(", tab_id, ", ", collection, ")");

		this.Tab = document.getElementById(tab_id);
		if (this.Tab == null) return;

		this.Me = CollectionsViews.length;
		CollectionsViews.push(this);

		// Create the list layer
		this.CurrencyListView = document.createElement("div");
		this.CurrencyListView.setAttribute("class", "CollectionsView_Panel");
		var currencyList = document.createElement("div");
		currencyList.setAttribute("class", "CurrencyList");

		// Create the details layer
		this.CurrenciesView = document.createElement("div");
		this.CurrenciesView.setAttribute("class", "CollectionsView_Panel");

		for (var i = 0; i < collection.CurrencyList.length; i++) {

			var item = this.createCurrencyItem(collection.CurrencyList[i]);
			this.CurrenciesView.appendChild(item);

			var listItem = this.addItemToCurrencyList(this, collection.CurrencyList[i], i);
			currencyList.appendChild(listItem);

			//this.CollectionItemViews.push(item);
			this.CollectionItemViews.push(new CollectionsView_Item(i, listItem, item));

			delete listItem;
			delete item;
		}
		this.CurrencyListView.appendChild(currencyList);

		this.Tab.appendChild(this.CurrencyListView);
		this.Tab.appendChild(this.CurrenciesView);

		delete currencyList;

	}

	this._loadCollection(tab_id, collection, 0, "DESC", null);
};
