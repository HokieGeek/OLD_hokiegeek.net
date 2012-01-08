var tabsObj=null;
function renderShavingJournalEntry2(c,a){var f=a.Tea.Pictures[0]==void 0?"img/tea_cup_greyed.png":a.Tea.Pictures[0].getURL(120),g=$("<td></td>");g.append($("<div></div>").addClass("tea_journal_entry_name").append(a.Tea.getName()+" ("+a.Tea.getType()+")"));var b=a.Fixins;if(b!=null){for(var e=$("<div></div>").addClass("tea_journal_entry_fixins").append("with "),d=b.length-1;d>=0;d--)d==0?e.append(" and "):d!=b.length-1&&e.append(", "),e.append(b[d].toLowerCase());g.first().append(e)}b=$("<div></div>").addClass("tea_journal_entry_steeping_details").append("Steeped ");
a.SteepTime!=null&&b.append("for ").append($("<i></i>").append(formatSteepTime(a.SteepTime)+" "));a.Temperature!=null&&b.append("at ").append($("<i></i>").append(a.Temperature+"&deg;F "));a.SteepingVessel!=null&&b.append("using the "+a.SteepingVessel.toLowerCase());g.append(b);b=$("<div></div>").addClass("tea_journal_entry_rating");for(e=0;e<4;e++)d="img/tea_cup",e>a.Rating-1&&(d+="_greyed"),d+=".png",b.append($("<img/>").attr("src",d).attr("title",a.Rating+"/4 steaming tea cups"));g.append(b);$(c).append($("<tr></tr>").append($("<td></td>").addClass("tea_journal_entry_picture").append($("<img/>").attr("src",
f))).append($("<td></td>").append(g)));return!0}
function renderShavingJournalEntry(c,a){var f=null,g=null,b=document.createElement("img");a.Tea.Pictures[0]==void 0?b.setAttribute("src","img/tea_cup_greyed.png"):b.setAttribute("src",a.Tea.Pictures[0].getURL(120));f=document.createElement("tr");g=document.createElement("td");g.setAttribute("class","tea_journal_entry_picture");g.appendChild(b);f.appendChild(g);g=document.createElement("td");b=document.createElement("div");b.setAttribute("class","tea_journal_entry_name");b.appendChild(document.createTextNode(a.Tea.getName()));
b.appendChild(document.createTextNode(" ("+a.Tea.getType()+")"));var e=a.Fixins;if(e!=null){var d=document.createElement("div");d.setAttribute("class","tea_journal_entry_fixins");d.innerHTML="with ";for(var h=e.length-1;h>=0;h--)h==0?d.innerHTML+=" and ":h!=e.length-1&&(d.innerHTML+=", "),d.innerHTML+=e[h].toLowerCase();b.appendChild(d)}g.appendChild(b);b=document.createElement("div");b.setAttribute("class","tea_journal_entry_steeping_details");b.innerHTML="Steeped ";a.SteepTime!=null&&(b.innerHTML+=
"for <i>"+formatSteepTime(a.SteepTime)+"</i> ");a.Temperature!=null&&(b.innerHTML+="at <i>"+a.Temperature+"&deg;F</i> ");a.SteepingVessel!=null&&(b.innerHTML+="using the "+a.SteepingVessel.toLowerCase());g.appendChild(b);e=document.createElement("div");e.setAttribute("class","tea_journal_entry_rating");for(d=0;d<4;d++)b=document.createElement("img"),h="img/tea_cup",d>a.Rating-1&&(h+="_greyed"),h+=".png",b.setAttribute("src",h),b.setAttribute("title",a.Rating+"/4 steaming tea cups"),e.appendChild(b);
g.appendChild(e);f.appendChild(g);c.appendChild(f);f!=void 0&&delete f;g!=void 0&&delete g;return!0}
function loadTeaJournal(){for(var c=$("<table></table>"),a=0;a<TeaJournalEntries.length;a++){var f=TeaJournalEntries[a];console.log("loadTeaJournal(): ",TeaJournalEntries[a]);c.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(f.EntryDate)))).append($("<td></td>").append(f.Tea.getName())))}$("#journal_tab").append(c);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function renderTeaJournalEntry(c){for(var a=$("<table></table>"),f=0;f<TeaJournalEntries.length;f++)c=TeaJournalEntries[f],console.log("loadTeaJournal(): ",TeaJournalEntries[f]),a.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(c.EntryDate)))).append($("<td></td>").append(c.Tea.getName())));$("#journal_tab").append(a);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function createRatingWidget(c){for(var a=$("<span></span>"),f=1;f<=4;f++)a.append($("<img/>").attr("src","http://tea.hokiegeek.net/img/tea_cup"+(f>c?"_greyed":"")+".png"));return a}
function renderTeaProductEntry(c){var a=c.Pictures[0]==void 0?"img/tea_cup_greyed.png":c.Pictures[0].getURL(140),a=$("<img />").attr("src",a),f="";c.PurchasePrice!=null&&(f+="$"+c.PurchasePrice+" ");c.PurchaseLocation!=null&&(f+="from "+c.PurchaseLocation+" ");c.PurchaseDate!=null&&(f+="on "+HG_formatDate(c.PurchaseDate));var g="";c.Size!=void 0&&(g+=c.Size+" ");g+=c.getPackaging();for(var b=0,e=0,d=c.getJournalEntries(),h=0;h<d.length;h++)d[h].Rating>1&&(b+=parseInt(d[h].SteepTime)),e+=parseInt(d[h].Rating);
b>0?(b/=d.length,b=formatSteepTime(b)):b="N/A";e/=d.length;d=$("<table></table>");if(c.Ratings.length<=0)d.append($("<tr></tr>").append("<td></td>").append("Unrated"));else{e>=0&&d.append($("<tr></tr>").attr("title","Taste Rating: Averaged from all journal entries").append($("<td></td>").append("Taste")).append($("<td></td>").append(createRatingWidget(Math.ceil(e)))));for(e=0;e<c.Ratings.length;e++)d.append($("<tr></tr>").append($("<td></td>").append(TeaProductRatings[e])).append($("<td></td>").append(createRatingWidget(c.Ratings[e]))))}e=
$("<table></table>").addClass("tea_product_entry_details");c.Type!="Blend"&&e.append($("<tr></tr>").append($("<td></td>").append("Origin")).append($("<td></td>").append(c.getOrigin())).append($("<td></td>").append("Price")).append($("<td></td>").append(f)));e.append($("<tr></tr>").append($("<td></td>").append("Packaging")).append($("<td></td>").append(g)).append($("<td></td>").append("Steep Time")).append($("<td></td>").append(b).attr("title","Steep Time: Averaged from best journal entries"))).append($("<tr></tr>").addClass("tea_product_entry_ratings").append($("<td></td>").append("Ratings")).append($("<td></td>").append(d)));
c=$("<table></table>").append($("<tr></tr>").addClass("tea_product_entry_name").append($("<td></td>").append(c.getName()+" ["+c.ID+"]").append($("<span></span>").append(c.Stocked?"":"X")))).append($("<tr></tr>").append($("<td></td>").append(e)));return $("<tr></tr>").addClass("tea_product_entry").append($("<td></td>").addClass("tea_product_entry_pics").append(a)).append($("<td></td>").append(c))}
function loadTeaProducts(c,a,f,g){console.log("loadTeaProducts(",c,", ",a,", ",f,", ",g,")");$("<table></table>");c={};for(a=0;a<TeaProductEntries.length;a++){var g=TeaProductEntries[a],b=g[f];c[b]==void 0&&(c[b]=$("<table></table>"));c[b].append(renderTeaProductEntry(g))}for(b in c)$("#products_tab").append($("<div></div>").addClass("tab").append($("<span></span>").addClass("tab_name").append(b)).append($("<div></div>").addClass("tab_content").append($("<div></div>").addClass("products_scroller").append(c[b]))))}
function loadExtras(){sortTeaJournal();sortTeaProducts();HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries",null,"journal_tab","renderShavingJournalEntry2","%vague"),new HG_Journals_View("TeaProductEntries",null,"products_tab",function(){loadTeaProducts(0,"DESC","Type",null)},null)],null)}function HG_Journal_local_init(){getTeaData(loadExtras)};
