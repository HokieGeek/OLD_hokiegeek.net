var journalSorterLyr = null;
var journalTable = null;
var filteredTabsHeight = 105;

/* Metrics */

/* Reviews */
var PIC_SIZE_FULL = 1600;
var PIC_SIZE_THUMB = 300;
var PIC_SIZE_SOTD = 450;
var displayed_reviews = 0;
function viewReviewSlideshow(r) {
    if (r < 0 || ShavingReviewedProducts[r].Pictures.length <= 0) return;
    var prod = ShavingReviewedProducts[r];
    var pics = [];
    for (var i = 0; i < prod.Pictures.length; i++) {
        var pw_img = prod.Pictures[i];
        if (pw_img.getURL)
            pics.push(pw_img.getURL(PIC_SIZE_FULL));
        else
            pics.push(pw_img);
    }
    //console.log("SLIDESHOW PICS:", pics);
    var slideshow = new LibSlideshow(pics);
    //new LibSlideshow(ShavingReviewedProducts[r].Pictures);
    
    if (prod != undefined) delete prod;
    if (pics != undefined) delete pics;
    // if (slideshow != undefined) delete slideshow; // TODO
}
function viewReviewPicture(r, offset) {
    var img = document.getElementById("review_pic_"+r);
    var current = document.getElementById("current_pic_"+r);
    //console.log("viewReviewPicture(",img,", ",r,", ",current,", ",offset,")");
    //console.log("viewReviewPicture(",r,", ",offset,")");
    var review = ShavingReviewedProducts[r];
    if (img == null || current == null || review.Pictures.length <= 1) return;
    var curr_val = current.value;
    if (curr_val == null || curr_val < 0) curr_val = 0;
    //curr_val = review.Pictures.length-1;
    //console.log("   Found '"+review.Pictures.length+"' pics");

    var next = (eval(curr_val)+eval(offset)) % review.Pictures.length;
    if (next < 0) next = review.Pictures.length-1;
    //console.log("   NEXT: ", next);
    
    // Switch the image and store the current value
    var pw_img = review.Pictures[next];
    if (pw_img.getURL)
        img.setAttribute("src", pw_img.getURL(PIC_SIZE_FULL));
    else
        img.setAttribute("src", pw_img);
    current.setAttribute("value", next);
}
function refreshReviews(tab) {
    // resize
    var reviews = document.getElementById('review_tabs');
    var divs = reviews.getElementsByTagName('div');
    //console.log("DIVS: ", divs, reviews);
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].getAttribute("class").indexOf("tab_content") != -1) {
            height = (parseInt(document.documentElement.clientHeight-filteredTabsHeight));
            setStyle(divs[i], "height: "+height+"px !important;");
        }
    }
    //var oldSelectedTab = tabsObj.NestedTabs[1].CurrentTab;
    tabsObj.NestedTabs[1].ReloadTabs();
     
    if (tab != undefined && tab != null)
        tabsObj.NestedTabs[1].ToggleTab(tab); // toggle selected tab
    else    
        tabsObj.NestedTabs[1].ToggleTab(0); // toggle the first tab

    if (reviews != undefined && reviews != null) delete reviews;
    if (divs != undefined && divs != null) delete divs;
}
function loadShavingReviews(sort_field, sort_dir, sort_group, filter) {
    var groupFields = [["Product Type", "TYPE"], ["Review Grade", "GRADE"], ["In Den", "DEN"]];
    var sortFields = [["Review Date", 0], ["Review Grade", 1]];
    //console.log("loadShavingReviews(",sort_field,", ",sort_dir,", ",sort_group,", ",filter,")");

    // Clear the filter value
    HG_Journal_clearFilterValue();
    
    // Load the controls    
    var review_controls = document.getElementById('review_controls');
    review_controls.innerHTML = "";
    var grouper = document.createElement("div");

    var grp_lbl = document.createElement('span');
    grp_lbl.appendChild(document.createTextNode("Group:"));
    grouper.appendChild(grp_lbl);

    var grp_select = document.createElement('select');
    grp_select.setAttribute("onchange", 
        "loadShavingReviews(0, 'DESC', this.value, null); refreshReviews(0);");
    //+"tabsObj.NestedTabs[1].ReloadTabs();tabsObj.NestedTabs[1].ToggleTab(0);");
    for (var i = 0; i < groupFields.length; i++) {
        var opt = document.createElement("option");
        if (sort_group.toLowerCase() == groupFields[i][1].toLowerCase())
            opt.setAttribute("selected", "true");
        opt.setAttribute("value", groupFields[i][1]);
        opt.appendChild(document.createTextNode(groupFields[i][0]));
        grp_select.appendChild(opt);
    }
    grouper.appendChild(grp_select);
    review_controls.appendChild(grouper);

    var sorter = document.createElement("div");
    var srt_lbl = document.createElement("span");
    srt_lbl.appendChild(document.createTextNode("Sort:"));
    sorter.appendChild(srt_lbl);
    for (var i = 0; i < sortFields.length; i++) {
        if (i != 0)
            sorter.appendChild(document.createTextNode(" | "));
        var field = document.createElement("a");
        field.setAttribute("onclick", 
            'loadShavingReviews('+sortFields[i][1]+', "'+
                          ((sort_dir == 'DESC') ? 'ASC' : 'DESC')+'", "'+
                            sort_group+'", '+((filter == null) ? 'null' : '"'+filter+'"')+'); refreshReviews();');
        field.appendChild(document.createTextNode(sortFields[i][0]));
        sorter.appendChild(field);
        if (sort_field == sortFields[i][1]) {
            var sort_img = document.createElement('img');
            sort_img.setAttribute('class', "sort_arrow");
            sort_img.setAttribute('src', 
                        "img/sort_"+((sort_dir == "ASC") ? "up" : "down")+".png");
            sorter.appendChild(sort_img);
        }
    }
    review_controls.appendChild(sorter);


    // Load the review entries
    var reviews = document.getElementById('review_tabs');
    reviews.innerHTML = "";
    var tabs = [];
    var tab_length = 0;
    switch (sort_group.toLowerCase()) {
    case "grade": tab_length = grade_scale.length-1; break;
    case "den": tab_length = 2; break;
    case "type": 
    default: tab_length = PRODUCT_CATEGORIES.length-1; break;
    }
    for (var i = tab_length; i >= 0; i--)
        tabs[i] = null;

    // Sort things out
    switch (sort_field) {
    case 0: 
        if (sort_dir == "ASC") {
            ShavingReviewedProducts.sort( function(a,b) {
                if (a.ReviewDate.getTime() == b.ReviewDate.getTime())
                    return a.Grade - b.Grade;
                else
                    return b.ReviewDate.getTime() - a.ReviewDate.getTime();
            });
        } else {
            sortProducts();
        }
        break;
    case 1:
        sortProducts("Grade");
        console.log("Sorted by grade: ", ShavingReviewedProducts.length);
        break;
    }

        //console.log(">>>>>>>>>>>>>>>HERE<<<<<<<<<<<<<<<<");
    var row = null;
    var cell = null;
    displayed_reviews = 0;
    for (var r = ShavingReviewedProducts.length-1; r >= 0; r--) {
        var reviewData = ShavingReviewedProducts[r];
        //console.log(">>> APPLYING FILTER: ", filter);
        if (filter != undefined && filter != null && !eval(filter)) {
            /*
            console.log("************WTF?!!***********", 
                        filter != undefined, 
                        filter != null, 
                        !eval(filter), 
                        filter);
                        */
            continue;
        }

        displayed_reviews++;

        var review = document.createElement('div');
        review.setAttribute("class", "review_entry");
        if (reviewData.Grade > -1)
            setStyle(review, "background-image: url(\"img/shave_grade_"+grade_scale[reviewData.Grade].toLowerCase()+".png\");");

        //// The pictures viewer
        var pictures = document.createElement('table');
        var currentPic = document.createElement('input');
        currentPic.setAttribute("id", "current_pic_"+r);
        currentPic.setAttribute("type", "hidden");
        currentPic.setAttribute("value", "0");
        pictures.appendChild(currentPic);
        var pics_row = document.createElement('tr');
        var pics_cell = document.createElement('td');
        // Display the first picture 
        var img = document.createElement('img');
        img.setAttribute("id", "review_pic_"+r);
        if (reviewData.Pictures != null && reviewData.Pictures.length > 0 
            && reviewData.Pictures[0] != null) {
            img.setAttribute("src", reviewData.Pictures[0].getURL(PIC_SIZE_THUMB)); 
            img.setAttribute("onclick", "viewReviewSlideshow("+r+")");
        } else {
            img.setAttribute("src", "img/default.png");
        }
        pics_cell.appendChild(img);
        pics_row.appendChild(pics_cell);
        pictures.appendChild(pics_row);

        // The controls
        if (reviewData.Pictures.length > 1) {
            pics_row = document.createElement('tr');
            pics_cell = document.createElement('td');

            var left = document.createElement('span');
            var ctrl_img = document.createElement('img');
            ctrl_img.setAttribute("src", "img/pics_arrow_left.png");
            ctrl_img.setAttribute("title", "Previous picture");
            ctrl_img.setAttribute("onclick", "viewReviewPicture("+r+", -1)");
            left.appendChild(ctrl_img);

            var right = document.createElement('span');
            ctrl_img = document.createElement('img');
            ctrl_img.setAttribute("src", "img/pics_arrow_right.png");
            ctrl_img.setAttribute("title", "Next picture");
            ctrl_img.setAttribute("onclick", "viewReviewPicture("+r+", 1)");
            right.appendChild(ctrl_img);

            pics_cell.appendChild(left);
            pics_cell.appendChild(right);
            pics_row.appendChild(pics_cell);
            pictures.appendChild(pics_row);
        }
        review.appendChild(pictures);

        //// Add the details
        var details = document.createElement('table');
        row = document.createElement('tr');
        cell = document.createElement('td');
        // Name
        var name = (reviewData.getName != undefined) ? reviewData.getName() : reviewData;
        cell.appendChild(document.createTextNode(name));
        cell.setAttribute('onclick', "tabsObj.ToggleTab(0); filterData(\""+name.replace(/'/, "\\\'").replace(/ \(.*\)/, "")+"\");");
        cell.setAttribute('title', "View journal entries where this product was used!");
        // In den?
        if (!reviewData.inDen) {
            var not_in_den = document.createElement("span");
            not_in_den.appendChild(document.createTextNode("X"));
            cell.appendChild(not_in_den);
        }    
        row.appendChild(cell);
        details.appendChild(row);
        // details.setAttribute('onclick', "tabsObj.ToggleTab(0); filterData(\""+name.replace(/'/, "\\\'").replace(/ \(.*\)/, "")+"\");");
        // details.setAttribute('title', "View journal entries where this product was used!");

        // Purchase info
        row = document.createElement('tr');
        cell = document.createElement('td');
        var purchase_info = "Purchased";
        if (reviewData.PurchaseDate != null)
            purchase_info += " on "+HG_formatDate(reviewData.PurchaseDate);
        if (reviewData.Location != null) 
            purchase_info += " from "+reviewData.Location;
        if (reviewData.Price != null) 
            purchase_info += " for $"+reviewData.Price;
        if (purchase_info.replace(/Purchased/, "").length > 0)
            cell.appendChild(document.createTextNode(purchase_info));
        row.appendChild(cell);
        details.appendChild(row);

        // Grades
        var grades = reviewData["Grades"];
        var grade_categories = PRODUCT_GRADES[PRODUCT_CATEGORIES.indexOf(reviewData.Type.toLowerCase())];
        if (grades != null && grades.length > 0 ) {
            //&& grades.length == ((grade_categories.length*2)-1)) {
            grades = grades.split(";");

            row = document.createElement('tr');
            cell = document.createElement('td');
            var grades_tbl = document.createElement('table');
            var column_mod = Math.ceil(grade_categories.length/2);
            var count = 0;
            var grade_row = null;
            for (var gc = 0; gc < grade_categories.length; gc++) {
                var gcat = grade_categories[gc];
                var cgrade = grades[gc];

                if ((count % column_mod) == 0)
                    grade_row = document.createElement('tr');
                var label_cell = document.createElement('td');
                label_cell.innerHTML = gcat;
                grade_row.appendChild(label_cell);
                var grade_cell = document.createElement('td');
                var grade_img = document.createElement('img');
                if (grade_scale[cgrade] != undefined) {
                    grade_img.setAttribute("src", "img/shave_grade_"+grade_scale[cgrade].toLowerCase()+".png");
                } else {
                    grade_img.setAttribute("src", "img/shave_grade_meh_dark.png");
                    /*
                    console.log("NO GRADE?!");
                    console.log("  name = ", name);
                    console.log("  gc = "+gc+", gcat = "+gcat);
                    console.log("  grade_categories: "+grade_categories.length);
                    console.log("  grades: "+grades.length);
                    console.log("  TESTING: "+grades[gc]);
                    console.log("  cgrade = ", cgrade, grade_scale);
                    */
                }
                grade_img.setAttribute("title", grade_scale[cgrade]);
                //setStyle(grade_img, "width: 25px;");
                grade_cell.appendChild(grade_img);
                grade_row.appendChild(grade_cell);

                if ((count % column_mod) == 0)
                grades_tbl.appendChild(grade_row);
                count++;
            }
            cell.appendChild(grades_tbl);
            row.appendChild(cell);
            details.appendChild(row);
        }

        // Comments
        if (reviewData.ReviewComments != null) {
            row = document.createElement('tr');
            cell = document.createElement('td');
            //cell.appendChild(document.createElement('hr'));
            cell.innerHTML = reviewData.ReviewComments;
            // console.log(cell, cell.firstChild, cell.firstChild.nodeName);
            cell.insertBefore(document.createElement('hr'), cell.firstChild);
            //cell.appendChild(document.createTextNode(reviewData.ReviewComments));
            //cell.appendChild(textToDOM(reviewData.ReviewComments));
            row.appendChild(cell);
            details.appendChild(row);
        }

        review.appendChild(details);

        // Ok, now add the review to the correct tab
        var cat_idx = -1;
        switch (sort_group.toLowerCase()) {
        case "grade": 
            cat_idx = ShavingReviewedProducts[r].Grade; 
            if (cat_idx < 0) cat_idx = 0;
            break;
        case "den":
            cat_idx = (ShavingReviewedProducts[r].inDen) ? 0 : 1; 
            break;
        case "type": 
        default:
            cat_idx = PRODUCT_CATEGORIES.indexOf(ShavingReviewedProducts[r].Type.toLowerCase());
            break;
        }
        //console.log("cat_idx = ", cat_idx);
        
        // Create the tab if it doesn't exist already
        if (cat_idx >= 0 && tabs[cat_idx] == null) {
            var tab_id = "";
            var tab_n = document.createElement('span');
            tab_n.setAttribute('class', 'tab_name');
            switch (sort_group.toLowerCase()) {
            case "grade": //c = grade_scale[cat_idx];
                var tab_grade = grade_scale[cat_idx].toLowerCase();
                tab_id = tab_grade;
                var img = document.createElement('img');
                img.setAttribute("src", "img/shave_grade_"+tab_grade+".png");
                setStyle(img, "height: 14px; width: 14px;");
                tab_n.appendChild(img);
                break;
            case "den":
                var tab_den_cat = (cat_idx == 0) ? "In Den" : "Not In Den";
                tab_id = (cat_idx == 0) ? "in_den" : "not_in_den";
                tab_n.appendChild(document.createTextNode(tab_den_cat));
                break;
            case "type": 
            default:
                var c = -1;
                c = PRODUCT_CATEGORIES[cat_idx];
                var plural = "s";
                if (c == "brush") plural = "es";
                tab_id = c+plural;
                tab_n.appendChild(document.createTextNode(c.charAt(0).toUpperCase()+c.substring(1)+plural));
            }

            var tab_c = document.createElement('div');
            tab_c.setAttribute('class', 'tab_content');
            tab_c.setAttribute('id', "reviews_"+tab_id);

            tabs[cat_idx] = document.createElement('div');
            tabs[cat_idx].setAttribute('class', 'tab');
            tabs[cat_idx].appendChild(tab_n);
            tabs[cat_idx].appendChild(tab_c);
        }

        // Now add the review to the tab
        if (tabs[cat_idx] != null)
            tabs[cat_idx].firstChild.nextSibling.appendChild(review);
    }

    // FIXME: Now the actual sort?
    if (sort_group.toLowerCase() == "grade")
        tabs = tabs.reverse();
    
    // Now add up all of the tabs
    for (var i = tabs.length-1; i >= 0; i--) {
        if (tabs[i] != null)
            reviews.insertBefore(tabs[i], reviews.firstChild);
    }
}

/* Journal */
var journalNav_Enabled = false;
var journalNav_Current = -1;
var journalNav_Table = null;
var journalNav_Entries = null;
var displayed_entries = 0;
function journalNav_display(idx) {
    //console.log("journalNav_display(",idx,")");
    // First, we collapse all of them
    toggleJournalExpand(false);

    // Then we find the appropriate table row, "click" it
    if (journalNav_Entries == null) {
        if (journalNav_Table == null) journalNav_Table = document.getElementById("journal");
        journalNav_Entries = journalNav_Table.children;
    }
    var entry = journalNav_Entries[idx+1];
    toggleEntryDetails(entry, true);
    journalNav_Current = idx;

    // Now we scroll to this element
    var pos = findElemPos(entry);
    journalNav_Table.parentNode.scrollTop = pos[1]-150;
}
function journalKeyboardNav(e) {
    var evt = (e) ? e : ((window.event) ? window.event : null);
    if (evt) {
        var charCode = (evt.charChode) ? evt.charCode : 
                            ((evt.keyCode) ? evt.keyCode : 
                             ((evt.which) ? evt.which : 0));
        switch(charCode) {
        case 74:   // j
        case 75: { // k
            var offset = 1;
            if (charCode == 75)
                offset = -1;

            var next = (eval(journalNav_Current)+eval(offset)) % ShavingJournalEntries.length;
            if (next < 0) next = ShavingJournalEntries.length-1;
            journalNav_display(next);

            } break;
        case 187: // + TODO: Shift only
        case 189: // -
            if (tabsObj.CurrentTab == 0)
                toggleJournalExpand((charCode == 187) ? true : false);    
            break;

        }
    }
}
function enableJournalNav() {
    if (journalNav_Enabled) return;
    AddOKDListener(journalKeyboardNav);
    journalNav_Enabled = true;
}
function disableJournalNav() {
    if (!journalNav_Enabled) return;
    RemoveOKDListener(journalKeyboardNav);
    journalNav_Enabled = false;
}
var prodPreview = null;
function loadProductPreview(o, p) {
    // Only display if journal entry is expanded
    var rows = o.parentNode.parentNode.parentNode.getElementsByTagName('tr');
    for (var i = rows.length; i >= 0; i--) {
        if (rows[i] == undefined || rows[i] == null) continue;
        var classes = rows[i].getAttribute("class");
        if (classes != null && classes.indexOf("entry_full_hide") != -1) return;
    }
    
    if (prodPreview == null) prodPreview = document.getElementById('journal_product_preview');

    // TODO: Make this a search!
    var product = ShavingReviewedProducts[p];
    if (product == null) return;
    prodPreview.innerHTML = "";

    console.log("loadProductPreview()", p, product.getName(), product);

    // Load first image if any available
    var imgLyr = null;
    if (product.Pictures.length > 0) {
        imgLyr = document.createElement('img');
        imgLyr.setAttribute("src", product.Pictures[0].getURL(PIC_SIZE_THUMB));
    }
    
    // Load grade if any available
    var gradesLyr = null;
    if (product.Grade > -1) {
        gradesLyr = document.createElement('img');
        gradesLyr.setAttribute("src", "img/shave_grade_"+grade_scale[product.Grade].toLowerCase()+".png");
    }
    
    // Now display the preview
    if (imgLyr != null || gradesLyr != null) {
        if (imgLyr != null) prodPreview.appendChild(imgLyr);
        if (gradesLyr != null) prodPreview.appendChild(gradesLyr);
        var pos = findMousePos();
        setStyle(prodPreview, "top: "+(pos[1]+6)+"px; left: "+(pos[0]+2)+"px; visibility: visible;");
    }
}
function hideProductPreview() {
    if (prodPreview == null) prodPreview = document.getElementById('journal_product_preview');
    setStyle(prodPreview, "visibility: hidden;");
}
function renderShavingJournalEntry(entry_elem, entry, num_displayed) {
    //console.log("renderShavingJournalEntry(", entry, ", ", num_displayed, ")");
    // Now add the notes
    var row = null;
    var cell = null;
    var entry_date = null;
    //var entry_elem = null;
    var categories = [[["Razor", "Blade", "Strop"], false], 
                      [["Brush", "Soap", "Cream"], false], 
                      [["Preshave", "Aftershave"], true], 
                      [["Grades", "AdjustableSetting", "NumPasses"], true]];
        

    // Create the entry date
    /*
    entry_date = document.createElement('td');
    entry_date.innerHTML = HG_formatDate(entry.Date);

    // Create the entry cell
    entry_elem = document.createElement('td');
    //if (!(i % 2)) entry_elem.setAttribute("class", "distinct_row");
    if (!(num_displayed % 2)) entry_elem.setAttribute("class", "distinct_row");
    */

    //setStyle(entry_elem, "background-image: url(\"img/shave_grade_meh.png\");");
    setStyle(entry_elem, "background-image: url(\"img/shave_grade_"+entry.Grade.toLowerCase()+".png\");");

    // Create the major entry details in another table
    var details = document.createElement('table');

    var hasNoBlade = false;
    for (var cat_row = 0; cat_row < categories.length; cat_row++) {
        row = document.createElement('tr');
        if (categories[cat_row][1])
            row.setAttribute("class", "entry_full entry_full_hide");
        for (var cat = 0; cat < categories[cat_row][0].length; cat++) {
            var hasReview = false;
            var cat_name = categories[cat_row][0][cat];
            var cat_val = entry[cat_name];
            if (cat_val != null && cat_val.getName != undefined) {
                cat_val = cat_val.getName();
                hasReview = true;
            } 
            if (cat_name == "AdjustableSetting" && cat_val == null) continue;

            switch (cat_name) {
            case "NumPasses": cat_name = "Passes"; break;
            case "AdjustableSetting": cat_name = "Adjustable Setting"; break;
            case "Strop": if (!hasNoBlade) continue; break;
            case "Blade": if (cat_val == null || cat_val.length <= 0) {
                                hasNoBlade = true;
                                continue; 
                            }
                            break;
            case "Soap": 
            case "Cream":     if (cat_val == null || cat_val.length <= 0) {
                                continue; 
                            }
                            break;
            default: if (cat_val != null) cat_val = cat_val.toString();
            }

            // Label
            cell = document.createElement('td');
            cell.innerHTML = cat_name+":"; 
            cell.setAttribute("class", "journal_details_label");
            row.appendChild(cell);

            if (cat_name == "Grades") {
                cell = document.createElement('td');
                var grades_tbl = document.createElement('table');
                grades_tbl.setAttribute('class', 'entry_grades');
                var grades = entry[cat_name];
                var num_grade_categories = 0;
                for (var gc in grades) num_grade_categories++;
                var column_mod = Math.ceil(num_grade_categories/2);
                var count = 0;
                var grade_row = null;
                for (var gc in grades) {
                    if ((count % column_mod) == 0)
                        grade_row = document.createElement('tr');
                    var label_cell = document.createElement('td');
                    label_cell.innerHTML = gc;
                    grade_row.appendChild(label_cell);
                    var grade_cell = document.createElement('td');
                    var grade_img = document.createElement('img');
                    grade_img.setAttribute("src", "img/shave_grade_"+grade_scale[grades[gc]].toLowerCase()+".png");
                    grade_img.setAttribute("title", grade_scale[grades[gc]]);
                    grade_cell.appendChild(grade_img);
                    grade_row.appendChild(grade_cell);

                    if ((count % column_mod) == 0)
                        grades_tbl.appendChild(grade_row);
                    count++;

                    if (label_cell != undefined) delete label_cell;
                    if (grade_cell != undefined) delete grade_cell;
                    if (grade_img != undefined) delete grade_img;
                }
                cell.appendChild(grades_tbl);
                row.appendChild(cell);

                if (grades_tbl != undefined) delete grades_tbl;
                if (grades != undefined) delete grades;
                if (num_grade_categories != undefined) delete num_grade_categories;
                if (column_mod != undefined) delete column_mod;
                if (count != undefined) delete count;
                if (grade_row != undefined) delete grade_row;
            } else {
                // Value
                cell = document.createElement('td');

                if (cat_name == "Number of Passes") {
                    cell.innerHTML = cat_val;
                } else if (cat_val != null && cat_val.length > 0) {
                    //console.log("  "+cat_name+": "+cat_val);

                    if (hasReview) {
                        var prod_span = document.createElement('span');
                        var rev_idx = ShavingReviewedProducts.indexOf(entry[cat_name.replace(/\//, "")]);
                        prod_span.innerHTML = cat_val;
                        prod_span.setAttribute("onclick", "tabsObj.ToggleTab(1); filterData('"+cat_val.replace(/ \(.*\)/, "")+"');");
                        if (rev_idx >= 0) {
                            prod_span.setAttribute("onmouseover", "loadProductPreview(this, "+rev_idx+")");
                            prod_span.setAttribute("onmouseout", "hideProductPreview()");
                        }
                        cell.appendChild(prod_span);
                    } else {
                        //if (cat_name.toLowerCase() == "aftershave")
                                //console.log("   AS: ",cat_val);
                        cell.innerHTML = cat_val;
                    }
                }
                row.appendChild(cell);
            }

            if (hasReview != undefined) delete hasReview;
            if (cat_name != undefined) delete cat_name;
            if (cat_val != undefined) delete cat_val;
        }
        details.appendChild(row);
    }
    // console.log(">> Added the details");
        
    // NOTE
    var note = document.createElement('span');
    note.setAttribute("class", "entry_full entry_full_hide");
    //note.appendChild(document.createElement('hr'));
    note.innerHTML = "<hr />"+entry.Notes;
    //note.appendChild(document.createTextNode(entry.Notes));


    var sotd = null;
    if (ShavingAlbum != null) {
        sotd = ShavingAlbum.getPicture("SOTD_"+
                HG_formatDate(entry.Date, "%Y%M%D")+".jpg");
    }

    if (sotd != null) {
        //console.log("SOTD: ", sotd);
        var sotd_img = document.createElement('img');
        sotd_img.setAttribute("src", sotd.getURL(PIC_SIZE_SOTD));
        var sotd_center = document.createElement('center');
        sotd_center.appendChild(sotd_img);

        note.appendChild(document.createElement('br'));
        note.appendChild(document.createElement('br'));
        note.appendChild(sotd_center);

        // Now add the icon
        var camera_icon = document.createElement('div');
        camera_icon.setAttribute('class', "journal_sotd_camera");
        var camera_icon_img = document.createElement('img');
        camera_icon_img.setAttribute('src', "img/camera.png");
        setStyle(camera_icon_img, "width: 16px");
        camera_icon.appendChild(camera_icon_img);
        entry_elem.appendChild(camera_icon);
    }
    entry_elem.appendChild(details);
    entry_elem.appendChild(note);

    // Now add the row to the table and the event handlers for the cool effects
    /*
    row = document.createElement('tr');
    row.setAttribute("onclick", "toggleEntryDetails(this, true)");
    //row.setAttribute("title", "Click to view details");
    row.appendChild(entry_date);
    row.appendChild(entry_elem);
    journalTable.appendChild(row);
    */
    // row_count++;
    // console.log("Added a row: ", row_count);

    if (row != undefined) delete row;
    if (cell != undefined) delete cell;
    //if (entry_date != undefined) delete entry_date;
    //if (entry_elem != undefined) delete entry_elem;

    //if (i != undefined) delete i;
    if (details != undefined) delete details;
    if (hasNoBlade != undefined) delete hasNoBlade;

    return true;
}

/* FILTERING */
function filterData(filter) {
    var tab = tabsObj.CurrentTab;
    var parsed_filter = null;
    var entries_var = null;
    var sample_obj = null;
    switch (tab) {
    case 1: // Reviews
            entries_var = "reviewData";
            sample_obj = ShavingReviewedProducts[0];
            break;
    case 2: // Trends
    case 0: // Journal
            entries_var = "entries[i]";
            sample_obj = ShavingJournalEntries[0];
            break;
    }
    console.log("HERE ("+tab+"): ", filter, entries_var);

        if (filter != null && entries_var != null) {
                console.log("R FILTER: ", filter);
                var entry_props = [];
                for (var p in sample_obj) {
                    if (p == "equals" || p == "contains" || 
                            p == "search" || p.charAt(0) == "_") {
                        continue;
                    }
                    entry_props.push(p);
                }
                var parsed_filter = parseFilter(entries_var, entry_props, filter);
                console.log("R PARSED FILTER: ", parsed_filter);
                document.getElementById('hg_journal_filter_exp').value = filter;
        }

    switch (tab) {
    case 0: // Journal
            loadShavingJournal(0, "DESC", parsed_filter);
            filterMsg.innerHTML = "Showing "+displayed_entries+" entries";
            break;
    case 1: // Reviews
            loadShavingReviews(0, "DESC", "TYPE", parsed_filter);
            refreshReviews();
            filterMsg.innerHTML = "Showing "+displayed_reviews+" reviews";
            //if (displayed_reviews > 0)
                tabsObj.NestedTabs[1].ToggleTab(0);    
            break;
    case 2: // Trends
            //loadTrends(0, "DESC", parsed_filter);
            break;
    }

}
var filter_operators = ["||", "&&"];
function parseFilter(entries_var, entry_props, filter) {
    console.log("parseFilter("+filter+")");
    var tree = "";
    var operator = "||"; 
    var filter_boom = "";
    if (filter == null) return tree;

    // Split at the operator
    for (var o = 0; o < filter_operators.length; o++) {
        operator = filter_operators[o];
        if (filter.indexOf(operator) != -1) {
            filter_boom = filter.split(operator);
            break;
        }
    }

    if (filter_boom.length > 0) {
        for (var i = 0; i < filter_boom.length; i++) {
            if (i != 0) tree += " "+operator+" ";
            tree += parseFilter(entries_var, entry_props,
                        filter_boom[i].replace(/^\s+/, "").replace(/\s+$/, "")
                    );
        }
    } else if (filter.indexOf(":")) {
        var operand = filter.replace(/\s*:\s*/, ":").split(":");
        if (operand.length == 1 || operand[0] == "*") {
            var search_term = (operand.length == 1) ? operand[0] : operand[1];
            //search_term = "/"+search_term+"/g";
            search_term = "\""+search_term+"\"";
            var everything = "(";
            for (var i = entry_props.length-1; i >= 0; i--) {
                var p = entry_props[i];
                var entry = entries_var+"[\""+p+"\"]";
                everything += "("+entry+" != null && "+ 
                    "(("+entry+".search) ? ("+entry+".search("+search_term+") != -1) "+
                    ": ("+entry+".toString().search("+search_term+") != -1)))";
                if (i > 0) everything += " || ";
            }
            everything += ")";
            return everything;
        } else {
            if (operand[0].indexOf("/") != -1)
                operand[0] = "[\""+operand[0]+"\"]";
            else
                operand[0] = "."+operand[0];
            var op = entries_var+operand[0];
            //var op = entries_var+"[\""+operand[0]+"\"]";

            //if (operand[1].toLowerCase() == "true" || 
                //operand[1].toLowerCase() == "false") {
                //return op+" == "+operand[1];
            //} else { 

            if (operand[0].indexOf("Date") != -1)
                op = "HG_formatDate("+op+")";

            operand[1] = operand[1].replace(/'/, "\'");
            if (operand[0] != ".*") {
                return "("+op+" == "+operand[1]+
                        " || ("+op+".search && "+op+".search('"+operand[1]+"') != -1))";
                //return op+".search('"+operand[1]+"') != -1 || "+op+" == "+operand[1];
            }
            //}
        }
    }
    return tree;
}

var filter_busy = false;
function filterFocusToggle(focus_flag) {
    if (filterBox == null) filterBox = document.getElementById("hg_journal_filter_exp");
    var filter_classes = filterBox.getAttribute("class");
    if (focus_flag) {
        filterBox.focus();
        filterBox.select();
        filterBox.setAttribute("class", filter_classes+" list_filter_focus");
        filter_busy = true;
    } else {
        filterBox.blur();
        filterBox.setAttribute("class", filter_classes.replace(" list_filter_focus", ""));
        setStyle(filterBox, "background-color: "+((filterBox.value.length <= 0) ? "#fff" : "#FFEA84"));
        filter_busy = false;
    }    
    switch (tabsObj.CurrentTab) {
    case 1: // Reviews
            tabsObj.NestedTabs[1].IgnoreKeyboard = focus_flag; 
    case 0: // Journal
            tabsObj.IgnoreKeyboard = focus_flag; 
            break;
    }
}

/* MISC */
var active_filters = [null, null, null];
function onTabToggle(from, to) {
    console.log("onTabToggle("+from+", "+to+")");
    if (filterBox == null) filterBox = document.getElementById("hg_journal_filter_exp");
    var filterLyr = document.getElementById("hg_journal_filter");
    if (filterMsg == null) filterMsg = filterLyr.getElementsByTagName("span")[0];

    if (to == 0) enableJournalNav();
    else disableJournalNav();

    var tabbed_prod_lists = ['list_creams', 'list_soaps', 'list_blades', 'list_strops'];

    // Actions to do based on the source tab
    switch (from) {
    case 0: // Journal
    case 1: // Reviews
        if (filterBox.value != null && filterBox.value.length > 0)
            active_filters[from] = filterBox.value;
        break;
    case 2: // Trends
            break;
    default: break;
    }

    // Actions to do based on the target tab
    switch (to) {
    case 1: // Reviews
    case 0: // Journal
            if (active_filters[to] != null) {
                filterBox.value = active_filters[to];
                active_filters[to] = null;
            } else if (filterBox.value.length > 0) {
                filterBox.value = "";
            }
            setStyle(filterLyr, "visibility: visible;");
            setStyle(filterMsg, "visibility: visible;");
            setStyle(filterBox, "visibility: visible;"+
                                "background-color: "+((filterBox.value.length <= 0) 
                                                        ? "#fff" : "#FFEA84"));

            switch (to) {
            case 0: filterMsg.innerHTML = "Showing "+displayed_entries+" entries"; break;
            case 1: filterMsg.innerHTML = "Showing "+displayed_reviews+" reviews"; break;
            default: filterMsg.innerHTML = ""; break;
            }
            tabsObj.IgnoreKeyboard = false; 
            if (tabsObj.NestedTabs.length >= 4)
                tabsObj.NestedTabs[3].IgnoreKeyboard = false; 
            break;
    case 2: // Trends
    default:
            setStyle(filterLyr, "visibility: hidden;");
            setStyle(filterMsg, "visibility: hidden;");
            setStyle(filterBox, "visibility: hidden;");
            tabsObj.IgnoreKeyboard = true; 
            tabsObj.NestedTabs[3].IgnoreKeyboard = true; 
            break;
    }
}


/*=============================================================*/
function loadExtras() {
    sortJournalEntries();
    sortProducts();

    if (ShavingCombos == null || ShavingCombos.length <= 0) createShavingCombos();
    //loadTrends();

    var exclusion_list = exclusion_list = ["Trends"];

                                             // function() {
                                             //  loadShavingJournal(0, "DESC", null);
                                             // }),
    HG_loadJournalViews([new HG_Journals_View("ShavingJournalEntries", 
                                              ["Date", "Grade"],
                                              "journal_tab", 
                                              "renderShavingJournalEntry",
                                              null),
                         new HG_Journals_View("ShavingReviewedProducts", 
                                               null,
                                              "review_tabs", 
                                              function() {
                                                loadShavingReviews(0, "DESC", "TYPE", null);
                                              },
                                              null)

                        ], exclusion_list);

    // Journal tab TODO: this needs to happen on each resize
    var journal_lyr = document.getElementById('journal_scroller');
    //setStyle(journal_lyr, "height: "+parseInt(document.documentElement.clientHeight-310)+"px;");

    HG_Journal_tabsObj.AddToggleListener(onTabToggle);

    enableJournalNav();
}

function HG_Journal_local_init() {
    getShavingData(loadExtras);
}

