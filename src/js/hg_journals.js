var pw_albums = null;
var HG_Journal_tabsObj = null;



function HG_retrievePicturesFromAlbum(pics, album) {
   var retrieved = pics.split(";");
   retrieved.pop(); // Last one is always empty
   for (var i = retrieved.length-1; i >= 0; i--) {
        var orig = retrieved[i];
        if (album != null) {
            retrieved[i] = album.getPicture(retrieved[i]);
        } else
            retrieved[i] = null;

            // FIXME: this is not appropriate in here
        if (retrieved[i] == null)
            retrieved[i] = "img/default.png";
    }

    return retrieved;
}

function HG_loadSpreadsheetEntries(entries, progress_message_cb, sheet_info) {
   // console.log("HG_loadSpreadsheetEntries(",sheet_info,")");//", entries, ", progress_message_cb", sheet_info, ")");
	if (entries != null && entries.length > 0) {
        if (progress_message_cb != undefined)
	        progress_message_cb("Loading "+sheet_info.name+"...");

		for (var i = entries.length-1; i >= 0; i--) {
            var array = eval(sheet_info.entries_var);
            var entry_type = eval(sheet_info.entries_type);
            array.push(new entry_type(entries[i]));
            // eval(sheet_info.entries_var+".push(new "+sheet_info.entries_type+"(entries["+i+"]))");
		}
	}
}

function HG_getSpreadsheetEntries(retrieval_condition, entries, url, loader_cb) {
    //console.log("HG_getSpreadsheetEntries("+retrieval_condition+")");//: ", retrieval_condition, entries, url, loader_cb);
    if (!eval(retrieval_condition)) {
        setTimeout(function() { HG_getSpreadsheetEntries(retrieval_condition, entries, url, loader_cb) }, 5000);
		return;
	} 
		
	while (entries.length > 0) entries.pop();
	getGoogleData(new GSpreadsheetRetrieval(url, loader_cb, null));
}

function HG_getJournalData(data, progress_message_cb) {
/*
{   
    "album_id"
    "album_var"
    "spreadsheets" 
        [
            {   
                "name",
                "entries_var"
                "entries_type"
                "retrieval_condition"
                "retrieval_url"
            }
        ]
    "loaded_condition"
    "loaded_callback"
}
*/

    //console.log("HG_getJournalData()");
    if (progress_message_cb != undefined)
	    progress_message_cb("Loading pictures...");
    if (pw_albums == null)
	    pw_albums = new PicasaWeb("andres.f.perez");
	HG_loadOnCondition("pw_albums.isLoaded('"+data.album_id+"')",
                       new Function('', data.album_var+" = pw_albums.getAlbum('"+data.album_id+"');"),
                       1500);
    
    var entries_vars = [];
    for (var ii = 0; ii < data.spreadsheets.length; ii++) {
        var data_sheet = data.spreadsheets[ii];

        // Determine the retrieval condition
        var retrieval_condition = null;
        if (data_sheet.retrieval_condition == undefined) {
            if (entries_vars.length == 0) 
                retrieval_condition = "pw_albums.isLoaded('"+data.album_id+"')";
            else
                retrieval_condition = "("+entries_vars[entries_vars.length-1]+".length > 0)";
        } else if (data_sheet.retrieval_condition == null) {
            retrieval_condition = "true";
        } else {
            retrieval_condition = data_sheet.retrieval_condition;
        }

        // Call the retrieval function
        entries_vars.push(data_sheet.entries_var);
		try {
        	HG_getSpreadsheetEntries(retrieval_condition,
                                	eval(data_sheet.entries_var), 
                                	data_sheet.retrieval_url, 
                                    new Function('entries', "HG_loadSpreadsheetEntries(entries, "+
                                                                                       progress_message_cb+", "+
                                                                            "{"
                                                                            +"'name':'"+data_sheet.name+"', "
                                                                            +"'entries_var':'"+data_sheet.entries_var+"', "
                                                                            +"'entries_type':'"+data_sheet.entries_type+"', "
                                                                            +"});")
									);
		} catch (err) {
			console.log("WTF? Something here just didn't work: ", err);
			console.trace();
		}
    }

    // if loader condition == null, then build one based ont he entries vars found
    if (data.loaded_callback != undefined && data.loaded_callback != null) {
        var loaded_condition = null;
        if (data.loaded_condition == undefined) {
            loaded_condition = "(";
            for (var ii = 0; ii < entries_vars.length; ii++) {
                if (ii != 0) loaded_condition += " && ";
                loaded_condition += entries_vars[ii]+".length > 0";
            }
            loaded_condition += ")";
        } else
            loaded_condition = data.loaded_condition;
        //console.log("  loaded_condition = ", loaded_condition);
	    HG_loadOnCondition(loaded_condition, data.loaded_callback, 5000); 
    }

    return true;
}

function HG_formatDate(d, f) {
	if (d == undefined || !(d instanceof Date)) {
		return d;
	}

	var fmt = f;
	if (f == undefined) fmt = "%M/%D/%Y";

    if (f != undefined && f == "%vague") {
        return getVagueTime(d);
    } else {
        var month = d.getMonth()+1;
        if (month.toString().length < 2) month = "0"+month;
        var day = d.getDate();
        if (day.toString().length < 2) day = "0"+day;
        var year = d.getFullYear();
        return fmt.replace("%Y", year).replace("%M", month).replace("%D", day);
    }
}

function HG_getNextProductID(products) {
	var max = -1;
	for (var i = products.length-1; i >= 0; i--) {
		if (eval(products[i].ID) > max) 
			max = products[i].ID;
	}
	return ++max;
}
function HG_getProductByID(products, id) {
    //console.log("HG_getProductByID(["+products.length+"]", products, ", ", id, ")");
    if (products == null || (id < 0 || id >= products.length)) {
        console.log("  crap!: ", (products == null), (id < 0), (id >= products.length));
		return null;
	}

	for (var i = products.length-1; i >= 0; i--) {
        //console.log("  products["+i+"] = ", products[i].ID, products[i]);
		if (eval(products[i].ID) == id) return products[i];
        //console.log("     <not it>");
	}
	return null;
}

function HG_Journal_loadingMessage(msg) {
	if (msg == null) return;

	var message = document.createTextNode(msg);
	var loading_progress = document.getElementById("hg_journal_loading");
    if (loading_progress != null) {
	    loading_progress.removeChild(loading_progress.firstChild);
	    loading_progress.insertBefore(message, loading_progress.firstChild);
    }
}

var countExpanded = 0;
var filterBox = null;
var filterMsg = null;
var filter = null;
function genExpandCollapseControls(expand, collapse) {
	var ctrls = "";
	if (expand) 
		ctrls += '<a href="javascript://" onclick="toggleJournalExpand(true)">Expand All</a>';
	else 
		ctrls += "Expand All";
	ctrls += ' <span style="color: #000; position: relative; top: 0px"> | </span>';
	if (collapse) 
		ctrls += '<a href="javascript://" onclick="toggleJournalExpand(false)">Collapse All</a>';
	else 
		ctrls += "Collapse All";

	return ctrls;
}
function toggleJournalExpand(expand) {
	//console.log("toggleJournalExpand(", expand, ")");
	var controls = document.getElementById('journal_expand_collapse');

	// Now expand or collapse all of the entries
	if (journalTable == null) journalTable = document.getElementById("journal");
	var children = journalTable.childNodes;
	/*
	*/
	for (var i = children.length-1; i >= 0; i--) {
		if (children[i].nodeName.toLowerCase() == "tr")
			toggleEntryDetails(children[i], false, expand);
	}
	controls.innerHTML = genExpandCollapseControls(!expand, (countExpanded > 0));
}
function toggleEntryElement(elem, expand) {
	if (elem == null || elem == undefined) return;
	var classes = elem.getAttribute("class");
	if (classes == null || classes == undefined) classes = "";

	if (classes.indexOf("entry_full") == -1) return;

	if (expand == null) 
		expand = (classes.indexOf("entry_full_hide") != -1);
	classes = classes.replace(" entry_full_hide", "");
	if (expand)
		elem.setAttribute("class", classes);
	else
		elem.setAttribute("class", classes+" entry_full_hide");

	countExpanded += (expand) ? 1 : -1;
}
function toggleEntryDetails(entry, single, expand) {
	var children = entry.getElementsByTagName('span');
	for (var i = 0; i < children.length; i++) toggleEntryElement(children[i], expand);
	children = entry.getElementsByTagName('tr');
	for (var i = 0; i < children.length; i++) toggleEntryElement(children[i], expand);

	if (single) {
		var controls = document.getElementById('journal_expand_collapse');
		controls.innerHTML = genExpandCollapseControls(true, (countExpanded > 0));
	}
}
function HG_Journal_clearFilterValue() {
	if (filterMsg == null) filterMsg = document.getElementById("hg_journal_filter").getElementsByTagName("span")[0];
	if (filterBox == null) filterBox = document.getElementById("hg_journal_filter_exp");
	if (filter == null) filterBox.value = "";
}

function HG_Journal_resizeTabs() {
    //console.log("HG_Journal_resizeTabs()");
	var divs = document.getElementsByTagName('div');
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].getAttribute("class") == "tab_content") {
			// Ignore the left tabs! Only top level!
			var height = 0;
			var parent_classes = divs[i].parentNode.parentNode.parentNode.getAttribute("class");
			if (parent_classes != null && parent_classes.indexOf("tab_content") != -1) {
				var toptab = divs[i].parentNode.parentNode.parentNode.getAttribute("id");
				var offset = (toptab == "forms") ? 90 : filteredTabsHeight;
				height = (parseInt(document.documentElement.clientHeight-offset));
			} else {
				height = (parseInt(document.documentElement.clientHeight-60));
			}
			//console.log("HEIGHT("+parent_classes+"): ", height);
			setStyle(divs[i], "height: "+height+"px !important;");
		}
	}
}

function HG_Journal_addControls() {
    /*
<div id="hg_journal_filter">
	<span></span>
	<input type="text" id="hg_journal_filter_exp" class="list_filter" value=""
	   onfocus="filterFocusToggle(true);" onblur="filterFocusToggle(false);" />
</div>
<div id="hg_journal_loading">
	Loading...
	<img src="../img/progress.gif" />
</div>
    */
    var loader = document.createElement("div");
    loader.setAttribute("id", "hg_journal_loading");
    loader.appendChild(document.createTextNode("Loading..."));
    var loader_img = document.createElement("img");
    loader_img.setAttribute("src", "http://hokiegeek.net/img/progress.gif");
    loader.appendChild(loader_img); 
    document.body.insertBefore(loader, document.body.firstChild);

    filter = document.createElement("div");
    filter.setAttribute("id", "hg_journal_filter");
    filter.innerHTML = '<span></span><input type="text" id="hg_journal_filter_exp" class="list_filter" value="" onfocus="filterFocusToggle(true);" onblur="filterFocusToggle(false);" />';
    document.body.insertBefore(filter, document.body.firstChild);
	if (filterMsg == null) filterMsg = filter.getElementsByTagName("span")[0];
}

function HG_Journal_keyboardHandler(e) {

	var evt = (e) ? e : ((window.event) ? window.event : null);
	if (evt) {
		var charCode = (evt.charChode) ? evt.charCode : 
						((evt.keyCode) ? evt.keyCode : 
		 					((evt.which) ? evt.which : 0));
		
		switch (charCode) {
		case 191: // '/'
		case 27: // 'ESC'
		case 13: // 'Enter'
		case 222: // '
		{
			if (getStyleProperty(filterBox, "visibility") == "hidden") {
				//console.log(">>>>>> HIDDEN");
				return;
			}

			/*var tab = null;
			switch (tabsObj.CurrentTab) {
			case 0: tab = "Journal"; break;
			case 1: tab = "Reviews"; break;
			}*/
			if (filterBox == null) filterBox = document.getElementById("hg_journal_filter_exp");

			if (filterBox != null) {
				var input_classes = filterBox.getAttribute("class");
				if (filter_busy) {
					if (charCode != 191)
						filterFocusToggle(false);
					if (charCode == 13) {
						if (filterBox.value.length > 0)
							filterData(filterBox.value);
					}
				} else {
					switch (charCode) {
					case 191:
						filterFocusToggle(true);
						break;
					case 27:
						console.log("HERE: ", filterBox.value.length);
						if (filterBox.value.length > 0)  {
							filterData(null);
						} 
						setStyle(filterBox, "background-color: #fff");
						break;
					}
				}
			}

			//// Get rid of the / in the text box
			// IE solution
			evt.cancelBubble = true;
			evt.returnValue = false;

			// Other browsers
			if (evt.stopPropagation) {
				evt.stopPropagation();
				evt.preventDefault();
			}
			return false;
			
		} 
		break;
		/*default:
			console.log("KEY: ", String.fromCharCode(charCode),"\tCODE: ", charCode);
			break;*/
		}
	}
}

function HG_viewControls() {
	this.sort_field = null;
	this.sort_dir = null;
	this.sort_group = null;
	this.filter = null;
}
function HG_Journals_View(d, f, e, r, df, c) {
    this.data = d;
	this.sortable_fields = f;
    this.elem_id = e;
    this.renderer = r;
    this.dateFormat = df;
    this.numColumns = ((c == undefined) ? 1 : c);
}
function HG_createJournalSorter(ctrls, view) {
	var sorter = document.getElementById('journal_sorter');
	sorter.innerHTML = "";

	//var sortable_fields = ["Date", "Grade"];
	if (view.sortable_fields == null) return;

	for (var i = 0; i < view.sortable_fields.length; i++) {
		var sortField = document.createElement('span');
		sortField.appendChild(document.createTextNode(view.sortable_fields[i]));
		var sort_img = null;
		var filter_txt = ((ctrls.filter == null) ? "null" : "'"+ctrls.filter.replace(/'/g, "\\\'")+"'");
		var dir = "ASC";
		// FIXME
		if (i == ctrls.sort_field) {
			sort_img = document.createElement('img');
			sort_img.setAttribute('class', "sort_arrow");
			sort_img.setAttribute('src', "img/sort_"+((ctrls.sort_dir == "ASC") ? "up" : "down")+".png");
			sortField.appendChild(sort_img);

			dir = (ctrls.sort_dir == "ASC") ? "DESC" : "ASC";
		}
		sortField.setAttribute('title', "Sort "+((dir == "ASC") ? "Ascending" : "Descending"));
		//i+", '"+dir+"', "+filter_txt+");");

		var view_str = "{";
		var start = true;
		for (p in view) {
			if (!start) view_str += ",";
			else start = false;
			view_str += "'"+p+"': ";
			if (view[p] instanceof Array) {
				view_str += "[";
				for (var ii = 0; ii < view[p].length; ii++) {
					if (ii != 0) view_str += ",";
					view_str += "'"+view[p][ii]+"'";
				}
				view_str += "]";
			} else {
				view_str += "'"+view[p]+"'";
			}
		}
		view_str += "}";

		sortField.setAttribute('onclick', "HG_renderJournal("+
												"{'sort_field': "+i+", 'sort_dir': '"+dir+"',"+
												" 'sort_group': null, 'filter': "+filter_txt+"}, "+
												view.toString()+");");
												//"{"+
												//+"});");
		sorter.appendChild(sortField);
		//sortField.setAttribute('onclick', "HG_renderJournal("+i+", '"+dir+"', "+filter_txt+");");
		
		/*
		if (ctrls.sort_field == 0 && ctrls.sort_dir == "ASC") {
			sort_img.setAttribute('src', "img/sort_up.png");
			sortField.appendChild(sort_img);
			sortField.setAttribute('title', "Sort Descending");
			sortField.setAttribute('onclick', "HG_renderJournal("+i+", 'DESC', "+filter_txt+");");
		} else {
			if (ctrls.sort_field == 0) {
				sort_img.setAttribute('src', "img/sort_down.png");
				sortField.appendChild(sort_img);
			}
			sortField.setAttribute('title', "Sort Ascending");
			sortField.setAttribute('onclick', "HG_renderJournal("+i+", 'ASC', "+filter_txt+");");
		}
		sorter.appendChild(sortField);
		*/
	}
}
//function HG_renderJournal(ctrls, data, entry_renderer) {
function HG_renderJournal(ctrls, view) {
/*
<div id="journal_control_area">
	<div id="journal_product_preview"></div>
	<div id="journal_expand_collapse">
		<a href="javascript://" onclick="toggleJournalExpand(true)">Expand All</a> 
		<span style="color: #000; position: relative; top: 0px;">|</span>
		Collapse All
	</div>
	<div id="journal_sorter"></div>
</div>
<div id="journal_scroller">
	<table id="journal"></table>
</div>
*/
	var data = eval(view.data);
	var entry_renderer = view.renderer;

	var journalLyr = document.getElementById(view.elem_id);
	var scroller = document.createElement("div");
	scroller.setAttribute("id", "journal_scroller");
	journalTable = document.createElement("table");
	journalTable.setAttribute("id", "journal");
	scroller.appendChild(journalTable);
	journalLyr.appendChild(scroller);
	
	// Retrieve the layers we need
	//if (journalTable == null) journalTable = document.getElementById("journal");
	var controls = document.getElementById('journal_expand_collapse');

	// Add the expand/collapse controls
	if (controls != undefined) {
		controls.innerHTML = genExpandCollapseControls(true, false);
		delete controls;
	}

	// Clear the filter value
    HG_Journal_clearFilterValue();
	journalTable.innerHTML = "";
	
	//// Create the sorting header
	//createJournalSorter(ctrls.sort_field, ctrls.sort_dir, ctrls.filter);
	HG_createJournalSorter(ctrls, view);

	var row = null;
	var entry_date = null;
	var entry_elem = null;
	var entries = data.slice();
    // console.log("loadShavingJournal(): ShavingJournalEntries["+ShavingJournalEntries.length+"]: ", ShavingJournalEntries);
    // console.log("loadShavingJournal(): entries["+entries.length+"]: ", entries);
	if (ctrls.sort_field == 1) // FIXME: use view.sortable_fields and a sorter which sorts by property
		entries.sort( function(a,b) 
				{ return grade_scale.indexOf(b.Grade) - grade_scale.indexOf(a.Grade); });

	// Now add the notes
	var num_entries = entries.length-1;
	displayed_entries = 0;
	row = document.createElement('tr');
    var distinct_row = false;
	for (var ii = num_entries; ii > -1; ii--) {
		var i = (ctrls.sort_dir == "DESC") ? ii : (num_entries-ii);
		// console.log("ENTRY #"+i+": ", entries[i]);
		if (ctrls.filter != null && !eval(ctrls.filter)) continue;

		// Create the entry date
		entry_date = document.createElement('td');
		entry_date.innerHTML = HG_formatDate(entries[i].Date, view.dateFormat);

		// Create the entry cell
		entry_elem = document.createElement('td');
		if (distinct_row) entry_elem.setAttribute("class", "distinct_row");
        $(entry_elem).addClass("entry_column");
		// if (!(displayed_entries % 2)) entry_elem.setAttribute("class", "distinct_row");
	
		if (!(eval(entry_renderer)(entry_elem, entries[i], displayed_entries))) continue;
		
		displayed_entries++;

		row.setAttribute("onclick", "toggleEntryDetails(this, true)");
		row.appendChild(entry_date);
		row.appendChild(entry_elem);

        if ((displayed_entries % view.numColumns) == 0) {
            //console.log("COLUMN?: ", entry_elem);
            $(entry_elem).removeClass("entry_column");
		    journalTable.appendChild(row);
		    row = document.createElement('tr');
            distinct_row = !distinct_row;
        }
        
        /*
		row = document.createElement('tr');
		row.setAttribute("onclick", "toggleEntryDetails(this, true)");
		row.appendChild(entry_date);
		row.appendChild(entry_elem);
		journalTable.appendChild(row);
        */
	}

	if (displayed_entries <= 3) {
		toggleJournalExpand(true);
	}

	delete num_entries;
	delete categories;
}

function HG_loadJournalViews(views, exclusion_list) {
	//console.log("HG_loadJournalViews(", views, ")");
	// TODO: 1. displayed_entries is specific ?
    setStyle(document.getElementById("hg_journal_loading"), "visibility: hidden;");	

	// Format and display the data
    for (var ii = 0; ii < views.length; ii++) {
		if (ii == 0) {
		HG_renderJournal({"sort_field" : 0, "sort_dir" : "DESC", "sort_group"  : null, 
						  "filter" : null}, views[ii]);
						 //eval(views[ii].data), 
						 //views[ii].renderer);
		} else
        	views[ii].renderer();
    }
	filterMsg.innerHTML = "Showing "+displayed_entries+" entries";

	// Setup the tabs and filter
	HG_Journal_resizeTabs();
	setStyle(filter, "visibility: visible;");
	HG_Journal_tabsObj = new LibTabs("HG_Journal_tabsObj", document.getElementById("hg_journal_tabs"), 
						  0, LibTabs_Orientation.TOP, exclusion_list);
    //console.log("Created tabs: ", HG_Journal_tabsObj, document.getElementById("hg_journal_tabs"));
	HG_Journal_tabsObj.HandleKeyboardInputs();

	// Listen for keypresses to perform some specific duties
	AddOKDListener(HG_Journal_keyboardHandler);
}

function HG_Journal_init() {
    HG_Journal_addControls();

	filter = document.getElementById("hg_journal_filter_exp");

	// Add the logo stuff
	if (window.location.hostname == "localhost")
		hg_subdomains_public_only = false;
	hg_small_nav(); 

    HG_Journal_local_init();
}
