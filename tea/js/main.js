var tabsObj=null;
function renderShavingJournalEntry(g,b){var a=null,f=null,c=document.createElement("img");b.Tea.Pictures[0]==void 0?c.setAttribute("src","img/tea_cup_greyed.png"):c.setAttribute("src",b.Tea.Pictures[0].getURL(120));a=document.createElement("tr");f=document.createElement("td");f.appendChild(c);a.appendChild(f);f=document.createElement("td");c=document.createElement("div");c.setAttribute("class","tea_journal_entry_name");c.appendChild(document.createTextNode(b.Tea.getName()));c.appendChild(document.createTextNode(" ("+b.Tea.getType()+
")"));var h=b.Fixins;if(h!=null){var e=document.createElement("div");e.setAttribute("class","tea_journal_entry_fixins");e.innerHTML="with ";for(var d=h.length-1;d>=0;d--)d==0?e.innerHTML+=" and ":d!=h.length-1&&(e.innerHTML+=", "),e.innerHTML+=h[d].toLowerCase();c.appendChild(e)}f.appendChild(c);c=document.createElement("div");c.setAttribute("class","tea_journal_entry_steeping_details");c.innerHTML="Steeped ";b.SteepTime!=null&&(c.innerHTML+="for <i>"+formatSteepTime(b.SteepTime)+"</i> ");b.Temperature!=
null&&(c.innerHTML+="at <i>"+b.Temperature+"&deg;F</i> ");b.SteepingVessel!=null&&(c.innerHTML+="using the "+b.SteepingVessel.toLowerCase());f.appendChild(c);h=document.createElement("div");h.setAttribute("class","tea_journal_entry_rating");for(e=0;e<4;e++)c=document.createElement("img"),d="img/tea_cup",e>b.Rating-1&&(d+="_greyed"),d+=".png",c.setAttribute("src",d),c.setAttribute("title",b.Rating+"/4 steaming tea cups"),h.appendChild(c);f.appendChild(h);a.appendChild(f);g.appendChild(a);a!=void 0&&
delete a;f!=void 0&&delete f;return!0}function loadTeaJournal(){for(var g=$("<table></table>"),b=0;b<TeaJournalEntries.length;b++){var a=TeaJournalEntries[b];console.log("loadTeaJournal(): ",TeaJournalEntries[b]);g.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(a.EntryDate)))).append($("<td></td>").append(a.Tea.getName())))}$("#journal_tab").append(g);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function renderTeaJournalEntry(g){for(var b=$("<table></table>"),a=0;a<TeaJournalEntries.length;a++)g=TeaJournalEntries[a],console.log("loadTeaJournal(): ",TeaJournalEntries[a]),b.append($("<tr></tr>").append($("<td></td>").append(HG_formatDate(new Date(g.EntryDate)))).append($("<td></td>").append(g.Tea.getName())));$("#journal_tab").append(b);displayed_entries=TeaJournalEntries.length;console.log("Done adding journal entries")}
function createRatingWidget(g){for(var b=$("<span></span>"),a=1;a<=4;a++)b.append($("<img/>").attr("src","http://tea.hokiegeek.net/img/tea_cup"+(a>g?"_greyed":"")+".png"));return b}
function loadTeaProducts(){for(var g=$("<table></table>"),b=0;b<TeaProductEntries.length;b++){var a=TeaProductEntries[b],f=a.Pictures[0]==void 0?"img/tea_cup_greyed.png":a.Pictures[0].getURL(140),f=$("<img />").attr("src",f),c="";a.PurchasePrice!=null&&(c+="$"+a.PurchasePrice+" ");a.PurchaseLocation!=null&&(c+="from "+a.PurchaseLocation+" ");a.PurchaseDate!=null&&(c+="on "+HG_formatDate(a.PurchaseDate));var h="";a.Size!=void 0&&(h+=a.Size+" ");h+=a.getPackaging();for(var e=0,d=0,i=a.getJournalEntries(),
j=0;j<i.length;j++)i[j].Rating>1&&(e+=parseInt(i[j].SteepTime)),d+=parseInt(i[j].Rating);e>0?(e/=i.length,e=formatSteepTime(e)):e="N/A";d/=i.length;i=$("<table></table>");if(a.Ratings.length<=0)i.append($("<tr></tr>").append("<td></td>").append("Unrated"));else{d>=0&&i.append($("<tr></tr>").attr("title","Taste Rating: Averaged from all journal entries").append($("<td></td>").append("Taste")).append($("<td></td>").append(createRatingWidget(Math.ceil(d)))));for(d=0;d<a.Ratings.length;d++)i.append($("<tr></tr>").append($("<td></td>").append(TeaProductRatings[d])).append($("<td></td>").append(createRatingWidget(a.Ratings[d]))))}d=
$("<table></table>").addClass("tea_product_entry_details");a.Type!="Blend"&&d.append($("<tr></tr>").append($("<td></td>").append("Origin")).append($("<td></td>").append(a.getOrigin())).append($("<td></td>").append("Price")).append($("<td></td>").append(c)));d.append($("<tr></tr>").append($("<td></td>").append("Packaging")).append($("<td></td>").append(h)).append($("<td></td>").append("Steep Time")).append($("<td></td>").append(e).attr("title","Steep Time: Averaged from best journal entries"))).append($("<tr></tr>").addClass("tea_product_entry_ratings").append($("<td></td>").append("Ratings")).append($("<td></td>").append(i)));
a=$("<table></table>").append($("<tr></tr>").addClass("tea_product_entry_name").append($("<td></td>").append(a.getName()+" ["+a.ID+"]").append($("<span></span>").append(a.Stocked?"":"X")).append($("<div></div>").addClass("tea_product_entry_type").append("&lt;"+a.getType().toLowerCase()+"&gt;")))).append($("<tr></tr>").append($("<td></td>").append(d)));g.append($("<tr></tr>").addClass("tea_product_entry").append($("<td></td>").addClass("tea_product_entry_pics").append(f)).append($("<td></td>").append(a)))}$("#products_tab").append($("<div></div>").attr("id",
"products_scroller").append(g))}function loadExtras(){sortTeaJournal();sortTeaProducts();HG_loadJournalViews([new HG_Journals_View("TeaJournalEntries",null,"journal_tab","renderShavingJournalEntry","%vague"),new HG_Journals_View("TeaProductEntries",null,"products_tab",function(){loadTeaProducts(0,"DESC","TYPE",null)},null)],null)}function HG_Journal_local_init(){getTeaData(loadExtras)};
