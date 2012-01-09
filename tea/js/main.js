var filteredTabsHeight=45;
function renderShavingJournalEntry(a,b){var d=b.Tea.Pictures[0]==void 0?"img/tea_cup_greyed.png":b.Tea.Pictures[0].getURL(120),g=$("<td></td>");g.append($("<div></div>").addClass("tea_journal_entry_name").append(b.Tea.getName()+" ("+b.Tea.getType()+")"));var c=b.Fixins;if(c!=null){for(var e=$("<div></div>").addClass("tea_journal_entry_fixins").append("with "),f=c.length-1;f>=0;f--)f==0?e.append(" and "):f!=c.length-1&&e.append(", "),e.append(c[f].toLowerCase());g.first().append(e)}c=$("<div></div>").addClass("tea_journal_entry_steeping_details").append("Steeped ");
b.SteepTime!=null&&c.append("for ").append($("<i></i>").append(formatSteepTime(b.SteepTime)+" "));b.Temperature!=null&&c.append("at ").append($("<i></i>").append(b.Temperature+"&deg;F "));b.SteepingVessel!=null&&c.append("using the "+b.SteepingVessel.toLowerCase());g.append(c);c=$("<div></div>").addClass("tea_journal_entry_rating");for(e=0;e<4;e++)f="img/tea_cup",e>b.Rating-1&&(f+="_greyed"),f+=".png",c.append($("<img/>").attr("src",f).attr("title",b.Rating+"/4 steaming tea cups"));g.append(c);$(a).append($("<tr></tr>").append($("<td></td>").addClass("tea_journal_entry_picture").append($("<img/>").attr("src",
d))).append($("<td></td>").append(g)));return!0}function loadTeaJournal(){for(var a=$("<table></table>"),b=0;b<TeaJournalEntries.length;b++){var d=TeaJournalEntries[b];console.log("loadTeaJournal(): ",TeaJournalEntries[b]);a.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(d.EntryDate)))).append($("<td></td>").append(d.Tea.getName())))}$("#journal_tab").append(a);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function renderTeaJournalEntry(a){for(var b=$("<table></table>"),d=0;d<TeaJournalEntries.length;d++)a=TeaJournalEntries[d],console.log("loadTeaJournal(): ",TeaJournalEntries[d]),b.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(a.EntryDate)))).append($("<td></td>").append(a.Tea.getName())));$("#journal_tab").append(b);displayed_entries=TeaJournalEntries.length}
function createRatingWidget(a){for(var b=$("<span></span>"),d=1;d<=4;d++)b.append($("<img/>").attr("src","http://tea.hokiegeek.net/img/tea_cup"+(d>a?"_greyed":"")+".png"));return b}
function renderTeaProductEntry(a){var b=a.Pictures[0]==void 0?"img/tea_cup_greyed.png":a.Pictures[0].getURL(140),b=$("<img />").attr("src",b),d="";a.PurchasePrice!=null&&(d+="$"+a.PurchasePrice+" ");a.PurchaseLocation!=null&&(d+="from "+a.PurchaseLocation+" ");a.PurchaseDate!=null&&(d+="on "+HG_formatDate(a.PurchaseDate));var g="";a.Size!=void 0&&(g+=a.Size+" ");g+=a.Packaging;for(var c=0,e=0,f=a.getJournalEntries(),h=0;h<f.length;h++)f[h].Rating>1&&(c+=parseInt(f[h].SteepTime)),e+=parseInt(f[h].Rating);
c>0?(c/=f.length,c=formatSteepTime(c)):c="N/A";e/=f.length;f=$("<table></table>");if(a.Ratings.length<=0)f.append($("<tr></tr>").append("<td></td>").append("Unrated"));else{e>=0&&f.append($("<tr></tr>").attr("title","Taste Rating: Averaged from all journal entries").append($("<td></td>").append("Taste")).append($("<td></td>").append(createRatingWidget(Math.ceil(e)))));for(e=0;e<a.Ratings.length;e++)f.append($("<tr></tr>").append($("<td></td>").append(TeaProductRatings[e])).append($("<td></td>").append(createRatingWidget(a.Ratings[e]))))}e=
$("<table></table>").addClass("tea_product_entry_details");a.Type!="Blend"&&e.append($("<tr></tr>").append($("<td></td>").append("Origin")).append($("<td></td>").append(a.getOrigin())).append($("<td></td>").append("Price")).append($("<td></td>").append(d)));e.append($("<tr></tr>").append($("<td></td>").append("Packaging")).append($("<td></td>").append(g)).append($("<td></td>").append("Steep Time")).append($("<td></td>").append(c).attr("title","Steep Time: Averaged from best journal entries"))).append($("<tr></tr>").addClass("tea_product_entry_ratings").append($("<td></td>").append("Ratings")).append($("<td></td>").append(f)));
a=$("<table></table>").append($("<tr></tr>").addClass("tea_product_entry_name").append($("<td></td>").append(a.getName()+" ["+a.ID+"]").append($("<span></span>").append(a.Stocked?"":"X")))).append($("<tr></tr>").append($("<td></td>").append(e)));return $("<tr></tr>").addClass("tea_product_entry").append($("<td></td>").addClass("tea_product_entry_pics").append(b)).append($("<td></td>").append(a))}
function createTeaProductsControls(a,b,d){console.log("createTeaProductsControls(",a,", ",b,", ",d,")");for(var b=["Type","Country","Year","Stocked","Aging","Packaging","PurchaseLocation"],a=$("<select></select>").attr("onchange","loadTeaProducts("+a+", 'DESC', this.value, null); refreshProducts(0);"),g=0;g<b.length;g++){var c=$("<option></option>").attr("value",b[g]).append(b[g]);b[g]==d&&c.attr("selected","true");a.append(c)}return $("<span></span>").append($("<div></div>").append($("<span></span>").append("Group:")).append(a))}
function loadTeaProducts(a,b,d,g){console.log("loadTeaProducts(",a,", ",b,", ",d,", ",g,")");$("#products_tabs").html("");$("#products_controls").html("").append(createTeaProductsControls(a,b,d));a={};for(b=0;b<TeaProductEntries.length;b++){var g=TeaProductEntries[b],c=g[d];c==void 0&&(c="Unknown");a[c]==void 0&&(a[c]=$("<table></table>"));a[c].append(renderTeaProductEntry(g))}for(c in a)$("#products_tabs").append($("<div></div>").addClass("tab").append($("<span></span>").addClass("tab_name").append(c)).append($("<div></div>").addClass("tab_content").append($("<div></div>").addClass("products_scroller").append(a[c]))));
displayed_entries=TeaProductEntries.length}function refreshProducts(a){console.log("refreshProducts(",a,")");$("#products_tabs").children("div").css("height",parseInt(document.documentElement.clientHeight-filteredTabsHeight));HG_Journal_tabsObj.NestedTabs[1].ReloadTabs();HG_Journal_tabsObj.NestedTabs[1].ToggleTab(a!=void 0&&a!=null?a:0)}
function loadExtras(){sortTeaJournal();sortTeaProducts();HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries",null,"journal_tab","renderShavingJournalEntry","%vague"),new HG_Journals_View("TeaProductEntries",null,"products_tab",function(){loadTeaProducts(0,"DESC","Type",null)},null)],null)}function HG_Journal_local_init(){getTeaData(loadExtras)};
