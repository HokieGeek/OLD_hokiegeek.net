var filteredTabsHeight = 75;
var displayed_teas = 0;

function renderShavingJournalEntry(entry_elem, entry, num_displayed) {
    //console.log("renderShavingJournalEntry(", entry, ", ", num_displayed, ")");
    var pic = ((entry.Tea.Pictures[0] == undefined) ? "img/tea_cup_greyed.png" : entry.Tea.Pictures[0].getURL(120));

    var main = $("<td></td>");
    
    // Name
    main.append($("<div></div>").addClass("tea_journal_entry_name")
                                .append(entry.Tea.getName())
                                .append($("<div></div>").addClass("tea_journal_entry_type")
                                                        .append("&lt;"+entry.Tea.getType().toLowerCase()+"&gt;"))
                                );

    // Fixins
    var tea_fixins = entry.Fixins;
    if (tea_fixins != null) {
        var fixins_list = $("<div></div>").addClass("tea_journal_entry_fixins").append("with ");

        for (var i = tea_fixins.length-1; i >= 0; i--) {
            if (i == 0 && tea_fixins.length > 1)
                fixins_list.append(" and ");
            else if (i != tea_fixins.length-1)
                fixins_list.append(", ");
            fixins_list.append(tea_fixins[i].toLowerCase());
        }
        main.first().append(fixins_list);
    } 

    var steeping_details = $("<div></div>").addClass("tea_journal_entry_steeping_details")
                                           .append("Steeped ");
    // .append(getVagueTime(entry.Date).toLowerCase())

    if (entry.SteepTime != null)
        steeping_details.append("for ").append($("<i></i>").append(formatSteepTime(entry.SteepTime)+" "));
    if (entry.Temperature != null)
        steeping_details.append("at ").append($("<i></i>").append(entry.Temperature+"&deg;F "));
    if (entry.SteepingVessel != null)
        steeping_details.append("using the "+entry.getSteepingVessel().toLowerCase());
    main.append(steeping_details);

    // Rating
    var tea_ratings_num = 4;
    var rating = $("<div></div>").addClass("tea_journal_entry_rating");
    for (var ii = 0; ii < tea_ratings_num; ii++) {
        var img_src = "img/tea_cup";
        if (ii > entry.Rating-1) img_src += "_greyed";
        img_src += ".png";

        rating.append($("<img/>").attr("src", img_src)
                                 .attr("title", entry.Rating+"/"+tea_ratings_num+" steaming tea cups"));
    }
    main.append(rating);

    $(entry_elem).append($("<tr></tr>")
        // Add the tea image
        .append($("<td></td>").addClass("tea_journal_entry_picture").append($("<img/>").attr("src", pic)))
        .append($("<td></td>").append(main))
    );

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
    // console.log("Done adding journal entries");
}

function createRatingWidget(rating) {
    var widget = $("<span></span>");
            //.width("20px").css("padding-right", "5px")
    for (var i = 1; i <= 4; i++) {
        widget.append(
            $("<img/>")
                .attr("src", "http://tea.hokiegeek.net/img/tea_cup"+((i > rating) ? "_greyed" : "")+".png"));
    }
    return widget;
}

function renderTeaProductEntry(entry) {
    /* TODO
     *     - Pics slideshow
     *     - Stocked
     *     - Review Date?
     *     - Comments
     *
     *  - Count taste ratings in blended teas too?
     *  - Need to spread the ratings into two columns
     */
        //> Build the pictures widget
        var pic = ((entry.Pictures[0] == undefined) ? "img/tea_cup_greyed.png" : entry.Pictures[0].getURL(140));
        var pics = $("<img />").attr("src", pic);

        //> Build the purchase and packging info
        var purchaseInfo = "";
        if (entry.PurchasePrice != null) purchaseInfo += "$"+entry.PurchasePrice+" ";
        if (entry.PurchaseLocation != null) purchaseInfo += "from "+entry.PurchaseLocation+" ";
        if (entry.PurchaseDate != null) purchaseInfo += "on "+HG_formatDate(entry.PurchaseDate);
        var packaging = "";
        if (entry.Size != undefined) packaging += entry.Size+" ";
        packaging += entry.Packaging;

        //> Get average steep time and taste ratings
        var steepTime = 0;
        var tasteRating = 0;
        var journalEntries = entry.getJournalEntries();
        for (var jj = 0; jj < journalEntries.length; jj++) {
            if (journalEntries[jj].Rating > 1)
                steepTime += parseInt(journalEntries[jj].SteepTime);

            tasteRating += parseInt(journalEntries[jj].Rating);
        }
        if (steepTime > 0) {
            steepTime /= journalEntries.length;
            steepTime = formatSteepTime(steepTime);
        } else 
            steepTime = "N/A";

        tasteRating /= journalEntries.length;

        //> Build the ratings
        var ratings = $("<table></table>");
        if (entry.Ratings.length <= 0) {
            ratings.append($("<tr></tr>").append("<td></td>").append("Unrated"));
        } else {
            if (tasteRating >= 0) {
                ratings.append($("<tr></tr>").attr("title", "Taste Rating: Averaged from all journal entries")
                                             .append($("<td></td>").append("Taste"))
                                             .append($("<td></td>").append(createRatingWidget(Math.ceil(tasteRating)))));
            }
            // for (rating in entry.Ratings) {
            for (var rating = 0; rating < entry.Ratings.length; rating++) {
                ratings.append($("<tr></tr>").append($("<td></td>").append(TeaProductRatings[rating]))
                                             .append($("<td></td>").append(createRatingWidget(entry.Ratings[rating]))));
            }
        }

        //> Build the details
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
            .append($("<tr></tr>").addClass("tea_product_entry_ratings")
                                  .append($("<td></td>").append("Ratings"))
                                  .append($("<td></td>").append(ratings)))
        ;

        //> Build the name and append the details
        var main = $("<table></table>")
            .append($("<tr></tr>").addClass("tea_product_entry_name")
                                  .append($("<td></td>").append(entry.getName())
                                                        .append($("<span></span>").append((entry.Stocked ? "" : "drank it all")))
                                                        )
                    )
            .append($("<tr></tr>").append($("<td></td>").append(details)))
        ;
                                                        //.append($("<span></span>").append((entry.Stocked ? "" : "unavailable")))
                                  // .append($("<td></td>").append(entry.getName()+" ["+entry.ID+"]")

    return ($("<tr></tr>").addClass("tea_product_entry")
                          .append($("<td></td>").addClass("tea_product_entry_pics").append(pics))
                          .append($("<td></td>").append(main)));
}

function createTeaProductsControls(sort_field, sort_dir, sort_group) {
    console.log("createTeaProductsControls(", sort_field, ", ", sort_dir, ", ", sort_group, ")");
    var groups = ["Type", "Country", "Year", "Stocked", "Aging", "Packaging", "PurchaseLocation"];

    var groups_list = $("<select></select>")
                        .attr("onchange", "loadTeaProducts("+sort_field+", 'DESC', this.value, null); refreshProducts(0);");  
                                                                            // TODO: Does a null filter make sense?
    for (var ii = 0; ii < groups.length; ii++) {
        var opt = $("<option></option>").attr("value", groups[ii]).append(groups[ii]);
        if (groups[ii] == sort_group) opt.attr("selected", "true");
        groups_list.append(opt);
    }

    return $("<span></span>")
            .append($("<div></div>").append($("<span></span>").append("Group:")).append(groups_list))

    ;
            //.append($("<div></div>").append($("<span></span>").append("Sort:")))
}

function loadTeaProducts(sort_field, sort_dir, sort_group, filter) {
     console.log("loadTeaProducts(", sort_field, ", ", sort_dir, ", ", sort_group, ", ", filter, ")");
    /*  TODO
     *  - Would like to alphabetically sort the groups...
     *  - Apply 'filter'
     *  - Sort the entries
     */

    $("#products_tabs").html("");

    $("#products_controls").html("").append(createTeaProductsControls(sort_field, sort_dir, sort_group));

    var groups = {};
    var group_names = [];
    for (var ii = 0; ii < TeaProductEntries.length; ii++) {
        var entry = TeaProductEntries[ii];

        var group = entry[sort_group];
        if (group == undefined) group = "Unknown";

        if (groups[group] == undefined) groups[group] = $("<table></table>");
        groups[group].append(renderTeaProductEntry(entry));

        if (!group_names.contains(group.toString()))
            group_names.push(group.toString());
    }
    group_names.sort();

    // Add the various groups to the main tab
    //for (group in groups) {
    for (var ii = 0; ii < group_names.length; ii++) {
        var group = group_names[ii];
        $("#products_tabs").append(
            $("<div></div>").addClass("tab")
                            .append($("<span></span>").addClass("tab_name").append(group))
                            .append($("<div></div>").addClass("tab_content")
                                                    .append($("<div></div>").addClass("products_scroller")
                                                                            .append(groups[group])))
         );
    }

    displayed_teas = TeaProductEntries.length;
}

function refreshProducts(tab) {
    console.log("refreshProducts(", tab, ")");

    // resize
    $("#products_tabs").children("div")
                       .css("height", parseInt(document.documentElement.clientHeight-filteredTabsHeight));

    HG_Journal_tabsObj.NestedTabs[1].ReloadTabs();
    HG_Journal_tabsObj.NestedTabs[1].ToggleTab(((tab != undefined && tab != null) ? tab : 0));
}

function onTabToggle(from, to) {
    switch (to) {
    case 0: filterMsg.innerHTML = "Showing "+displayed_entries+" entries"; break; // Journal
    case 1: filterMsg.innerHTML = "Showing "+displayed_teas+" teas"; break; // Teas
    // case 0: $(filterMsg).html("Showing "+displayed_entries+" entries"); break; // Journal
    // case 1: $(filterMsg).html("Showing "+displayed_teas+" teas"); break; // Teas
    }
}

function loadExtras() {
    sortTeaJournal();
    sortTeaProducts();

    HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries", 
                                              null,
                                              "journal_tab", 
                                              "renderShavingJournalEntry",
                                              "%vague",
                                              2),
                         new HG_Journals_View("TeaProductEntries", 
                                              null,
                                              "products_tab", 
                                              function() {
                                                loadTeaProducts(0, "DESC", "Type", null);
                                              },
                                              null) 
                        ], 
                        null);

    HG_Journal_tabsObj.AddToggleListener(onTabToggle);
}

function HG_Journal_local_init() {
    getTeaData(loadExtras);
}
