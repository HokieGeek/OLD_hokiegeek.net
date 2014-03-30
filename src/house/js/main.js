var tabsObj = null;
var projTabsObj = null;
var pics_id = "house_pics";
var pw_albums = null;
var pics_album_view = null;
function sizeTabs() {
    var contents = $('.tab_content');
    contents.css("background-color", "#FFFFFF"); 
    contents.css("height", (parseInt(document.documentElement.clientHeight-50))+"px");
    contents.css("padding", "1px");
}
function loadPics() {
    //console.log("loadPics()");
    if (pw_albums == null) return;

    if (!pw_albums.isLoaded(pics_album_name)) {
        setTimeout("loadPics()", 1500);
        return;
    }

    //pics_album_view = new PicasaWeb_AlbumView(pw_albums.getAlbum(pics_album_name), $("#"+pics_id));
    pics_album_view = new PicasaWeb_AlbumView(pw_albums.getAlbum(pics_album_name), 
                                              document.getElementById(pics_id),
                                              false);
}
function addTab(name, id) {
    var t = $('<div></div>').addClass("tab");
    t.append($('<span></span>')
            .addClass("tab_name")
            .append(document.createTextNode(name.charAt(0).toUpperCase()+name.substr(1)))
    );
    t.append($("<div id="+id+"></div>")
            .addClass("tab_content")
    );
    $("#tabs").append(t);
}
function buildHouseContent() {
    // Add the floorplans iframe (might need to re evaluate this later on)
    if (floorplans_url != undefined && floorplans_url != null) {
        addTab("Floorplans", "floorplans");
        $("#floorplans").append($('<iframe></iframe>').attr("src", floorplans_url));
    }

    // Load the pictures
    if (pics_album_name != undefined && pics_album_name != null) {
        addTab("Pictures", pics_id);

        pw_albums = new PicasaWeb("andres.f.perez");
        if (pw_albums != null) loadPics();
        else console.log("WhiskeyTangoFoxtrot");
    }

    // Load the address
    $("#address").append(house_address);

    // Create the overlays tabs
    for (o in overlays) {
        if (overlays[o] == null) continue;
        var overlay = o.toLowerCase();
        addTab(overlay, overlay);

        switch (overlay) {
        case 'electrical': init_electrical("electrical"); break;
        default: break;
        }
    }
}
function init() {
    hg_small_nav(); 

    buildHouseContent();

    // Setup the tabs
    sizeTabs();
    tabsObj = new LibTabs("tabsObj", document.getElementById("tabs"), 0);
    tabsObj.HandleKeyboardInputs();

    $("#tabs_progress").attr("style", "visibility: hidden");
}
