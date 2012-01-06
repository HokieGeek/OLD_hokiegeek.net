var tabsObj=null;
function renderShavingJournalEntry(f,c){var a=null,g=null,d=document.createElement("img");c.Tea.Pictures[0]==void 0?d.setAttribute("src","img/tea_cup_greyed.png"):d.setAttribute("src",c.Tea.Pictures[0].getURL(120));a=document.createElement("tr");g=document.createElement("td");g.appendChild(d);a.appendChild(g);g=document.createElement("td");d=document.createElement("div");d.setAttribute("class","tea_journal_entry_name");d.appendChild(document.createTextNode(c.Tea.getName()));d.appendChild(document.createTextNode(" ("+c.Tea.getType()+
")"));var h=c.Fixins;if(h!=null){var e=document.createElement("div");e.setAttribute("class","tea_journal_entry_fixins");e.innerHTML="with ";for(var b=h.length-1;b>=0;b--)b==0?e.innerHTML+=" and ":b!=h.length-1&&(e.innerHTML+=", "),e.innerHTML+=h[b].toLowerCase();d.appendChild(e)}g.appendChild(d);h=document.createElement("div");h.setAttribute("class","tea_journal_entry_rating");for(e=0;e<4;e++)d=document.createElement("img"),b="img/tea_cup",e>c.Rating-1&&(b+="_greyed"),b+=".png",d.setAttribute("src",
b),d.setAttribute("title",c.Rating+"/4 steaming tea cups"),h.appendChild(d);g.appendChild(h);a.appendChild(g);f.appendChild(a);a!=void 0&&delete a;g!=void 0&&delete g;return!0}
function loadTeaJournal(){for(var f=$("<table></table>"),c=0;c<TeaJournalEntries.length;c++){var a=TeaJournalEntries[c];console.log("loadTeaJournal(): ",TeaJournalEntries[c]);f.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(a.EntryDate)))).append($("<td></td>").append(a.Tea.getName())))}$("#journal_tab").append(f);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function renderTeaJournalEntry(f){for(var c=$("<table></table>"),a=0;a<TeaJournalEntries.length;a++)f=TeaJournalEntries[a],console.log("loadTeaJournal(): ",TeaJournalEntries[a]),c.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(f.EntryDate)))).append($("<td></td>").append(f.Tea.getName())));$("#journal_tab").append(c);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function createRatingWidget(f){for(var c=$("<span></span>"),a=1;a<=4;a++)c.append($("<img/>").attr("src","http://tea.hokiegeek.net/img/tea_cup"+(a>f?"_greyed":"")+".png"));return c}
function loadTeaProducts(){for(var f=$("<table></table>"),c=0;c<TeaProductEntries.length;c++){var a=TeaProductEntries[c],g=a.Pictures[0]==void 0?"img/tea_cup_greyed.png":a.Pictures[0].getURL(140),g=$("<img />").attr("src",g),d="";a.PurchasePrice!=null&&(d+="$"+a.PurchasePrice+" ");a.PurchaseLocation!=null&&(d+="from "+a.PurchaseLocation+" ");a.PurchaseDate!=null&&(d+="on "+HG_formatDate(a.PurchaseDate));var h="";a.Size!=void 0&&(h+=a.Size+" ");h+=a.getPackaging();for(var e=0,b=0,i=a.getJournalEntries(),
j=0;j<i.length;j++)i[j].Rating>1&&(e+=parseInt(i[j].SteepTime)),b+=parseInt(i[j].Rating);e>0?(e/=i.length,e=formatSteepTime(e)):e="N/A";b/=i.length;i=$("<table></table>");if(a.Ratings.length<=0)i.append($("<tr></tr>").append("<td></td>").append("Unrated"));else{b>=0&&i.append($("<tr></tr>").attr("title","Taste Rating: Averaged from all journal entries").append($("<td></td>").append("Taste")).append($("<td></td>").append(createRatingWidget(Math.ceil(b)))));for(b=0;b<a.Ratings.length;b++)i.append($("<tr></tr>").append($("<td></td>").append(TeaProductRatings[b])).append($("<td></td>").append(createRatingWidget(a.Ratings[b]))))}b=
$("<table></table>").addClass("tea_product_entry_details");a.Type!="Blend"&&b.append($("<tr></tr>").append($("<td></td>").append("Origin")).append($("<td></td>").append(a.getOrigin())).append($("<td></td>").append("Price")).append($("<td></td>").append(d)));b.append($("<tr></tr>").append($("<td></td>").append("Packaging")).append($("<td></td>").append(h)).append($("<td></td>").append("Steep Time")).append($("<td></td>").append(e).attr("title","Steep Time: Averaged from best journal entries"))).append($("<tr></tr>").addClass("tea_product_entry_ratings").append($("<td></td>").append("Ratings")).append($("<td></td>").append(i)));
a=$("<table></table>").append($("<tr></tr>").addClass("tea_product_entry_name").append($("<td></td>").append(a.getName()+" ["+a.ID+"]").append($("<span></span>").append(a.Stocked?"":"X")).append($("<div></div>").addClass("tea_product_entry_type").append("&lt;"+a.getType().toLowerCase()+"&gt;")))).append($("<tr></tr>").append($("<td></td>").append(b)));f.append($("<tr></tr>").addClass("tea_product_entry").append($("<td></td>").addClass("tea_product_entry_pics").append(g)).append($("<td></td>").append(a)))}$("#products_tab").append($("<div></div>").attr("id",
"products_scroller").append(f))}function loadExtras(){sortTeaJournal();sortTeaProducts();HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries",null,"journal_tab","renderShavingJournalEntry"),new HG_Journals_View("TeaProductEntries",null,"products_tab",function(){loadTeaProducts(0,"DESC","TYPE",null)})],null)}function HG_Journal_local_init(){getTeaData(loadExtras)};
