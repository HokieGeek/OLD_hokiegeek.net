function loadCollections(tabs, collections) {
    // console.log("loadCollections(", tabs, ", ", collections, ")");

    if (tabs == null || collections == null || collections.length <= 0) {
        return;
    }

    for (var i = 0; i < collections.length; i++) {
        if (collections[i].Size() <= 0) continue;
        //console.log("loading: ", collections[i]);

        var tab_id = collections[i].Name.toLowerCase()+"_tab";
        var tab_name_span = document.createElement("span");
        tab_name_span.appendChild(document.createTextNode(collections[i].Name));
        tab_name_span.setAttribute("class", "tab_name");
        var tab_content_div = document.createElement("div");
        tab_content_div.setAttribute("id", tab_id);
        tab_content_div.setAttribute("class", "tab_content");
        var tab_div = document.createElement("div");
        tab_div.setAttribute("class", "tab");
        tab_div.appendChild(tab_name_span);
        tab_div.appendChild(tab_content_div);
        tabs.appendChild(tab_div);

        collections[i].Sort();
        var view = new CollectionsView(tab_id, collections[i]);

        delete view;
        delete tab_id;
        delete tab_name_span;
        delete tab_content_div;
        delete tab_div;
    }
}

function resizeTabs() {
    var height = 0;
    var width = 0;
    var parent_classes = null;
    var divs = document.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].getAttribute("class") == "tab_content") {
            // Ignore the left tabs! Only top level!
            height = 0;
            width = 0;
            parent_classes = divs[i].parentNode.parentNode.parentNode.getAttribute("class");
            if (parent_classes != null && parent_classes.indexOf("tab_content") != -1) {
                height = (parseInt(document.documentElement.clientHeight-offset));
                width = (parseInt(document.documentElement.clientWidth));
            } else {
                width = (parseInt(document.documentElement.clientWidth)-25);
                height = (parseInt(document.documentElement.clientHeight)-60);
            }
            setStyle(divs[i], "height: "+height+"px !important; width: "+width+"px !important;");

        }
    }

    delete height;
    delete width;
    delete parent_classes;
    delete divs;
}
