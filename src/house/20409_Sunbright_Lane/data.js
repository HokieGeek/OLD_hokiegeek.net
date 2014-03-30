var house_address = "20409 Sunbright Lane";
var pics_album_name = "Our First House";
var floorplans_url = "http://floorplanner.com/projects/19018372-20409-sunbright-lane";
var floorplans = [["floor_top.png", 495, "Top"], 
                  ["floor_ground.png", 527, "Ground"], 
                  ["floor_basement.png", 509, "Basement"]]; // image, width, name
var FLOORPLAN_HEIGHT = 306;

var overlays = { "electrical": [["Top", "overlay_electrical_top.png"],
                                ["Ground", "overlay_electrical_ground.png"],
                                ["Basement", "overlay_electrical_basement.png"]],
                  "plumbing" : null,
                  "HVAC" : null
              };

/*
circuit_data[CIRCUIT] = [CIRCUIT_HTML_DESCRIPTION,
                         #CIRCUIT_COLOR,
                         [CIRCUIT_FLOORPLANS_INDECES],
                         [CIRCUIT_FLOORPLAN_OVERLAY_NUMS/PER PLAN],
                         [PANEL_COL, PANEL_START_ROW, PANEL_NUM_ROWS]
                        ];
*/
var circuit_data = [];
circuit_data["STOVE"] = ["<ul>"+
                     "<li>Stove</li>"+
                     "</ul>",
                    "#662d60",
                    [1],    
                    [7], 
                    [1, 1, 4]];
circuit_data["DRYER"] = ["<ul>"+
                     "<li>Dryer</li>"+
                     "</ul>",
                    "#6ca10b",
                    [2],    
                    [3],
                    [1, 5, 4]];
circuit_data["A1"] = ["<ul>"+
                     "<li>Outside front outlet</li>"+
                     "<li>Laundry north wall outlet</li>"+
                     "</ul>",
                    "#18a10b",
                    [1, 2],    
                    [11, 2],
                    [1, 9, 1]];
circuit_data["A2"] = ["<ul>"+
                     "<li>Dinning room floor outlet</li>"+
                     "<li>Refrigerator</li>"+
                     "<li>Kitchen/Dinning room shared wall</li>"+
                     "</ul>",
                    "#d412d5",
                    [1],    
                    [3],
                    [1, 10, 1]];
circuit_data["B1"] = ["<ul>"+
                     "<li>Master + closet</li>"+
                     "<li>Master bathroom</li>"+
                     "<li>Guest bathroom</li>"+
                     "<li><i>Attic lights</i></li>"+
                     "</ul>",
                    "#96029b",
                    [0],    
                    [1],
                    [1, 11, 1]];
circuit_data["B2"] = ["<ul>"+
                     "<li>Disposal</li>"+
                     "</ul>",
                    "#8f4c32",
                    [1],    
                    [5],
                    [1, 12, 1]];
circuit_data["C1"] = ["<ul>"+
                     "<li>Dinning room light + north wall outlet</li>"+
                     "<li>Kitchen lights</li>"+
                     "<li>Microwave</li>"+
                     "<li>Deck light</li>"+
                     "</ul>",
                    "#0fe02c",
                    [1],    
                    [2],
                    [1, 13, 1]];
circuit_data["C2"] = ["<ul>"+
                     "<li>Furnace</li>"+
                     "</ul>",
                     "#e1a523",
                    [2],    
                    [4],
                    [1, 14, 1]];
circuit_data["D1"] = ["<ul>"+
                     "<li>Basement bathroom</li>"+
                     "<li>Basement hall light</li>"+
                     "<li>Laundry room closet light</li>"+
                     "</ul>",
                    "#C18770",
                    [2],    
                    [8],
                    [1, 15, 1]];
circuit_data["D2"] = ["<ul>"+
                    "<li>Family room south + west walls</li>"+
                    "<li>Family room fans</li>"+
                    "<li>Patio light</li>"+
                     "</ul>",
                    "#9b5502",
                    [1,2],    
                    [10, 9],
                    [1, 16, 1]];
circuit_data["A/C"] = ["<ul>"+
                     "<li>Air Conditioner</li>"+
                     "</ul>",
                    "#a2535e",
                    [2],    
                    [5],
                    [2, 1, 4]];
circuit_data["I1"] = ["<ul>"+
                     "<li>Kitchen outlets</li>"+
                     "<li>Dining room south wall outlet</li>"+
                     "</ul>",
                    "#e1cd27",
                    [1],    
                    [4],
                    [2, 9, 1]];
circuit_data["I2"] = ["<ul>"+
                     "<li>Dishwasher</li>"+
                     "</ul>",
                    "#605502",
                    [1],    
                    [6],
                    [2, 10, 1]];
circuit_data["J1"] = ["<ul>"+
                     "<li>Basement workshop</li>"+
                     "</ul>",
                    "#104492",
                    [2],    
                    [7],
                    [2, 11, 1]];
circuit_data["J2"] = ["<ul>"+
                     "<li><em><strong>UNUSED 20 AMPS</strong></em></li>"+
                     "</ul>",
                    "#D1D1D1",
                    [2],    
                    [10],
                    [2, 12, 1]];
circuit_data["K1"] = ["<ul>"+
                     "<li>Family room north + east walls</li>"+
                     "<li>Laundry room light</li>"+
                     "</ul>",
                    "#e00f0f",
                    [2],    
                    [1],
                    [2, 13, 1]];
circuit_data["K2"] = ["<ul>"+
                     "<li>All bathroom outlets</li>"+
                     "<li>Patio outlet</li>"+
                     "</ul>",
                    "#d54e12",
                    [0, 1, 2],    
                    [2, 8, 6],
                    [2, 14, 1]];
                    /*
                     "<li>Master bath outlet</li>"+
                     "<li>Guest bath outlet</li>"+
                     "<li>Foyer bath outlet</li>"+
                     "<li>Basement bath outlet</li>"+
                     */
circuit_data["N1"] = ["<ul>"+
                     "<li>Top floor hallway lights</li>"+
                     "<li>Guest room</li>"+
                     "<li>Office</li>"+
                     "</ul>",
                    "#029b99",
                    [0, 1],    
                    [3, 9],
                    [2, 19, 1]];
circuit_data["N2"] = ["<ul>"+
                     "<li>Doorbell</li>"+
                     "<li>Front stoop light</li>"+
                     "<li>Foyer</li>"+
                     "<li>Living room</li>"+
                     "</ul>",
                    "#190fe0",
                    [1],    
                    [1],
                    [2, 20, 1]];
