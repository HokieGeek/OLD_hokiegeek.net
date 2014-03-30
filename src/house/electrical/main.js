var details_lyr = null;
var images_lyr = null;
var floors_lyr = null;
var legend_img = null;
var panelHighlight = null;

var NUM_CIRCUITS_PER_COLUMN = 5;
var COLUMN_WIDTH = "255px"
var circuits_per_plan; 
var stacks = [];

var panel_col_1_width = 90;
var panel_col_1_x = 0;
var panel_col_2_width = 95;
var panel_col_2_x = 108;
var panel_y_start = 60;
var panel_row_height = 16;

function displayDetails(circuit) {
/*
 * Retrieve the table
 * Grab last td
 * if (num of spans in td is >=NUM_CIRCUITS_PER_COLUMN)
 *        create a new div
 * add new circuit to last div
 */
     //console.log("displayDetails("+circuit+")");
     if (circuit_data == undefined) return;
    if (details_lyr == null)
        details_lyr = $('#electrical_circuit_details');

    var tbl = details_lyr.getElementsByTagName('table')[0];
    if (details_lyr.innerHTML == "" || !tbl) {
        tbl = document.createElement("table");
        setStyle(tbl, "border: none; padding: 0px; margin: 0px");
        tbl.appendChild(document.createElement("tr"));
        /*
        tbl = $('<table></table>').css("border", "none")
                                  .css("padding", "0px")
                                  .css("margin", "0px")
                                  .append($('<tr></tr>'));
        //details_lyr.append(tbl);
        */
        details_lyr.appendChild(tbl);
    }
    tbl = tbl.firstChild;
    var last = tbl.lastChild;
    if (last == null || last.getElementsByTagName('span') == null 
                     || last.getElementsByTagName('span').length >= NUM_CIRCUITS_PER_COLUMN) {
        // Create a new td and make that the last one
        var new_td = document.createElement('td');
        setStyle(new_td, "border: none; vertical-align: top;");
        //var new_td = $('<td></td>').css("border", "none")
        //                           .css("vertical-align: top");
        tbl.appendChild(new_td);
        last = new_td;
    }

    // Now generate the details and add them to the TD
    var circuit_color = circuit_data[circuit][1];
    var circuit_span = document.createElement('span');
    circuit_span.setAttribute('class', 'circuitDetails');
    circuit_span.setAttribute('onmouseover', "highlightPanel('"+circuit+"')");
    setStyle(circuit_span, "color: "+circuit_color+";");
    var circuit_name_link = document.createElement('a');
    circuit_name_link.setAttribute('href', 'javascript://');
    circuit_name_link.setAttribute('onclick', "clearDisplay(); displayCircuit('"+circuit+"');" );
    setStyle(circuit_name_link, "color: "+circuit_color+"; font-weight: bold;");
    circuit_name_link.appendChild(document.createTextNode(circuit));
    circuit_span.appendChild(circuit_name_link);
    circuit_span.appendChild(document.createTextNode(" ("));
    for (var i = 0; i < circuit_data[circuit][2].length; i++) {
        var floor_name_link = document.createElement('a');
        floor_name_link.setAttribute('class', 'floor_name');
        floor_name_link.setAttribute('href', 'javascript://');
        floor_name_link.setAttribute('onclick', "clearDisplay(); displayFloor('"+circuit_data[circuit][2][i]+"')");
        setStyle(floor_name_link, "color: "+circuit_color+";");
        floor_name_link.appendChild(document.createTextNode(floorplans[circuit_data[circuit][2][i]][2]));
        circuit_span.appendChild(floor_name_link);
        if (i != circuit_data[circuit][2].length-1) 
            circuit_span.appendChild(document.createTextNode(", "));
    }
    circuit_span.appendChild(document.createTextNode(")"));
    circuit_span.appendChild(document.createElement('br'));
    var details_dom = textToDOM(circuit_data[circuit][0]);
    for (var i = 0, len = details_dom.length; i < len; i++)
        circuit_span.appendChild(details_dom[i]);
    last.appendChild(circuit_span);
}

function displayCircuit(circuit, floor) {
    if (circuit == "contains" || circuit == "indexOf") {
        //console.log("WTF: "+circuit);
        return;
    }
    //alert("displayCircuit("+circuit+", "+floor+")");
    //console.log("displayCircuit("+circuit+", "+floor+")");
    // Show the list of stuff
    displayDetails(circuit);
    var house_directory = house_address.replace(/ /g, "_");

    // Load the image overlay 
    if (images_lyr == null)
        images_lyr = document.getElementById('electrical_circuit_images');
    for (var i = 0; i < circuit_data[circuit][2].length; i++) { // for each floor the circuit occupies
        if (floor != null && circuit_data[circuit][2][i] != floor) continue; // only display a specific floor, if required

        var img_width = floorplans[circuit_data[circuit][2][i]][1];
        var base_img_src = house_directory+"/"+floorplans[circuit_data[circuit][2][i]][0];
        var overlay_img_src = house_directory+"/"+overlays.electrical[circuit_data[circuit][2][i]][1];
        var img_crop = circuit_data[circuit][3][i];
        var img_left = 8;

        // Add the base floorplan
        var base_img = document.getElementById('img_base_'+circuit_data[circuit][2][i]);
        if (base_img == null) {
            // search for other base images to determine where to place this image
            for (var j = 0; j < floorplans.length; j++) {
                var bimg = document.getElementById('img_base_'+j);
                if (bimg != null) 
                    //console.log("LEFT 1: "+getStyleProperty(bimg, "left"));
                    //console.log("LEFT 1: "+parseInt(bimg.style.left));
                    //console.log("LEFT 1: "+bimg.style.left+", "+getStyleProperty(bimg, "left"));
                    //img_left = parseInt(getStyleProperty(bimg, "left"))+floorplans[j][1]+10;
                    img_left = parseInt(bimg.style.left)+floorplans[j][1]+10;
            }

                                    //' width: '+img_width+'px; height: '+FLOORPLAN_HEIGHT+'px; '+
            var base_img_obj = document.createElement('img');
            base_img_obj.setAttribute('id', 'img_base_'+circuit_data[circuit][2][i]);
            base_img_obj.setAttribute('src', base_img_src);
            base_img_obj.setAttribute('title', floorplans[circuit_data[circuit][2][i]][2]);
            setStyle(base_img_obj, 'position: absolute; top: 0px; left: '+img_left+'px;'+
                              'clip:rect(0px '+img_width+'px '+FLOORPLAN_HEIGHT+
                                           'px 0px); z-index: 2; '); 
            images_lyr.appendChild(base_img_obj);
        } else {
            //console.log("LEFT 2: "+base_img.style.left+", "+getStyleProperty(base_img, "left"));
            //img_left = parseInt(getStyleProperty(base_img, "left"));
            img_left = parseInt(base_img.style.left);
        }

        // Add the circuit overlay rect(top, right, bottom, left)
        var overlay_img_obj = document.createElement('img');
        overlay_img_obj.setAttribute('id', 'img_overlay_'+circuit);
        overlay_img_obj.setAttribute('src', overlay_img_src);
        overlay_img_obj.setAttribute('title', floorplans[circuit_data[circuit][2][i]][2]);
        setStyle(overlay_img_obj, 'position: absolute; top: 0px; left: '+
                                        (img_left-(img_width*img_crop))+'px; '+
                                  'clip:rect(0px '+((img_width*img_crop)+img_width)+'px '+
                                    FLOORPLAN_HEIGHT+'px '+(img_width*img_crop)+
                                    'px); z-index: 3; ' );
        images_lyr.appendChild(overlay_img_obj);
        
        img_left += img_width;
    }
}
function displayMain() {
    if (circuit_data == undefined) return;
    // TODO: how about displaying per floor?
    // Show the list of stuff
    for (var i = 0; i < stacks.length; i++) {
        for (var j = 0; j < stacks[i].length; j++) {
            displayCircuit(stacks[i][j]);
        }
    }
}
function displayFloor(floor) {
    if (circuit_data == undefined) return;
    for (var k = 0; k < stacks.length; k++) {
        for (var j = 0; j < stacks[k].length; j++) {
            for (var i = 0; i < circuit_data[stacks[k][j]][2].length; i++) {
                if (circuit_data[stacks[k][j]][2][i] == floor)
                    displayCircuit(stacks[k][j], floor);
            }
        }
    }
}
function clearDisplay() {
    details_lyr.innerHTML = "";
    images_lyr.innerHTML = "";
    setStyle(panelHighlight, "visibility: hidden");
}
function highlightPanel(c) {
    //console.log("highlightPanel("+c+")");

    /*if (c == "Main") {
    setStyle(panelHighlight, "position: absolute; visibility: visible; z-index: 4; border: 2px solid #000000; "+
                             "width: "+(panel_col_1_width-1)+"px; "+
                             "height: "+((panel_row_height*4)-2)+"px; "+
                             "top: "+4+"px; "+
                             "left: "+3+"px; "
                             );
    return;
    } */
    var ccolor = circuit_data[c][1];
    var pmap = circuit_data[c][4];
    var pcoords = [getPanelCoords(c), pmap[0], pmap[1], pmap[2]];
    var panel_pos = [0,0];
    setStyle(panelHighlight, "position: absolute; visibility: visible; z-index: 4; "+
                             "background-color: "+ccolor+"; border: 2px solid "+ccolor+"; opacity: .5;"+
                             "width: "+(((pmap[0] == 1) ? panel_col_1_width : panel_col_2_width)-1)+"px; "+
                             "height: "+((panel_row_height*pmap[2])-2)+"px; "+
                             "top: "+((panel_pos[1]+pcoords[0][1])+4)+"px; "+
                             "left: "+((panel_pos[0]+pcoords[0][0]))+"px; "
                             );
                             //"border: 2px solid "+ccolor+"; "+
                             //"width: "+(((pcoords[1] == 1) ? panel_col_1_width : panel_col_2_width)-1)+"px; "+
                             //"height: "+(pcoords[3]-2)+"px; "+

}
function getPanelCoords(c) {
    //console.log("getPanelCoords("+c+")");
    //if (true) return [0, 0, 0, 0];
    if (c == "contains" || c == "indexOf") {
    //if (circuit_data == undefined || circuit_data.length <= 0) {
        //console.log("    see ya!: ", circuit_data.length, circuit_data);
        return [0, 0, 0, 0];
    }
    /*
    */
    //console.log("]]] circuit_data: ", circuit_data, c, circuit_data[c]);
    var panel_map = circuit_data[c][4];
    //console.log(c+": ", panel_map);

    // 
    /*var col = 1;
    var row = 1;
    var height = panel_row_height;
    switch (c.toUpperCase()) {
    case 'STOVE': height = panel_row_height*4; break;
    case 'DRYER': row = 5; height = panel_row_height*4; break;
    case 'A/C': col = 2; row = 4; height = panel_row_height*4; break;
    default: {
        switch(c.charAt(0).toUpperCase()) {
        case 'A': row = 9; break;
        case 'B': row = 11; break;
        case 'C': row = 13; break;
        case 'D': row = 15; break;
        case 'E': row = 17; break;
        case 'F': row = 19; break;
        case 'G': col = 2; row = 5; break;
        case 'H': col = 2; row = 7; break;
        case 'I': col = 2; row = 9; break;
        case 'J': col = 2; row = 11; break;
        case 'K': col = 2; row = 13; break;
        case 'L': col = 2; row = 15; break;
        case 'M': col = 2; row = 17; break;
        case 'N': col = 2; row = 19; break;
        }
        }
        break;
    }
    row += (parseInt(c.charAt(1))-1);

    var x1 = (col == 1) ? panel_col_1_x : panel_col_2_x;
    var x2 = x1+((col == 1) ? panel_col_1_width : panel_col_2_width);
    var y1 = (row*panel_row_height)+panel_y_start-panel_row_height;
    var y2 = y1+height;*/
    var x1 = (panel_map[0] == 1) ? panel_col_1_x : panel_col_2_x;
    var x2 = x1+((panel_map[0] == 1) ? panel_col_1_width : panel_col_2_width);
    var y1 = (panel_map[1]*panel_row_height)+panel_y_start-panel_row_height;
    var y2 = y1+(panel_map[2]*panel_row_height);

    //return [[x1, y1, x2, y2],col,row,height];
    return [x1, y1, x2, y2];
}
function positionLayers() {
    images_lyr = document.getElementById('electrical_circuit_images');
    details_lyr = document.getElementById('electrical_circuit_details');
    var images_lyr_top = parseInt(document.documentElement.clientHeight)-FLOORPLAN_HEIGHT-70;
    if (images_lyr_top < 385) images_lyr_top = 390;
    var details_lyr_height = images_lyr_top-20;

    var images_width = 20;
    for (var i = floorplans.length-1; i >= 0; i--) images_width += floorplans[i][1];

    setStyle(details_lyr, "position: relative; top: -10px; left: -10px; height: "+details_lyr_height+"px; padding: 0px; overflow: auto;");
    setStyle(images_lyr, "position: absolute; top: "+images_lyr_top+"px; left: -5px;"+
                         "width: "+images_width+"px; height: "+(FLOORPLAN_HEIGHT+20)+"px;");
}
function keyboardHandler(evt) {
    if (evt) {
        var charCode = (evt.charChode) ? evt.charCode : 
                        ((evt.keyCode) ? evt.keyCode : 
                             ((evt.which) ? evt.which : 0));
        // Capture a print request
        if (String.fromCharCode(charCode) == "P" && evt.ctrlKey)
            window.open('print.html');
    }
}
function showLegend() { setStyle(legend_img, "visibility: visible;"); }
function hideLegend() { setStyle(legend_img, "visibility: hidden;"); }
/*function toggleLegend() {
    if (legend_img == null)
        legend_img = document.getElementById("electrical_legend_img");

    var curr = getStyleProperty(legend_img, "visibility");
    if (curr == "hidden" || curr == null)
    else
        setStyle(legend_img, "visibility: hidden;");
}*/
function create_layers(base_elem) {
    if (base_elem == null) return false;
    /*
    <div id="electrical_panel_mapping_highlight" style="position: absolute; visibility: hidden;"></div>
    <map name="electrical_panel_mapping" id="panel_mapping"></map>
    <img id="electrical_panel" src="panel.jpg" usemap="#panel_mapping" />

    <div id="electrical_floors"></div>
    <div id="electrical_circuit_details"></div>
    <div id="electrical_circuit_images"></div>

    <img id="electrical_legend_img" src="legend.jpg" />
    */

    // panel
    var panel_highlight = document.createElement("div");
    panel_highlight.setAttribute("id", "electrical_panel_mapping_highlight");
    var panel_map = document.createElement("map");
    panel_map.setAttribute("id", "electrical_panel_mapping");
    panel_map.setAttribute("name", "electrical_panel_mapping");
    var panel_img = document.createElement("img");
    panel_img.setAttribute("id", "electrical_panel");
    panel_img.setAttribute("src", electrical_base+"/panel.jpg");
    panel_img.setAttribute("usemap", "#electrical_panel_mapping");
    base_elem.appendChild(panel_highlight);
    base_elem.appendChild(panel_map);
    base_elem.appendChild(panel_img);

    // The rest
    var floors = document.createElement("div");
    floors.setAttribute("id", "electrical_floors");
    var circuit_details = document.createElement("div");
    circuit_details.setAttribute("id", "electrical_circuit_details");
    var circuit_images = document.createElement("div");
    circuit_images.setAttribute("id", "electrical_circuit_images");
    base_elem.appendChild(floors);
    base_elem.appendChild(circuit_details);
    base_elem.appendChild(circuit_images);
    
    // legend
    var legend = document.createElement("img");
    legend.setAttribute("id", "electrical_legend_img");
    legend.setAttribute("src", electrical_base+"/legend.jpg");
    base_elem.appendChild(legend);

    return true;
}
function init_electrical(base_elem) {
    // Create all of the layers, if necessary
    //if (base_elem != undefined)
    if (!create_layers(document.getElementById(base_elem)))
        return;

    // TODO
    //window.setAttribute("onresize", "positionLayers()");

    // Capturing print command
    document.onkeydown = keyboardHandler;
    if (document.layers) document.captureEvents(Event.KEYDOWN);

    // Position and size the layers
    positionLayers();

    // Build the floors links
    floors_lyr = document.getElementById('electrical_floors');
    if (floors_lyr != null) {
        var floors = '<span style="font-family: Arial; Font-weight: bold; font-size: 0.9em;">Floors: </span>';
        for (var i = 0; i < floorplans.length; i++) {
            floors += '<a class="floor_name" href="javascript://" onclick="clearDisplay(); displayFloor('+i+')" style="color: #767676; font-family: Arial; font-size: 0.85em;">'+
                      floorplans[i][2]+'</a>&nbsp;&nbsp;';
        }    
        floors_lyr.innerHTML = floors;
        floors_lyr.innerHTML += '<span style="float: right">'+
                                '<a href="javascript://" '+
                                        'style="position: relative; top: 0px; '+
                                            'font-family: Arial; font-size: 0.65em; font-weight: bold; color: #000000; cursor: default;"'+
                                        'onmouseover="showLegend();" '+
                                        'onmouseout="hideLegend();">Legend</a>&nbsp;'+
                                '<a href="print.html" target="_BLANK" title="Printer-friendly version" style="position: relative; top: 1px;"><img src="'+electrical_base+'/print.png" style="border: none; width: 16px; height: 17px;" /></a></span>';
    }

    // Add the main panel mapping
    var panel_mapping = document.getElementById("electrical_panel_mapping");
    var area_obj = document.createElement('area');
    area_obj.setAttribute("coords", "0,0,90,60");
    area_obj.setAttribute("onmouseover", "clearDisplay(); displayMain()");
    area_obj.setAttribute("title", "Main");
    panel_mapping.appendChild(area_obj);

    // Generate the stacks and the panel mapping
    var count = 0;
    var stack_num = 0;
    var stack = new Array();
    circuits_per_plan = new Array(floorplans.length);
    for (var i = 0; i < floorplans.length; i++) circuits_per_plan[i] = 0;
    for (c in circuit_data) {
        // Put in a stack
        circuits_per_plan[circuit_data[c][2]]++;
        stack[(count % NUM_CIRCUITS_PER_COLUMN)] = c;
        if (count != 0 && (count % NUM_CIRCUITS_PER_COLUMN) == NUM_CIRCUITS_PER_COLUMN-1) {
            stacks[stack_num] = stack;
            stack = new Array();
            stack_num++;
        } 
        count++;

        // Add a panel mapping entry
        area_obj = document.createElement('area');
        //var pcoords = getPanelCoords(c);
        var ppos = [getPanelCoords(c)];//pcoords[0];
        area_obj.setAttribute("coords", ppos[0]+","+ppos[1]+","+ppos[2]+","+ppos[3]);
        area_obj.setAttribute("onmouseover", "clearDisplay(); highlightPanel('"+c+"'); displayCircuit('"+c+"')");
        area_obj.setAttribute("title", c);
        panel_mapping.appendChild(area_obj);
    }
    if (stack.length > 0) stacks[stack_num] = stack;

    // Grab the legend and the panel highlighter
    legend_img = document.getElementById("electrical_legend_img");
    panelHighlight = document.getElementById('electrical_panel_mapping_highlight');

    //
    //while (!circuit_data || circuit_data.length <= 0) { }
    displayMain();
}
