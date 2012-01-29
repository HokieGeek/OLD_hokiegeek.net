var filteredTabsHeight = 190;
var HG_Journal_Input_tabsObj = null;

function onTabToggle(from, to) {
	console.log("onTabToggle("+from+", "+to+")");

	var tabbed_prod_lists = ['list_creams', 'list_soaps', 'list_blades', 'list_strops'];

	// Actions to do based on the source tab
	switch (from) {
	case 0: // Shaving
		// unselect all tabbed product lists
		for (var i = tabbed_prod_lists.length-1; i >= 0; i--) {
			var list = document.getElementById(tabbed_prod_lists[i]);
			var list_classes = list.getAttribute("class");
			if (list_classes != null && list_classes.search("sel_prod_type_list") != -1) {
				list.setAttribute("class", 
								  list_classes.replace(/sel_prod_type_list/g, ""));
			}
		}

		break;
	
	default: break;
	}

	// Actions to do based on the target tab
	switch (to) {
	case 0: // Shaving
			// TODO: select tabbed lists based on selected labels
			// sel_prod_type_label, sel_prod_type_list
			for (var i = tabbed_prod_lists.length-1; i >= 0; i--) {
				var label = document.getElementById(tabbed_prod_lists[i]+"_label");
				var label_classes = label.getAttribute("class");
				if (label_classes != null && 
					label_classes.search("sel_prod_type_label") != -1) {
					var list = document.getElementById(tabbed_prod_lists[i]);
					var list_classes = list.getAttribute("class");
					if (list_classes != null && list_classes.length > 0) 
						list_classes += " ";
					else if (list_classes == null)
						list_classes = "";
					list.setAttribute("class", list_classes+"sel_prod_type_list");
				}
			}

	        var lastEntry = ShavingJournalEntries[ShavingJournalEntries.length-1];
            console.log("  >> LAST ENTRY: ", lastEntry);
	        // Blade vs. Strop
	        if (lastEntry.Blade == null) switchToStrop();
	        else switchToBlade();

    	    // Cream vs. Soap
    	    if (lastEntry.Soap == null) switchToCream();
	        else switchToSoap();

			// create the picture selection control
			if (pw_sel_obj == null) {
				pw_sel_obj = PicasaWeb_PicSelect(ShavingAlbum, 
												document.getElementById("pictures_select"),
												 null, 
												 true);
			}
	default:
			//tabsObj.IgnoreKeyboard = true; 
			//tabsObj.NestedTabs[3].IgnoreKeyboard = true; 
			break;
	}
}

function loadShavingForms() {
	// Journal entry form
	init_form("shaving_journal_form_date");
	loadUsedProducts();
	createJournalGradeScales();

	// Set the width for the tabbed spans
	var spans = document.getElementById('shaving_forms').getElementsByTagName('div');
	// Grab all spans
	for (var i = spans.length-1; i >= 0; i--) {
		var span_classes = spans[i].getAttribute('class');
		// Search for prod_type_lists class in each span
		if (span_classes != null && span_classes.search("prod_type_lists") != -1) {
			// Get its parent cell
			// Retrieve all selects
			var max_list_width = 0;
			var span_lists = spans[i].getElementsByTagName('select');
			for (var j = span_lists.length-1; j >= 0; j--) {
				//console.log("WIDTH1 for '", span_lists[j].id,"': ", span_lists[j].clientWidth);
				var width = span_lists[j].clientWidth;
				// Find max width of all selects
				// Set parent cell's width to max of selects
				if (width > max_list_width) {
					setStyle(spans[i], "width: "+width+"px !important;");
					max_list_width = width;
				}
			}
		}
	}
	
	// Review form
	init_form("shaving_review_form_date");
	loadReviewGrades("Razor", "shaving_review_grade_scales");
	var prodIDField = document.getElementById("shaving_review_entry_id");
	if (prodIDField != null) prodIDField.value = HG_getNextProductID(ShavingReviewedProducts);

}

function teaRating_rollover(widget, rating, enable) { 
	// console.log("teaRating_rollover(widget, ", rating, ", ", enable, ")");
 	var pic = "http://tea.hokiegeek.net/img/tea_cup"+(enable ? "" : "_greyed")+".png";
	var imgs = widget.find('img');
	// console.log("   > FOUND '", imgs.length,"' IMG OBJECTS");
	// for (img in imgs) {
	for (var ii = 0; ii < imgs.length; ii++) {
		if ((ii+1) <= rating) {
			// console.log("   IMG: ", imgs[ii]);
			$(imgs[ii]).attr('src', pic);
		}
	}
}

function teaRating_select(field, pos, rating) {
	console.log("teaRating_select(", field,", ", pos, ", ", rating, ")");
    // $('input[name="entry.3.single"]').attr("value", rating);
    $("#tea_journal_entry_rating").attr("value", rating);
}

function createTeaRatingWidget(storeField) {
	var widget = $("<span></span>");
	for (var i = 1; i <= 4; i++) {
		widget.append(
			$("<a></a>").attr("href", "javascript://")
						.attr("title", "I would rate this a '"+i+"'")
						.attr("rated", false)

						.attr("onclick", "$(this).attr('rated', !eval($(this).attr('rated'))); "+
										 "teaRating_select($('#"+storeField+"'), 0, "+i+")")
						.attr("onmouseover", "teaRating_rollover($(this.parentNode), "+i+", true)")
						.attr("onmouseout", "if (!eval($(this).attr('rated'))) teaRating_rollover($(this.parentNode), "+i+", false);")

						.append($("<img/>").width("40px").attr("src", "http://tea.hokiegeek.net/img/tea_cup_greyed.png"))
				);
						// .attr("onmouseover", "this.firstChild.setAttribute('src', 'http://tea.hokiegeek.net/img/tea_cup.png');")
						// .attr("onmouseout", "if (!eval($(this).attr('rated'))) this.firstChild.setAttribute('src', 'http://tea.hokiegeek.net/img/tea_cup_greyed.png');")
						//
						// .attr("onmouseover", "$(this).children('img').attr('src', 'http://tea.hokiegeek.net/img/tea_cup.png');")
						// .attr("onmouseout", "if (!eval($(this).attr('rated'))) $(':first-child').attr('src', 'http://tea.hokiegeek.net/img/tea_cup_greyed.png');")

			/*var g = grade_scale[i].toLowerCase();
			var l = document.createElement("a");
			l.setAttribute("href", "javascript://");
			l.setAttribute("title", grade_scale[i]);
			//l.setAttribute("onclick", this+".selectGrade("+i+")");
			//l.setAttribute("onclick", "GradeScaleControl_selectGrade("+this+", "+i+")");
			if (this.listeners.length > 0)
				l.setAttribute("onclick", "GradeScaleControl_selectGrade(this, "+i+"); "+this.listeners[0]+"()");
			else
				l.setAttribute("onclick", "GradeScaleControl_selectGrade(this, "+i+");");
			//l.setAttribute("onclick", "GradeScaleControl_selectGrade(this, "+i+")");
			l.setAttribute("onmouseover", "this.firstChild.setAttribute('src', 'http://shaving.hokiegeek.net/img/shave_grade_"+g+".png');");
			l.setAttribute("onmouseout", "if (document.getElementById('"+this.valueFieldID+"').value != '"+i+"') this.firstChild.setAttribute('src', 'http://shaving.hokiegeek.net/img/shave_grade_"+g+"_dark.png');");
			var gi = document.createElement("img");
			gi.setAttribute("src", "http://shaving.hokiegeek.net/img/shave_grade_"+g+"_dark.png");
			l.appendChild(gi);
			l.setAttribute("valueFieldID", this.valueFieldID);*/

	}

	return widget;
}

function selectTeaSession(selection) {
/*
    // Load the session stuff
    $("#tea_sessions").append($("<input />").attr("type", "radio")
                                            .attr("onclick", '$("#tea_session").attr("value", "")')
                                            .attr("checked", true)).append(" None");
    $("#tea_sessions").append($("<input />").attr("type", "radio")
                                                .attr("onclick", '$("#tea_session").attr("value", "")')).append(" New")
    if (tea.numSessions() > 0) {
        $("#tea_sessions").append($("<input />").attr("type", "radio")
                                                .attr("onclick", '$("#tea_session").attr("value", "")')).append(" Next");
    }
*/
    switch ($(selection).attr("value")) {
    case "NO_SESSION": console.log("  NO"); break;
    case "NEW_SESSION": console.log("  NEW"); break;
    case "NEXT_SESSION": console.log("  NEXT"); break;
    }
}

function selectTea(list) {
    //console.log("TODO: respond to tea selection: ", $("#tea_sessions").find('input[type="radio"]'));
    //$("#tea_sessions").find('input[type="radio"]')[0].attr("checked", "true");
	if (list.value == "_ADDNEW_") {
        addNewListItem(list);
    } else {
        var selected = HG_getProductByID(TeaProductEntries, list.value);
        var journal = selected.getJournalEntries();
        // var selected = TeaProductEntries[list.value];
        console.log("TEA: "+selected.getName());
        // TODO: session stuff
		var sessions_div = $("#tea_sessions");
		sessions_div.html("");
    	sessions_div.append($("<input />").attr("type", "radio")
                                          .attr("onclick", '$("#tea_session").attr("value", "")')
                                          .attr("checked", true)).append(" None");
    	var sessions = selected.getSessions();
        if (sessions.length > 0) {
			var lastSession = sessions[sessions.length-1];
			var delim = lastSession.delim;
			console.log("lastSession = ", lastSession, parseInt(lastSession.Session), (parseInt(lastSession.Session) + 1));
			var next = (parseInt(lastSession.Session) + 1);
			if (next < 10) next = "0"+next;	
			var nextSession = selected.ID+delim+next+delim+"A";
			next = String.fromCharCode(parseInt(lastSession.Instance.charCodeAt(0)) + 1);
			var sessionId = lastSession.Session;
			if (sessionId < 10) sessionId = "0"+sessionId;
			var nextInstance = selected.ID+delim+sessionId+delim+next;

			console.log(" LAST SESSION: ", lastSession.toString());
			console.log(" NEXT SESSION: ", nextSession);
			console.log("NEXT INSTANCE: ", nextInstance);

			sessions_div.append($("<input />").attr("type", "radio")
											  .attr("onclick", '$("#tea_session").attr("value", "'+nextSession+'")')
											  .attr("title", "'"+nextSession+"'")).append(" New")
			sessions_div.append($("<input />").attr("type", "radio")
											  .attr("onclick", '$("#tea_session").attr("value", "'+nextInstance+'")')
											  .attr("title", "'"+nextInstance+"'")).append(" Next");
		} else {
			sessions_div.append($("<input />").attr("type", "radio")
                                              .attr("onclick", '$("#tea_session").attr("value", "'+selected.ID+'_01_A")')
											  .attr("title", "'"+selected.ID+"_01_A'")).append(" New")
		}

		// TODO: most likely vessel
		// TODO: most likely steep time
        // TODO: most likely temperature
        // TODO: most likely fixins
    }
}

function loadTeaForms() {
	//// Journal entry form
	init_form("tea_journal_form_date", "tea_journal_form_time");

    TeaProductEntries.sort(function(a,b) {
        if (a.Name < b.Name) return 1;
        if (a.Name > b.Name) return -1;
        return 0;
    });

	// Load the teas
	for (var ii = TeaProductEntries.length-1; ii >= 0; ii--) {
        var tea = TeaProductEntries[ii];
        if (!tea.Stocked) {
            continue; // Ignore teas that aren't stocked, of course!
        }

        // var label = "["+tea.ID+"] "+tea.Name+", "+tea.Year+" "+tea.getFlush();
        var label = "[";
        if (parseInt(tea.ID) < 100) label += " "; 
        if (parseInt(tea.ID) < 10) label += " "; 
        label += tea.ID+"] "+tea.Name;
        if (tea.LeafGrade != undefined) label += " "+tea.LeafGrade;
        if (tea.Year != undefined) {
            label += ", "+tea.Year;
            if (tea.Flush != undefined)
                label += " "+tea.getFlush();
        }


		// addProductOption("list_teas", tea.ID, "["+tea.ID+"] "+tea.getName());
        // console.log(label);
		addProductOption("list_teas", tea.ID, label);
	}

    $("#tea_sessions").append($("<input />").attr("type", "radio")
                                            .attr("onclick", '$("#tea_session").attr("value", "")')
                                            .attr("checked", true)).append(" None");
    var sessions = tea.getSessions();
    if (sessions.length > 0) {
		var lastSession = sessions[sessions.length-1];
		var next = parseInt(lastSession.Session) + 1;
		if (next < 10) next = "0"+next;	
		var nextSession = lastSession.Tea+lastSession.delim+next+lastSession.delim+"A";
		next = String.fromCharCode(parseInt(v.charCodeAt(0)) + 1);
		var nextInstance = this.Tea+this.delim+this.Session+this.delim+next;

		console.log(" LAST SESSION: ", lastSession.toString());
		console.log(" NEXT SESSION: ", nextSession);
		console.log("NEXT INSTANCE: ", nextInstance);

    	$("#tea_sessions").append($("<input />").attr("type", "radio")
                                                .attr("onclick", '$("#tea_session").attr("value", "'+nextSession+'")')
												.attr("title", "'"+nextSession+"'")).append(" New")
        $("#tea_sessions").append($("<input />").attr("type", "radio")
                                                .attr("onclick", '$("#tea_session").attr("value", "'+nextInstance+'")')
												.attr("title", "'"+nextInstance+"'")).append(" Next");
    } else {
    	$("#tea_sessions").append($("<input />").attr("type", "radio")
                                                .attr("onclick", '$("#tea_session").attr("value", "'+tea.ID+'_01_A")')
												.attr("title", "'"+tea.ID+"_01_A'")).append(" New")
	}

    // Load the vessels
	
	var vessels_list = $("#list_vessels");
    for (var ii = 0; ii < TeaSteepingVessels.length; ii++) {
        vessels_list.append($("<option></option>").attr("value", ii)
                                                  .append(TeaSteepingVessels[ii]));
    }

	// Load the fixins
    var num_fixins_cols = 4;
    var fixins_table = $("#fixins_checkboxes");
    var fixins_row = $("<tr></td>");
	for (var ii = 0; ii < TeaFixins.length; ii++) {
        fixins_row.append($("<td></td>").append($("<input/>").attr("type", "checkbox")
                                                             .attr("value", ii))
                                        .append(TeaFixins[ii]).append($("<br />")));
                                                             //.attr("name", "entry.10.single")
        if (((ii % num_fixins_cols) == 2) || ii == TeaFixins.length-1) {
            fixins_table.append(fixins_row);
            fixins_row = $("<tr></td>");
        }
		// addProductOption("list_fixins", ii, TeaFixins[ii]);
	}
	
	// Load the ratings...
	//createTeaRatingWidget("tea_journal_rating_widget", "tea_journal_entry_rating");
	$("#tea_journal_rating_widget").append("<tr></tr>").append("<td></td>")
								   	.append(createTeaRatingWidget("tea_journal_entry_rating"));

	// ***** TEMP *****
	HG_Journal_Input_tabsObj.AddToggleListener(onTabToggle);
	HG_Journal_resizeTabs();
}

function loadForms() {
	hg_small_nav(); 

	HG_Journal_Input_tabsObj = new LibTabs("HG_Journal_Input_tabsObj", document.getElementById("hg_journal_input_tabs"), 
											1, LibTabs_Orientation.TOP, null);
    //console.log("Created tabs: ", HG_Journal_tabsObj, document.getElementById("hg_journal_tabs"));
	//HG_Journal_Input_tabsObj.HandleKeyboardInputs();

	// Listen for keypresses to perform some specific duties
	//AddOKDListener(HG_Journal_keyboardHandler);

    getShavingData(loadShavingForms);
	getTeaData(loadTeaForms);
	// getSpeakeasyData(loadSpeakeasyForms());
}
