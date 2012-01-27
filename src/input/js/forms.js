var shaving_journal_entry_url = "http://spreadsheets0.google.com/formResponse?formkey=dENEbllUbFdlTHg0WThDLTdqWXRLMWc6MQ";
var shaving_review_entry_url = "https://spreadsheets.google.com/formResponse?formkey=dEFMb0ZoVDdhYkJEcVo3czBJSEFRcGc6MQ";
var tea_journal_entry_url = "http://spreadsheets0.google.com/formResponse?formkey=dGdLc2JlYzYtYUppVnJaTDZxUko3aGc6MQ&amp"
//var tea_journal_entry_url = "https://docs.google.com/spreadsheet/formResponse?pli=1&amp;hl=en_US&amp;formkey=dGdLc2JlYzYtYUppVnJaTDZxUko3aGc6MQ&amp;ifq"
var tea_review_entry_url = "https://docs.google.com/spreadsheet/formResponse?hl=en_US&amp;formkey=dERyQ2tPdk5yc3ZoSmhudDhtcGMtbEE6MQ&amp;ifq"

/** Journal **/
function loadProductInJournalEntry(product) {
	// Retrieve the appropriate list
	console.log("loadProductInJournalEntry(): ", product);
	var type = product.Type.toLowerCase();
	if (type == "brush") type += "e";
	type += "s";
	var list = document.getElementById("list_"+type);

	// Create new option;
	var option = document.createElement('option');
	option.setAttribute('value', product.ID);
	option.setAttribute('selected', 'true');
	option.appendChild(document.createTextNode(product.getName()));

	// add to the very top
	list.insertBefore(option, list.getElementsByTagName('option')[0]);

}
function addNewListItem(list) { // This guy should switch to the review tab
	if (list.value != "_ADDNEW_") return;

	// Clear the form, JIC
	clearReviewForm();

	//
	var type = list.getAttribute("id").replace(/list_/, "");
	if (type == "brushes") type = type.replace(/es$/, "");
	type = type.replace(/s$/, "");
	
	startEntryReview(type);
}
function addNewItem(box) {
	var list = box.parentNode.getElementsByTagName('select')[0];
	var newItem = box.firstChild.value;
	var option = document.createElement('option');
	option.setAttribute('value', newItem);
	option.setAttribute('selected', 'true');
	option.appendChild(document.createTextNode(newItem));

	// add before 'N/A' or 'Add New Item...'
	var last = list.getElementsByTagName('optgroup')[0];
	list.insertBefore(option, last);

	box.parentNode.removeChild(box);
	setStyle(list, "visibility: visible; position: static;");
}
function removeNewItemBox(box) {
	var list = box.parentNode.getElementsByTagName('select')[0];
	list.getElementsByTagName("option")[0].setAttribute('selected', 'true');
	box.parentNode.removeChild(box);
	setStyle(list, "visibility: visible; position: static;");
}
function addProductOption(list_id, val, name) {
	// console.log("addProductOptions(", list_id, ", ", val, ", ", name, ")");
	var list = document.getElementById(list_id);
	if (list == null || val == undefined) {
		console.log("woah! Couldn't find '"+list_id+"'?:"+list);
		return;
	}

	var opt = document.createElement('option');
	opt.setAttribute('value', val);
	opt.appendChild(document.createTextNode(name));
	//opt.appendChild(document.createTextNode(val));
	var group = list.getElementsByTagName('optgroup')[0];
	list.insertBefore(opt, group);
	var list_opts = list.getElementsByTagName('option');
	if (list_opts.length <= 3)
		list.selectedIndex = 0;
	//list.sort();
}
function sortProductList(list_id) {
	var list = document.getElementById(list_id);
	if (list == null) {
		console.log(">> NOT Sorting: ", list_id);
		return;
	}
	//console.log("Sorting: ", list_id);

	// 1. Retrieve all of the options in this list into an array
	var options = [];
	var optsArray = list.getElementsByTagName("option");
	//console.log(" optsArray {"+optsArray.length+"}: ", optsArray);
	for (var i = optsArray.length-1; i >= 0; i--) {
		var prodName = optsArray[i].firstChild.nodeValue;
		if (prodName != "Add New Item..." && prodName != "N/A") {
			var prodID = optsArray[i].getAttribute("value");
			//if (list_id == "list_soaps")
				//console.log("Found: "+prodName+" ("+prodID+")");
			options.push({"name":prodName,"id":prodID});

			// 2. Delete them from the list
			list.removeChild(optsArray[i]);
		}
	}
	//console.log("   list[pre] = ", list);

	/*if (list_id == "list_soaps") {
		for (var i = 0; i < options.length; i++)
			console.log("   options{pre}["+i+"] = ", options[i].name);
	}*/
	// 3. Sort the array by the text node
	for (var i = 0; i < options.length+45; i++)
		options.sort(function(a,b) { return a.name < b.name });

	/*if (list_id == "list_soaps") {
		for (var i = 0; i < options.length; i++)
			console.log("   options{post}["+i+"] = ", options[i].name);
	}*/

	// 4. Add the options back into the list
	//var lastJournalEntry = ShavingJournalEntries[ShavingJournalEntries.length-1];
	for (var i = options.length-1; i >= 0; i--) {
		addProductOption(list_id, options[i].id, options[i].name);
	}
	//console.log("   list[post] = ", list);

	if (options != null)
		delete options;
}

function loadUsedProducts() {
	var razors = [];
	var blades = [];
	var strops = [];
	var brushes = [];
	var soaps = [];
	var creams = [];
	var preshaves = [];
	var aftershaves = [];
	var name = "";
	for (var i = ShavingReviewedProducts.length-1; i >= 0; i--) {
		var data = ShavingReviewedProducts[i];
		if (!data.inDen) continue; // TODO: make it a checkbox?

		//name = (data.getName != undefined) ? data.getName() : data;
		name = data.getName();
		//console.log(" USED PRODUCT: ", data, data.Type, name);
		switch (data.Type.toLowerCase()) {
		case 'razor': 
			addProductOption('list_razors', data.ID, name);
			razors.push(name); 
			break;
		case 'blade': 
			addProductOption('list_blades', data.ID, name);
			blades.push(name); 
			break;
		case 'strop': 
			addProductOption('list_strops', data.ID, name);
			strops.push(name); 
			break;
		case 'brush': 
			addProductOption('list_brushes', data.ID, name);
			brushes.push(name); 
			break;
		case 'soap': 
			addProductOption('list_soaps', data.ID, name);
			soaps.push(name); 
			break;
		case 'cream': 
			addProductOption('list_creams', data.ID, name);
			creams.push(name); 
			break;
		case 'preshave': 
			addProductOption('list_preshaves', data.ID, name);
			preshaves.push(name); 
			break;
		case 'aftershave': 
			addProductOption('list_aftershaves', data.ID, name);
			aftershaves.push(name); 
			break;
		}
	}

	// Now sort the lists
	sortProductList('list_razors');
	sortProductList('list_blades');
	sortProductList('list_strops');
	sortProductList('list_brushes');
	sortProductList('list_soaps');
	sortProductList('list_creams');
	sortProductList('list_preshaves');
	sortProductList('list_aftershaves');

	// Determine which to null (cream or soap) depending on last journal entry
	var toNA = [];
	var lastEntry = ShavingJournalEntries[ShavingJournalEntries.length-1];
	// Blade vs. Strop
	if (lastEntry.Blade == null) {
		toNA.push(document.getElementById('list_blades'));
		//switchToStrop();
	} else {
		toNA.push(document.getElementById('list_strops'));
		//switchToBlade();
	}

	// Cream vs. Soap
	if (lastEntry.Soap == null) {
		toNA.push(document.getElementById('list_soaps'));
		//switchToCream();
	} else {
		toNA.push(document.getElementById('list_creams'));
		//switchToSoap();
	}

	// Now null them out
	for (var i = toNA.length-1; i > 0; i--) 
		toNA[i].selectedIndex = toNA[i].getElementsByTagName("option").length-2;
}
function createJournalGradeScales() {
	var scales_start = 10;
	var tmp = new JournalEntryType(null);
	var scales_tbl = document.getElementById("shaving_journal_grade_scales");
	var row = null;
	var cell = null;
	for (var gt in tmp.Grades) {
		row = document.createElement('tr');
		// Label
		cell = document.createElement('td');
		cell.appendChild(document.createTextNode(gt+":"));
		row.appendChild(cell);
		// Scale
		cell = document.createElement('td');
		new GradeScaleControl(cell, "entry."+scales_start+".single");
		scales_start++;
		row.appendChild(cell);

		scales_tbl.appendChild(row);
	}
}
var submissionMessageInterval = null;
var submissionMessageLayer = null;
function submissionMessage(lyr) {
	submissionMessageLayer = document.createElement('span');
	submissionMessageLayer.setAttribute("id", "submission_message_lyr");
	submissionMessageLayer.innerHTML = "Sending..";
	lyr.appendChild(submissionMessageLayer);

	submissionMessageInterval = window.setInterval('submissionMessageLayer.innerHTML += "."', 1000);
}
function postShavingJournalEntry() {
	submissionMessage(document.getElementById('shaving_journal_submit').parentNode);

	postEntry(shaving_journal_entry_url, document.getElementById('shaving_journal_entry_form'));

	getShavingData();
	// When new data has been retrieved, refresh the journal view and switch to it
	loadDataWhenAvailable(function() {
							loadJournal(0, "DESC", null);
							tabsObj.ToggleTab(0);	
							toggleEntryDetails(document.getElementById('journal').getElementsByTagName('tr')[1], true);
							clearJournalForm();
									 });
}
function clearJournalForm() {
	var shaving_journal_form = document.getElementById("shaving_journal_entry_form");
	clearForm(shaving_journal_form);
	init_form("shaving_journal_form_date");
	// TODO: delete the grades
	//createJournalGradeScales();
}

/** Reviews **/
//var shaving_review_entry_url = "https://spreadsheets.google.com/formResponse?formkey=dHJEQ1JweDcxTTRZOUowZWlsSXI4NFE6MA&ifq";
var pics_list_hidden = null;
var shaving_review_pics_view = null;
var pw_sel_obj = null;
function clearPictures() {
	if (pics_list_hidden == null) pics_list_hidden = document.getElementById('picture_list');
	if (shaving_review_pics_view == null) shaving_review_pics_view = document.getElementById('pictures_view');
	pics_list_hidden.value = "";
	shaving_review_pics_view.innerHTML = "";
}
function addReviewPicture(pics) {
	console.log("Adding pic: ", pics.value);
	if (pics_list_hidden == null) pics_list_hidden = document.getElementById('picture_list');
	if (shaving_review_pics_view == null) shaving_review_pics_view = document.getElementById('pictures_view');

	pics_list_hidden.value += "pics/"+pics.value+";";
	var img = document.createElement('img');
	img.setAttribute('src', "pics/"+pics.value);
	shaving_review_pics_view.appendChild(img);
}
var shaving_review_product_type = null;
var shaving_review_grades_input = "hidden_shaving_review_grades";
var hidden_shaving_review_grades = null;
function loadReviewGrades(type, elem) {
	var scales_tbl = document.getElementById(elem);
	if (hidden_shaving_review_grades == null) 
		hidden_shaving_review_grades = document.getElementById(shaving_review_grades_input);
	scales_tbl.innerHTML = "";
	hidden_shaving_review_grades.setAttribute("value", "");

	var row = null;
	var cell = null;
	var grades = PRODUCT_GRADES[PRODUCT_CATEGORIES.indexOf(type.toLowerCase())];
	//console.log("GRADES: ", grades);
	for (var i = 0; i < grades.length; i++) {
		row = document.createElement('tr');
		// Label
		cell = document.createElement('td');
		cell.appendChild(document.createTextNode(grades[i]+":"));
		row.appendChild(cell);
		// Scale
		cell = document.createElement('td');
		//var gsc = new GradeScaleControl(cell, "grade_"+grades[i].toLowerCase(), null, compileGrades);
		var gsc = new GradeScaleControl(cell, "grade_"+grades[i].toLowerCase(), null, "compileGrades");
		row.appendChild(cell);

		scales_tbl.appendChild(row);
	}
}
function compileGrades() {
	if (hidden_shaving_review_grades == null) 
		hidden_shaving_review_grades = document.getElementById(shaving_review_grades_input);
	if (shaving_review_product_type == null) {
		var	type_obj = document.getElementById('shaving_review_product_type');
		if (type_obj != null)
			shaving_review_product_type = type_obj.value;
	}
	//console.log("Compiling grades for type: ", shaving_review_product_type);
	var grade_list = PRODUCT_GRADES[PRODUCT_CATEGORIES.indexOf(shaving_review_product_type.toLowerCase())]
	var grades = "";
	for (var i = 0; i < grade_list.length; i++) {
		if (i != 0) grades += ";";
		var grade = document.getElementById("grade_"+grade_list[i].toLowerCase());
		var grade_val = grade.getAttribute("value");
		if (grade_val == null)
			grades += "0";
		else			
			grades += grade_val;
	}
	hidden_shaving_review_grades.setAttribute("value", grades);
}
var fromJournalEntry = false;
function startEntryReview(type) {
	var type_list = document.getElementById("shaving_review_product_type");
	type_list.selectedIndex = PRODUCT_CATEGORIES.indexOf(type.toLowerCase());
	loadReviewGrades(type, 'shaving_review_grade_scales')

	fromJournalEntry = true;

	tabsObj.NestedTabs[3].ToggleTab(1);	
}
function postReviewEntry() { 
	submissionMessage(document.getElementById('shaving_review_submit').parentNode);

	// Generate a ProductType object
	var entry = new ProductType(null);
	entry.ID = document.getElementById("shaving_review_entry_id").value;
	entry.Type = document.getElementById("shaving_review_product_type").value;
	entry.Vendor = document.getElementById("shaving_review_product_vendor").value;
	entry.Name = document.getElementById("shaving_review_product_name").value;
	entry.Size = document.getElementById("shaving_review_product_size").value;
	entry.Color = document.getElementById("shaving_review_product_color").value;
	entry.Scent = document.getElementById("shaving_review_product_scent").value;

	// do the pictures
	var pics_sel = document.getElementById("pictures_select");
	if (pics_sel != null && pw_sel_obj != null) {
		if (pics_list_hidden == null) pics_list_hidden = document.getElementById('picture_list');
		var pics = pw_sel_obj.getSelected();
		for (var i = 0; i < pics.length; i++) {
			pics_list_hidden.value += pics[i].name+";";
		}
	}
	compileGrades();
	postEntry(shaving_review_entry_url, document.getElementById('shaving_review_entry_form'));

	if (fromJournalEntry) {
		fromJournalEntry = false;
		loadProductInJournalEntry(entry);

		// Switch to the Journal Entry form and return the product review object
		tabsObj.ToggleTab(3);	
		tabsObj.NestedTabs[3].ToggleTab(0);	
	} else {
		getProductReviews();
		// Switch to reviews tab and the appropriate category
		loadDataWhenAvailable(function() {
									var type = entry.Type;
									if (type == "Brush") type += "e";
									type += "s";
									var type_tab = 0;
									var tab_count = 0;
									var shaving_review_tabs = document.getElementById('shaving_review_tabs').getElementsByTagName('span');
									for (var i = 0; i < shaving_review_tabs.length; i++) {
										if (shaving_review_tabs[i].getAttribute("class") == "tab_name") {
											//console.log("FIRST CHILD: ", shaving_review_tabs[i].firstChild.nodeValue, type);
											tab_count++;
											if (shaving_review_tabs[i].firstChild.nodeValue == type) {
											//if (eval(shaving_review_tabs[i].firstChild).toLowerCase() == entry.Type.toLowerCase()) {
												type_tab = tab_count-1;
												//console.log("  ^^w00t!^^: ", type_tab);
												break;
											}
										}
									}
									tabsObj.ToggleTab(1);	
									tabsObj.NestedTabs[1].ToggleTab(type_tab);
									refreshReviews();
									clearReviewForm();
										});
	}
}
function clearReviewForm() {
	console.log(">> Clearing Review Form");
	var shaving_review_form = document.getElementById("shaving_review_entry_form");
	clearForm(shaving_review_form);
	init_form("shaving_review_form_date");
	// TODO: delete the grades
	clearPictures();
	//HG_getNextProductID(ShavingReviewedProducts);
}

/** Common **/
function switchToSoap() {
	switchProductTab(['list_soaps_label', 'list_soaps'], ['list_creams_label', 'list_creams']);
    var list = document.getElementById('list_soaps');
    list.selectedIndex = 0;
}
function switchToCream() {
	switchProductTab(['list_creams_label', 'list_creams'], ['list_soaps_label', 'list_soaps']);
    var list = document.getElementById('list_creams');
    list.selectedIndex = 0;
}
function switchToStrop() {
	switchProductTab(['list_strops_label', 'list_strops'], ['list_blades_label', 'list_blades']);
    var list = document.getElementById('list_strops');
    list.selectedIndex = 0;
}
function switchToBlade() {
	switchProductTab(['list_blades_label', 'list_blades'], ['list_strops_label', 'list_strops']);
    var list = document.getElementById('list_blades');
    list.selectedIndex = 0;
}
function switchProductTab(source, target) {
	var src_lbl = document.getElementById(source[0]);
	var src_lst = document.getElementById(source[1]);
	var src_lbl_classes = src_lbl.getAttribute("class");
	var src_lst_classes = src_lst.getAttribute("class");
	console.log("SOURCE: ", src_lbl_classes);
	src_lbl.setAttribute("class", src_lbl_classes+" sel_prod_type_label");
	src_lst.setAttribute("class", src_lst_classes+" sel_prod_type_list");
	// Select N/A as the option
	src_lst.selectedIndex = src_lst.getElementsByTagName("option").length-2;

	var tgt_lbl = document.getElementById(target[0]);
	var tgt_lst = document.getElementById(target[1]);
	var tgt_lbl_classes = tgt_lbl.getAttribute("class");
	var tgt_lst_classes = tgt_lst.getAttribute("class");
	console.log("TARGET: ", tgt_lbl_classes);
	if (tgt_lbl_classes != null && tgt_lbl_classes.length > 0)
		tgt_lbl.setAttribute("class", tgt_lbl_classes.replace(/ *sel_prod_type_label/g, ""));
	if (tgt_lst_classes != null && tgt_lst_classes.length > 0)
		tgt_lst.setAttribute("class", tgt_lst_classes.replace(/ *sel_prod_type_list/g, ""));

	//console.log("SWITCH TARGET LIST: ", tgt_lst);
}
function GradeScaleControl (parent_elem, value_field_id, label, listener) {
	this.gradeScale = null;
	this.valueFieldID = value_field_id;
	this.valueField = null;
	this.scaleLabel = (label == undefined) ? null : label;
	this.listeners = [];
	if (listener != null)
		this.listeners.push(listener);

	this.loadGradeScale = function() {

		this.gradeScale = document.createElement('span');
		this.gradeScale.setAttribute("class", "grade_scale");
		setStyle(this.gradeScale, "vertical-align: top;");

		if (this.scaleLabel != null) {
			var label = document.createElement('span');
			label.appendChild(document.createTextNode(this.scaleLabel+": "));
			setStyle(label, "vertical-align: top; margin-right: 10px;");
			this.gradeScale.appendChild(label);
		}

		// Add the actual scale
		var scale = document.createElement('span');
		for (var i = 0; i < grade_scale.length; i++) {
			var g = grade_scale[i].toLowerCase();
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
			l.setAttribute("valueFieldID", this.valueFieldID);
			scale.appendChild(l);
		}
		this.gradeScale.appendChild(scale);

		// Add the hidden input
		var hidden = document.createElement('input');
		hidden.setAttribute("type", "hidden");
		hidden.setAttribute("name", this.valueFieldID);
		hidden.setAttribute("id", this.valueFieldID);
		this.gradeScale.appendChild(hidden);

		// Now add the scale
		parent_elem.appendChild(this.gradeScale);
	}


	this.loadGradeScale();
}
function GradeScaleControl_selectGrade(scaleElem, grade) {
		//console.log("selectGrade("+grade+")");
		//console.log("  OLD: ", old_grade);
		// Update the hidden input
		var fieldID = scaleElem.getAttribute("valueFieldID");
		var valueField = document.getElementById(fieldID);
		var old_grade = -1;
		if (valueField.value != null && valueField.value.length > 0)
			old_grade = valueField.value;
		valueField.value = grade;

		// Reset any previously set grades
		if (old_grade > -1) {
			var imgs = scaleElem.parentNode.getElementsByTagName('img');
			imgs[old_grade].setAttribute("src", "http://shaving.hokiegeek.net/img/shave_grade_"+grade_scale[old_grade].toLowerCase()+"_dark.png");
		}
	}
/*function GradeScaleControl_selectGrade(scaleElem, grade) {
		console.log("selectGrade(",scaleElem, grade+")");
		var obj = scaleElem.getAttribute("scaleobj");
		// Now update the hidden input
		//if (obj.valueField == null)
			obj.valueField = document.getElementById(obj.valueFieldID);

		var old_grade = obj.valueField.value;
		obj.valueField.value = grade_scale[grade];

		// Reset any previously set grades
		if (old_grade != null && old_grade.length > 0) {
			var i = 0; // 'Meh'
			switch (old_grade) {
				case 'DFS': i = 1; break;
				case 'CCS': i = 2; break;
				case 'BBS': i = 3; break;
			}
			if (obj.gradeScale == null) 
				obj.gradeScale = document.getElementById(obj.gradeScaleID);
			var imgs = gradeScale.getElementsByTagName('img');
			imgs[i].setAttribute("src", "http://shaving.hokiegeek.net/img/shave_grade_"+old_grade.toLowerCase()+"_dark.png");
		}
	}*/

function init_form(form_date, form_time) {
    // console.log("init_form(", form_date,", ", form_time, ")");
	// Add today's date to form
	var today = new Date();
	document.getElementById(form_date).value = (today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear();
    if (form_time != null && form_time != undefined) {
        var h=parseInt(today.getHours()); if (h < 10) h = "0"+h;
        var m=parseInt(today.getMinutes()); if (m < 10) m = "0"+m;
        // console.log("TIME: ", today.getHours(),today.getMinutes(), h+""+m);
        $("#"+form_time).attr("value", h+""+m);
    }
}

function postEntry(url, form) {
	var params = [];
	var elem_types = ["select", "textarea", "input"];
	for (var t = 0; t < elem_types.length; t++) {
		var type = elem_types[t];
		var elems = form.getElementsByTagName(type);
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			switch (type) {
			case "input":
				switch (elem.getAttribute("type")) {
				case "radio": 
					if (!elem.checked)
						continue;
					break;
				case "submit": 
					continue; 
					break;
				}
				break;
			default: break;
			}
			var name = elem.getAttribute("name");
            if (name == null || name == "null") continue;
			name = escape(name);
			//var val = escape(encodeURI(elem.value.replace(/&/g, "\\\&").replace(/"/g, "\\\"")));
			//var val = escape(encodeURI(elem.value.replace(/"/g, "\\\"")));
			var val = elem.value.replace(/"/g, "\\\"");
			params.push(name+"="+val);
		}
	}

	// Now send the request
	console.log("sendData(", url,",", params, ")");
	(new libHTTPRequest()).sendData(url, params);
}
function clearForm(form) {
	var elem_types = ["select", "textarea", "input"];
	for (var t = 0; t < elem_types.length; t++) {
		var type = elem_types[t];
		var elems = form.getElementsByTagName(type);
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			switch (type) {
			case "textarea": elem.value = ""; break;
			case "select": elem.selectedIndex = 0; break;
			case "input":
				switch (elem.getAttribute("type")) {
				case "text": elem.value = ""; break;
                case "checkbox":
				case "radio": elem.checked = false; break;
				case "submit": continue; break;
				}
				break;
			default: break;
			}
		}
	}

	// Remove submission message
	if (submissionMessageLayer != null) {
		clearInterval(submissionMessageInterval);
		submissionMessageLayer.parentNode.removeChild(submissionMessageLayer);
	}
}

/** TEA */
function postTeaJournalEntry() {
    var fixins = "";
    var fixins_boxes = $("#fixins_checkboxes").find(':checked')
    for (var i = 0; i < fixins_boxes.length; i++) {
        if (i != 0) fixins += ";";
        fixins += $(fixins_boxes[i]).attr("value");
    }
    $("#tea_fixins").attr("value", fixins);
    
    // console.log("SESSION OPTIONS: ", $("#tea_sessions").find('input[type="radio"]'));
    // console.log("SESSION SELECTED: ", $("#tea_sessions").find(':checked'));

	submissionMessage(document.getElementById('tea_journal_submit').parentNode);

	postEntry(tea_journal_entry_url, document.getElementById('tea_journal_entry_form'));

	clearForm(document.getElementById("tea_journal_entry_form"));
	init_form("tea_journal_form_date", "tea_journal_form_time");
/*
	getTeaData();
	// When new data has been retrieved, refresh the journal view and switch to it
	loadDataWhenAvailable(function() {
							loadJournal(0, "DESC", null);
							tabsObj.ToggleTab(0);	
							toggleEntryDetails(document.getElementById('journal').getElementsByTagName('tr')[1], true);
							clearJournalForm();
									 });
*/
}
