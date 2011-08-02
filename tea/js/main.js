var tabsObj = null;
function renderShavingJournalEntry(entry_elem, entry, num_displayed) {
	//console.log("renderShavingJournalEntry(", entry, ", ", num_displayed, ")");
	var row = null;
	var cell = null;

	var img = document.createElement("img");
	img.setAttribute("src", entry.Tea.Pictures[0].getURL(150));

	row = document.createElement("tr");
	cell = document.createElement("td");
	cell.appendChild(img);
	row.appendChild(cell);
	cell = document.createElement("td");
	cell.appendChild(document.createTextNode(entry.Tea.getName()));
	cell.setAttribute("id", "tea_name");
	if (d.Tea.Type != "Blend")
		cell.appendChild(document.createTextNode(" ("+d.Tea.Type+")"));
	row.appendChild(cell);
	entry_elem.appendChild(row);

	// Fixins
	var tea_fixins = entry.Fixins;
	//tea_fixins = ["Milk", "Honey"]; // FIXME
	if (tea_fixins != null) {
		var fixins_list = document.createElement("div");
		fixins_list.setAttribute("id", "tea_fixins");
		fixins_list.innerHTML = "with ";
		//for (var i = 0; i < tea_fixins.length; i++) {
		for (var i = tea_fixins.length-1; i >= 0; i--) {
			//if (i == tea_fixins.length-1)
			if (i == 0)
				fixins_list.innerHTML += " and ";
			//else if (i != 0)
			else if (i != tea_fixins.length-1)
				fixins_list.innerHTML += ", ";
			fixins_list.innerHTML += tea_fixins[i].toLowerCase();;
		}
		ceal.appendChild(fixins_list);
	} 

	if (row != undefined) delete row;
	if (cell != undefined) delete cell;

	return true;
}
function loadTeaJournal(sort_field, sort_dir, filter) {
    var table = $("<table></table>");
    for (var ii = 0; ii < TeaJournalEntries.length; ii++) {
        var entry = TeaJournalEntries[ii];
        console.log("loadTeaJournal(): ", TeaJournalEntries[ii]);
        table.append($("<tr></tr>")
              .append($("<td></td>").append(HG_formatDate(new Date(entry.EntryDate))))
              .append($("<td></td>").append(entry.Tea.getName()))
              );
    }
    $("#journal_tab").append(table);
    displayed_entries = TeaJournalEntries.length;
    console.log("Done adding journal entries");
}
function renderTeaJournalEntry(entry, num_displayed) {
    var table = $("<table></table>");
    for (var ii = 0; ii < TeaJournalEntries.length; ii++) {
        var entry = TeaJournalEntries[ii];
        console.log("loadTeaJournal(): ", TeaJournalEntries[ii]);
        table.append($("<tr></tr>")
              .append($("<td></td>").append(HG_formatDate(new Date(entry.EntryDate))))
              .append($("<td></td>").append(entry.Tea.getName()))
              );
    }
    $("#journal_tab").append(table);
    displayed_entries = TeaJournalEntries.length;
    console.log("Done adding journal entries");
}

function loadTeaProducts(sort_field, sort_dir, sort_group, filter) {
    var table = $("<table></table>");
    for (var ii = 0; ii < TeaProductEntries.length; ii++) {
        var entry = TeaProductEntries[ii];
        table.append($("<tr></tr>")
              .append($("<td></td>").append(entry.ID))
              .append($("<td></td>").append(entry.getName()))
              );
    }
    $("#products_tab").append(table);
    //console.log("Done adding products");
}

function loadExtras() {
	sortTeaJournal();
    //if (ShavingCombos == null || ShavingCombos.length <= 0) createShavingCombos();
	//loadTrends();

    /*
	var exclusion_list = null;
	if (window.location.hostname == "localhost") {
		loadForms();
	} else {
		exclusion_list = ["Submit Entry", "TODO"];
		var forms = document.getElementById("forms");
		forms.parentNode.parentNode.removeChild(forms.parentNode);
	}
    */

    HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries", 
    					      null,
                                              "journal_tab", 
					      "renderShavingJournalEntry"),
                         new HG_Journals_View("TeaProductEntries", 
    					      null,
                                              "products_tab", 
                                              function() {
	                                            loadTeaProducts(0, "DESC", "TYPE", null);
                                              }),

                        ], 
                        null);
			/*
                                              function() {
	                                            loadTeaJournal(0, "DESC", null);
                                              }),
					      */

	// Journal tab TODO: this needs to happen on each resize
	//var journal_lyr = document.getElementById('journal_scroller');
	//setStyle(journal_lyr, "height: "+parseInt(document.documentElement.clientHeight-110)+"px;");

	//HG_Journal_tabsObj.AddToggleListener(onTabToggle);
}

function HG_Journal_local_init() {
    getTeaData(loadExtras);
}
