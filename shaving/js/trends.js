var hofLyr = null;
var metricCharts = [ { "name": "Soap vs. Cream",
				  	   "type": "p3",
					   "size": "320x130",
					   "color": "eee686",
					   "values": [{ "label": "Soaps", "value": 0 },
								  { "label": "Creams", "value": 0 }]
					 },
					 { "name": "Straight vs. DE",
				  	   "type": "p3",
					   "size": "320x130",
					   "color": "FF0C0C",
					   "values": [{ "label": "DE", "value": 0 },
								  { "label": "Straight", "value": 0 }]
					 },
					 { "name": "Average grade per week day",
					   "type": "bvs",
					   "size": "320x130",
					   "color": "4d89f9",
					   "values": [{ "label": "Sun", "value": 0},
								  { "label": "Mon", "value": 0},
						   		  { "label": "Tue", "value": 0},
								  { "label": "Wed", "value": 0},
								  { "label": "Thu", "value": 0},
								  { "label": "Fri", "value": 0},
								  { "label": "Sat", "value": 0}]
					 },
					 { "name": "Brush Usage",
					   "type": "bhs",
					   "size": "620x180",
					   "color": "3879D9",
					   "values": []
					 },
					 { "name": "Soap Usage",
					   "type": "bhs",
					   "size": "620x480",
					   "color": "3879D9",
					   "values": []
					 },
					 { "name": "Cream Usage",
					   "type": "bhs",
					   "size": "620x160",
					   "color": "3879D9",
					   "values": []
					 },
					 { "name": "Vendor Stats",
				  	   "type": "p3",
					   "size": "320x130",
					   "color": "eee686",
					   "values": [{ "label": "Soaps", "value": 0 },
								  { "label": "Creams", "value": 0 }]
					 }
			  	   ];
function createChart(data) {
	//console.log("createChart():", data);
	var charts_root = "http://www.google.com/chart?";
	var chart = document.createElement("img");
	var img_src = charts_root+"chtt="+data.name.replace(/\s/g, "+")+"&"+
				  "cht="+data.type+"&chs="+data.size+"&";
	var values = "";
	var colors = data.color;
	switch (data.type) {
	case "p":
	case "p3": {
		var labels = "";
		for (var j = 0; j < data.values.length; j++) {
			var val = data.values[j];
			if (j !== 0) {
				labels += "|";
				values += ",";
			}
			labels += val.label;
			var evaluated = eval(val.value);
			values += evaluated;
		}
		img_src += "chl="+labels+"&";
		}
		break;
	case "bvs": 
	case "bhs": { // Bar chart specific	
    	img_src += "chbh=24,6&chxt=x,y&";
		img_src += "chxs=0,000000,12,0,lt|1,000000,12,1,lt&";
	 	var labels = "";
		var min_value = 0;
		var max_value = 0;
		for (var j = 0; j < data.values.length; j++) {
			var val = data.values[j];
			if (j !== 0) {
				labels += "|";
				values += ",";
			}
			labels += val.label;
			var evaluated = eval(val.value);
			values += evaluated;
			if (evaluated < min_value) min_value = evaluated;
			if (evaluated > max_value) max_value = evaluated;
		}
		var scale = "";
		//console.log("MIN: ", min_value, "MAX: ", max_value);
		var skip_tics = (max_value - min_value > 5);
		for (var k = min_value; k <= max_value; k++) {
			if (skip_tics && (k % 2) != 0 && (k > min_value) && (k < max_value))
				continue;
			scale += k+"|";
		}
		switch (data.type) {
		case "bvs":
			img_src += "&chxl=0:|"+labels+"|1:|"+scale; break;
		case "bhs":
			// flip the labels
			var labels_flipped = "";
			var labels_boom = labels.split('|');
			for (var i = labels_boom.length-1; i >= 0; i--) {
				labels_flipped += labels_boom[i];
				if (i != 0)
					labels_flipped += "|";
			}
			img_src += "&chxl=0:|"+scale+"|1:|"+labels_flipped; break;
		}
		img_src += "&chds="+min_value+","+max_value+"&chm=N,000000,0,-1,11&";
		}
	}
	img_src += "chco&="+colors+"&chd=t:"+values;
	//console.log("CHART: ", img_src);
	chart.setAttribute("src", img_src);
	return chart;
}
function loadTrends() {
	loadHOF();
	loadCharts();
}
function loadCharts() {
	var chartsLyr = document.getElementById("charts");

	var soapcream = metricCharts[0];
	var str8de = metricCharts[1];
	var weekdaygrades = metricCharts[2];
	var brushusage = metricCharts[3];
	var soapusage = metricCharts[4];
	var creamusage = metricCharts[5];
	var vendorstats = metricCharts[6];

	var brushes = {};
	var soaps = {};
	var creams = {};
	var numSoap = 0;
	var numCream = 0;
	var numEntries = 0;
	var weekday_counts = [0,0,0,0,0,0,0];
	var str8deCounts = { "straight": 0, "de": 0 }
	for (var i = ShavingJournalEntries.length-1; i >= 0; i--) {
		var je = ShavingJournalEntries[i];
		numEntries++;
		//console.log("ENTRY: ", je);
		
		// Soap vs. Cream
		if (je.Soap != null) {
			// TODO: keep track of the count per product
            var soap = (je.Soap.getName != undefined) ? je.Soap.getName() : je.Soap;
			if (soap != null && soap.search(/sample/i) == -1) {
				if (soaps.length < 0 || soaps[soap] == null) {
					soaps[soap] = 1;
				} else if (soaps[soap] != null) {
					soaps[soap]++;
				}
			}
			numSoap++;
		}
		if (je.Cream != null) {
			// TODO: keep track of the count per product
			numCream++;
		}

		// Straight vs. DE
		if (je.Razor.getName().search(/straight/i) != -1)
			str8de.values[1].value++; // Straight
		else
			str8de.values[0].value++; // DE

		// Grade per weekday
		weekdaygrades.values[je.Date.getDay()].value += eval(grade_scale.indexOf(je.Grade));
		weekday_counts[je.Date.getDay()]++;

		// Brush usage
		// count the number of uses every brush gets used.
        var brush = (je.Brush != null) ? je.Brush.getName() : null;
		if (brush != null) {
			if (brushes.length < 0 || brushes[brush] == null) {
				brushes[brush] = 1;
			} else if (brushes[brush] != null) {
				brushes[brush]++;
			}
		}
	}

	// Soap vs. Cream
	soapcream.values[0].value = numSoap;
	soapcream.values[0].label += " ["+Math.round((numSoap/numEntries)*100)+"%]";
	soapcream.values[1].value = numCream;
	soapcream.values[1].label += " ["+Math.round((numCream/numEntries)*100)+"%]";
	chartsLyr.appendChild(createChart(soapcream));

	// Straight vs. DE
	str8de.values[0].label += " ["+Math.round((str8de.values[0].value/numEntries)*100)+"%]";
	str8de.values[1].label += " ["+Math.round((str8de.values[1].value/numEntries)*100)+"%]";
	chartsLyr.appendChild(createChart(str8de));

	// Grade per weekday
	for (var i = weekdaygrades.values.length-1; i >= 0; i--) {
		//console.log(weekdays_short[i]+": ", weekdaygrades.values[i].value);
		weekdaygrades.values[i].value = Math.ceil(weekdaygrades.values[i].value / weekday_counts[i]);
		//weekdaygrades.values[i].value /= weekday_counts[i];
	}
	chartsLyr.appendChild(createChart(weekdaygrades));

	// Brush Usage	
	for (var b in brushes) 
		brushusage.values.push({"label": b, "value": brushes[b]});
	chartsLyr.appendChild(createChart(brushusage));

	// Soap Usage
	for (var s in soaps) 
		soapusage.values.push({"label": s, "value": soaps[s]});
	chartsLyr.appendChild(createChart(soapusage));
}

/* Combo HOF */
function _createPropertyRow(prop, c) {
	var p = c[prop.replace(/(\/|-|\s)/, "")];
	if (p == null || p.length <= 0 || p == "N/A")
		return document.createTextNode(' ');

	var row = document.createElement('tr');
	var cell = document.createElement('td');
	cell.appendChild(document.createTextNode(prop+":"));
	row.appendChild(cell);
	cell = document.createElement('td');
    cell.appendChild(document.createTextNode(((p.getName != undefined) ? p.getName() : p)));
	row.appendChild(cell);
	return row;
}
function _createPropertyRow3(prop, c, left) {
	var p = c[prop.replace(/(\/|-|\s)/, "")];
	if (p == null || p.length <= 0 || p == "N/A")
		return document.createTextNode(' ');

	var row = document.createElement('tr');
	var cell = document.createElement('td');
	setStyle(cell, "text-align: "+((left) ? "left" : "right"));

	var img = document.createElement('img');
		console.log(p);
	if (p.Pictures)
		img.setAttribute("src", p.Pictures[0]);
	else
		img.setAttribute("src", "img/shave_grade_meh.png");
	setStyle(img, "width: 80px;");

	var name = document.createElement('span');
	setStyle(name, "margin-top: 10px; vertical-align: top;");
    cell.appendChild(document.createTextNode(((p.getName != undefined) ? p.getName() : p)));

	if (left) {
		cell.appendChild(img);
		cell.appendChild(name);
	} else {
		cell.appendChild(name);
		cell.appendChild(img);
	}

	row.appendChild(cell);
	return row;
}
function _createPropertyRow_new(prop, c, left) {
	var p = c[prop.replace(/(\/|-|\s)/, "")];
	if (p == null || p.length <= 0 || p == "N/A")
		return document.createTextNode(' ');

	var row = document.createElement('div');
	var align = ((left) ? "left" : "right");
	setStyle(row, "text-align: "+align+"; float: "+align+";");

	var img = document.createElement('img');
	if (p.Pictures)
		img.setAttribute("src", p.Pictures[0]);
	setStyle(img, "width: 120px;");

	var name = document.createElement('span');
	setStyle(name, "margin-top: 10px; vertical-align: "+((left) ? "top" : "bottom")+";");
    cell.appendChild(document.createTextNode(((p.getName != undefined) ? p.getName() : p)));

	if (left) {
		row.appendChild(img);
		row.appendChild(name);
	} else {
		row.appendChild(name);
		row.appendChild(img);
	}

	return row;
}
function loadHOF() {
//function loadHOF(sort_field, sort_dir, filter) {
	if (hofLyr == null) hofLyr = document.getElementById("combo_hof");
	sortShavingCombos();
	hofLyr.innerHTML = "";
	var comboDiv = null;
	var tbl = null;
	var row = null;
	var cell = null;
	var average_grade = getAverageComboGrade();
	var min_num_uses = 3;
	
	for (var i = ShavingCombos.length-1; i >= 0; i--) {
		var c = ShavingCombos[i];

 		// Don't want to display anything else
		if (c.Dates.length < min_num_uses || c.Grade <= average_grade) continue;

		comboDiv = document.createElement('table');
		//comboDiv.appendChild(document.createTextNode(i));
		comboDiv.appendChild(_createPropertyRow("Razor", c));
		if (c.Blade != null)
			comboDiv.appendChild(_createPropertyRow("Blade", c));
		else
			comboDiv.appendChild(_createPropertyRow("Strop", c));
		comboDiv.appendChild(_createPropertyRow("Brush", c));
		if (c.Soap != null)
			comboDiv.appendChild(_createPropertyRow("Soap", c));
		else
			comboDiv.appendChild(_createPropertyRow("Cream", c));
		//comboDiv.appendChild(_createPropertyRow("Preshave", c));
		//comboDiv.appendChild(_createPropertyRow("Aftershave", c));
		//comboDiv.appendChild(_createPropertyRow("NumPasses", c));
		//comboDiv.appendChild(_createPropertyRow("Dates", c));
		//comboDiv.appendChild(_createPropertyRow("Grades", c));
		//comboDiv.appendChild(document.createTextNode("GRADE: "+c.Grade));

		/*
		var grades_row = document.createElement('tr');
		var grades_cell = document.createElement('td');
		grades_row.appendChild(grades_cell);
		grades_cell = document.createElement('td');
		for (var g = 0; g < c.Grades.length; g++) {
			var img = document.createElement('img');
			img.setAttribute("src", "img/shave_grade_"+c.Grades[g].toLowerCase()+".png");
			img.setAttribute("title", c.Dates[g]+": "+c.Grades[g]);
			grades_cell.appendChild(img);
		}
		grades_row.appendChild(grades_cell);
		comboDiv.appendChild(grades_row);
		*/

		// Now add the click handler
		var filter = "";
		for (var j = c.Dates.length-1; j >= 0; j--) {
			filter += "Date: "+HG_formatDate(c.Dates[j])+"";
			if (j != 0) filter += " || ";
		}
		comboDiv.setAttribute('onclick', "tabsObj.ToggleTab(0); filterData(\""+filter+"\");");
		comboDiv.setAttribute('title', "View journal entries for this combo");

		// Now add the damn thing
		hofLyr.appendChild(comboDiv);
	}
}
function getAverageComboGrade()  {
	var sum = 0;
	for (var i = ShavingCombos.length-1; i >= 0; i--) 
		sum += ShavingCombos[i].Grade;
	return Math.floor(sum/ShavingCombos.length);
}
