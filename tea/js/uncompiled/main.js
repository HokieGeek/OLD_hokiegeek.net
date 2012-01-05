var tabsObj = null;

function renderShavingJournalEntry(entry_elem, entry, num_displayed) {
	//console.log("renderShavingJournalEntry(", entry, ", ", num_displayed, ")");
	var row = null;
	var cell = null;

    // Add the tea image
	var img = document.createElement("img");
	if (entry.Tea.Pictures[0] == undefined) {
		img.setAttribute("src", "img/tea_cup_greyed.png");
    	//console.log("PIC: [NONE] : ",entry.Tea.Name);
	} else {
		img.setAttribute("src", entry.Tea.Pictures[0].getURL(120));
    	//console.log("PIC: ",entry.Tea.Pictures[0]);
	}

	row = document.createElement("tr");
	cell = document.createElement("td");
	cell.appendChild(img);
	row.appendChild(cell);

	cell = document.createElement("td");

    var table_name = document.createElement("div");
	table_name.setAttribute("class", "tea_journal_entry_name"); // FIXME
	table_name.appendChild(document.createTextNode(entry.Tea.getName()));
	table_name.appendChild(document.createTextNode(" ("+entry.Tea.getType()+")"));

	// Fixins
	var tea_fixins = entry.Fixins;
	//tea_fixins = ["Milk", "Honey"]; // FIXME
	if (tea_fixins != null) {
		var fixins_list = document.createElement("div");
		fixins_list.setAttribute("class", "tea_journal_entry_fixins"); // FIXME
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
		table_name.appendChild(fixins_list);
	} 
    cell.appendChild(table_name);

	// Rating
	var tea_ratings_num = 4;
	var rating = document.createElement("div");
	rating.setAttribute("class", "tea_journal_entry_rating"); // FIXME
	for (var ii = 0; ii < tea_ratings_num; ii++) {
		var img = document.createElement("img");
		var img_src = "img/tea_cup";
		if (ii > entry.Rating-1) img_src += "_greyed";
		img_src += ".png";
		img.setAttribute("src", img_src);
		img.setAttribute("title", entry.Rating+"/"+tea_ratings_num+" steaming tea cups");
		rating.appendChild(img);
	}
    cell.appendChild(rating);

	row.appendChild(cell);
	entry_elem.appendChild(row);

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
	/* TODO
	 * 	- Pics slideshow
	 * 	- Average steep time
	 * 	- Rating (Leaf Aroma, Brewed Aroma, Taste, Value)
	 *
	 * 	- Stocked
	 * 	- Review Date?
	 * 	- Comments
	 */
    var table = $("<table></table>");
    for (var ii = 0; ii < TeaProductEntries.length; ii++) {
        var entry = TeaProductEntries[ii];

        //if (entry.ID == 2)
		    //console.log(entry.ID+") journal entries: ", entry.getJournalEntries());

		var pic = ((entry.Pictures[0] == undefined) ? "img/tea_cup_greyed.png" : entry.Pictures[0].getURL(140));
		var pics = $("<img />").attr("src", pic);

		var purchaseInfo = "";
		if (entry.PurchasePrice != null) purchaseInfo += "$"+entry.PurchasePrice+" ";
		if (entry.PurchaseLocation != null) purchaseInfo += "from "+entry.PurchaseLocation+" ";
		if (entry.PurchaseDate != null) purchaseInfo += "on "+HG_formatDate(entry.PurchaseDate);

		var packaging = "";
		if (entry.Size != undefined) packaging += entry.Size+" ";
		packaging += entry.getPackaging();

		var ratings = "TODO";

		var steepTime = 0;
		var journalEntries = entry.getJournalEntries();
		for (var jj = 0; jj < journalEntries.length; jj++) {
            //if (entry.ID == 2) 
                //console.log(HG_formatDate(journalEntries[jj].Date), ": ", journalEntries[jj].SteepTime, 
                                                                          //", ", formatSteepTime(journalEntries[jj].SteepTime));
			steepTime += parseInt(journalEntries[jj].SteepTime);
		}
		if (steepTime > 0) {
			steepTime /= journalEntries.length;
			//if (entry.ID == 2) console.log("STEEPTIME: ", steepTime);
			steepTime = formatSteepTime(steepTime);
		} else 
			steepTime = "N/A";

		var details = $("<table></table>").addClass("tea_product_entry_details");
		if (entry.Type != "Blend") {
			details
				.append($("<tr></tr>").append($("<td></td>").append("Origin"))
								  	  .append($("<td></td>").append(entry.getOrigin()))
									  .append($("<td></td>").append("Price"))
								  	  .append($("<td></td>").append(purchaseInfo)))
			;
		}

		details
			.append($("<tr></tr>").append($("<td></td>").append("Packaging"))
								  .append($("<td></td>").append(packaging))
								  .append($("<td></td>").append("Steep Time"))
								  .append($("<td></td>").append(steepTime)
								  							.attr("title", "Steep Time: Averaged from best journal entries")))
			.append($("<tr></tr>").append($("<td></td>").append("Ratings"))
								  .append($("<td></td>").append(ratings)))
		;

		var main = $("<table></table>")
			.append($("<tr></tr>").addClass("tea_product_entry_name").append($("<td></td>")
																	   .append(entry.getName()+" ["+entry.ID+"]")
																	   .append($("<span></span>").append((entry.Stocked ? "" : "X")))
																	   .append($("<div></div>").addClass("tea_product_entry_type")
																	   		.append("&lt;"+entry.getType().toLowerCase()+"&gt;")))
					)
			.append($("<tr></tr>").append($("<td></td>").append(details)))
		;

        table.append($("<tr></tr>").addClass("tea_product_entry")
              .append($("<td></td>").addClass("tea_product_entry_pics").append(pics))
              .append($("<td></td>").append(main)))
        ;
    }
    $("#products_tab").append($("<div></div>").attr("id", "products_scroller").append(table));
    //console.log("Done adding products");
}

function loadExtras() {
	sortTeaJournal();
	sortTeaProducts();

    /*
	var exclusion_list = null;
	if (window.location.hostname == "localhost") {
		loadForms();
	} else {
		exclusion_list = ["TODO"];
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
                                              }) 
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