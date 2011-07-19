var tabsObj = null;
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
    console.log("Done adding products");
}

function loadExtras() {
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
                                              document.getElementById("journal_tab"), 
                                              function() {
	                                            loadTeaJournal(0, "DESC", null);
                                              }),
                         new HG_Journals_View("TeaProductEntries", 
                                              document.getElementById("products_tab"), 
                                              function() {
	                                            loadTeaProducts(0, "DESC", "TYPE", null);
                                              }),

                        ], 
                        null);

	// Journal tab TODO: this needs to happen on each resize
	//var journal_lyr = document.getElementById('journal_scroller');
	//setStyle(journal_lyr, "height: "+parseInt(document.documentElement.clientHeight-110)+"px;");

	//HG_Journal_tabsObj.AddToggleListener(onTabToggle);
}

function HG_Journal_local_init() {
    getTeaData(loadExtras);
}
