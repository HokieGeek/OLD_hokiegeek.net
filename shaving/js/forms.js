var journal_entry_url="http://spreadsheets0.google.com/formResponse?formkey=dENEbllUbFdlTHg0WThDLTdqWXRLMWc6MQ";function loadProductInJournalEntry(a){console.log("loadProductInJournalEntry(): ",a);var c=a.Type.toLowerCase();c=="brush"&&(c+="e");c+="s";var c=document.getElementById("list_"+c),b=document.createElement("option");b.setAttribute("value",a.ID);b.setAttribute("selected","true");b.appendChild(document.createTextNode(a.getName()));c.insertBefore(b,c.getElementsByTagName("option")[0])}
function addNewListItem(a){a.value=="_ADDNEW_"&&(clearReviewForm(),a=a.getAttribute("id").replace(/list_/,""),a=="brushes"&&(a=a.replace(/es$/,"")),a=a.replace(/s$/,""),startEntryReview(a))}
function addNewItem(a){var c=a.parentNode.getElementsByTagName("select")[0],b=a.firstChild.value,d=document.createElement("option");d.setAttribute("value",b);d.setAttribute("selected","true");d.appendChild(document.createTextNode(b));b=c.getElementsByTagName("optgroup")[0];c.insertBefore(d,b);a.parentNode.removeChild(a);setStyle(c,"visibility: visible; position: static;")}
function removeNewItemBox(a){var c=a.parentNode.getElementsByTagName("select")[0];c.getElementsByTagName("option")[0].setAttribute("selected","true");a.parentNode.removeChild(a);setStyle(c,"visibility: visible; position: static;")}
function addProductOption(a,c,b){var d=document.getElementById(a);if(d==null||c==void 0)console.log("woah! Couldn't find '"+a+"'?:"+d);else if(a=document.createElement("option"),a.setAttribute("value",c),a.appendChild(document.createTextNode(b)),c=d.getElementsByTagName("optgroup")[0],d.insertBefore(a,c),d.getElementsByTagName("option").length<=3)d.selectedIndex=0}
function sortProductList(a){var c=document.getElementById(a);if(c==null)console.log(">> NOT Sorting: ",a);else{for(var b=[],d=c.getElementsByTagName("option"),e=d.length-1;e>=0;e--){var g=d[e].firstChild.nodeValue;if(g!="Add New Item..."&&g!="N/A"){var h=d[e].getAttribute("value");b.push({name:g,id:h});c.removeChild(d[e])}}for(e=0;e<b.length+45;e++)b.sort(function(a,b){return a.name<b.name});for(e=b.length-1;e>=0;e--)addProductOption(a,b[e].id,b[e].name);b!=null&&delete b}}
function loadUsedProducts(){for(var a=[],c=[],b=[],d=[],e=[],g=[],h=[],i=[],f="",j=ShavingReviewedProducts.length-1;j>=0;j--){var k=ShavingReviewedProducts[j];if(k.inDen)switch(f=k.getName(),k.Type.toLowerCase()){case "razor":addProductOption("list_razors",k.ID,f);a.push(f);break;case "blade":addProductOption("list_blades",k.ID,f);c.push(f);break;case "strop":addProductOption("list_strops",k.ID,f);b.push(f);break;case "brush":addProductOption("list_brushes",k.ID,f);d.push(f);break;case "soap":addProductOption("list_soaps",
k.ID,f);e.push(f);break;case "cream":addProductOption("list_creams",k.ID,f);g.push(f);break;case "preshave":addProductOption("list_preshaves",k.ID,f);h.push(f);break;case "aftershave":addProductOption("list_aftershaves",k.ID,f),i.push(f)}}sortProductList("list_razors");sortProductList("list_blades");sortProductList("list_strops");sortProductList("list_brushes");sortProductList("list_soaps");sortProductList("list_creams");sortProductList("list_preshaves");sortProductList("list_aftershaves");a=[];j=
ShavingJournalEntries[ShavingJournalEntries.length-1];j.Blade==null?a.push(document.getElementById("list_blades")):a.push(document.getElementById("list_strops"));j.Soap==null?a.push(document.getElementById("list_soaps")):a.push(document.getElementById("list_creams"));for(j=a.length-1;j>0;j--)a[j].selectedIndex=a[j].getElementsByTagName("option").length-2}
function createJournalGradeScales(){var a=10,c=new JournalEntryType(null),b=document.getElementById("journal_grade_scales"),d=null,e=null,g;for(g in c.Grades)d=document.createElement("tr"),e=document.createElement("td"),e.appendChild(document.createTextNode(g+":")),d.appendChild(e),e=document.createElement("td"),new GradeScaleControl(e,"entry."+a+".single"),a++,d.appendChild(e),b.appendChild(d)}var submissionMessageInterval=null,submissionMessageLayer=null;
function submissionMessage(a){submissionMessageLayer=document.createElement("span");submissionMessageLayer.setAttribute("id","submission_message_lyr");submissionMessageLayer.innerHTML="Sending..";a.appendChild(submissionMessageLayer);submissionMessageInterval=window.setInterval('submissionMessageLayer.innerHTML += "."',1E3)}
function postJournalEntry(){submissionMessage(document.getElementById("journal_submit").parentNode);postEntry(journal_entry_url,document.getElementById("journal_entry_form"));getShavingData();loadDataWhenAvailable(function(){loadJournal(0,"DESC",null);tabsObj.ToggleTab(0);toggleEntryDetails(document.getElementById("journal").getElementsByTagName("tr")[1],!0);clearJournalForm()})}
function clearJournalForm(){var a=document.getElementById("journal_entry_form");clearForm(a);init_form("journal_form_date")}var review_entry_url="https://spreadsheets.google.com/formResponse?formkey=dEFMb0ZoVDdhYkJEcVo3czBJSEFRcGc6MQ",pics_list_hidden=null,review_pics_view=null,pw_sel_obj=null;
function clearPictures(){pics_list_hidden==null&&(pics_list_hidden=document.getElementById("picture_list"));review_pics_view==null&&(review_pics_view=document.getElementById("pictures_view"));pics_list_hidden.value="";review_pics_view.innerHTML=""}
function addReviewPicture(a){console.log("Adding pic: ",a.value);pics_list_hidden==null&&(pics_list_hidden=document.getElementById("picture_list"));review_pics_view==null&&(review_pics_view=document.getElementById("pictures_view"));pics_list_hidden.value+="pics/"+a.value+";";var c=document.createElement("img");c.setAttribute("src","pics/"+a.value);review_pics_view.appendChild(c)}var review_product_type=null,review_grades_input="hidden_review_grades",hidden_review_grades=null;
function loadReviewGrades(a,c){var b=document.getElementById(c);hidden_review_grades==null&&(hidden_review_grades=document.getElementById(review_grades_input));b.innerHTML="";hidden_review_grades.setAttribute("value","");for(var d=null,e=null,g=PRODUCT_GRADES[PRODUCT_CATEGORIES.indexOf(a.toLowerCase())],h=0;h<g.length;h++)d=document.createElement("tr"),e=document.createElement("td"),e.appendChild(document.createTextNode(g[h]+":")),d.appendChild(e),e=document.createElement("td"),new GradeScaleControl(e,
"grade_"+g[h].toLowerCase(),null,"compileGrades"),d.appendChild(e),b.appendChild(d)}
function compileGrades(){hidden_review_grades==null&&(hidden_review_grades=document.getElementById(review_grades_input));if(review_product_type==null){var a=document.getElementById("review_product_type");if(a!=null)review_product_type=a.value}for(var a=PRODUCT_GRADES[PRODUCT_CATEGORIES.indexOf(review_product_type.toLowerCase())],c="",b=0;b<a.length;b++){b!=0&&(c+=";");var d=document.getElementById("grade_"+a[b].toLowerCase()).getAttribute("value");c+=d==null?"0":d}hidden_review_grades.setAttribute("value",
c)}var fromJournalEntry=!1;function startEntryReview(a){document.getElementById("review_product_type").selectedIndex=PRODUCT_CATEGORIES.indexOf(a.toLowerCase());loadReviewGrades(a,"review_grade_scales");fromJournalEntry=!0;tabsObj.NestedTabs[3].ToggleTab(1)}
function postReviewEntry(){submissionMessage(document.getElementById("review_submit").parentNode);var a=new ProductType(null);a.ID=document.getElementById("review_entry_id").value;a.Type=document.getElementById("review_product_type").value;a.Vendor=document.getElementById("review_product_vendor").value;a.Name=document.getElementById("review_product_name").value;a.Size=document.getElementById("review_product_size").value;a.Color=document.getElementById("review_product_color").value;a.Scent=document.getElementById("review_product_scent").value;
if(document.getElementById("pictures_select")!=null&&pw_sel_obj!=null){pics_list_hidden==null&&(pics_list_hidden=document.getElementById("picture_list"));for(var c=pw_sel_obj.getSelected(),b=0;b<c.length;b++)pics_list_hidden.value+=c[b].name+";"}compileGrades();postEntry(review_entry_url,document.getElementById("review_entry_form"));fromJournalEntry?(fromJournalEntry=!1,loadProductInJournalEntry(a),tabsObj.ToggleTab(3),tabsObj.NestedTabs[3].ToggleTab(0)):(getProductReviews(),loadDataWhenAvailable(function(){var b=
a.Type;b=="Brush"&&(b+="e");b+="s";for(var e=0,c=0,h=document.getElementById("review_tabs").getElementsByTagName("span"),i=0;i<h.length;i++)if(h[i].getAttribute("class")=="tab_name"&&(c++,h[i].firstChild.nodeValue==b)){e=c-1;break}tabsObj.ToggleTab(1);tabsObj.NestedTabs[1].ToggleTab(e);refreshReviews();clearReviewForm()}))}
function clearReviewForm(){console.log(">> Clearing Review Form");var a=document.getElementById("review_entry_form");clearForm(a);init_form("review_form_date");clearPictures()}function switchToSoap(){switchProductTab(["list_soaps_label","list_soaps"],["list_creams_label","list_creams"]);document.getElementById("list_soaps").selectedIndex=0}
function switchToCream(){switchProductTab(["list_creams_label","list_creams"],["list_soaps_label","list_soaps"]);document.getElementById("list_creams").selectedIndex=0}function switchToStrop(){switchProductTab(["list_strops_label","list_strops"],["list_blades_label","list_blades"]);document.getElementById("list_strops").selectedIndex=0}
function switchToBlade(){switchProductTab(["list_blades_label","list_blades"],["list_strops_label","list_strops"]);document.getElementById("list_blades").selectedIndex=0}
function switchProductTab(a,c){var b=document.getElementById(a[0]),d=document.getElementById(a[1]),e=b.getAttribute("class"),g=d.getAttribute("class");console.log("SOURCE: ",e);b.setAttribute("class",e+" sel_prod_type_label");d.setAttribute("class",g+" sel_prod_type_list");d.selectedIndex=d.getElementsByTagName("option").length-2;b=document.getElementById(c[0]);d=document.getElementById(c[1]);e=b.getAttribute("class");g=d.getAttribute("class");console.log("TARGET: ",e);e!=null&&e.length>0&&b.setAttribute("class",
e.replace(/ *sel_prod_type_label/g,""));g!=null&&g.length>0&&d.setAttribute("class",g.replace(/ *sel_prod_type_list/g,""))}
function GradeScaleControl(a,c,b,d){this.gradeScale=null;this.valueFieldID=c;this.valueField=null;this.scaleLabel=b==void 0?null:b;this.listeners=[];d!=null&&this.listeners.push(d);this.loadGradeScale=function(){this.gradeScale=document.createElement("span");this.gradeScale.setAttribute("class","grade_scale");setStyle(this.gradeScale,"vertical-align: top;");if(this.scaleLabel!=null){var b=document.createElement("span");b.appendChild(document.createTextNode(this.scaleLabel+": "));setStyle(b,"vertical-align: top; margin-right: 10px;");
this.gradeScale.appendChild(b)}for(var b=document.createElement("span"),c=0;c<grade_scale.length;c++){var d=grade_scale[c].toLowerCase(),i=document.createElement("a");i.setAttribute("href","javascript://");i.setAttribute("title",grade_scale[c]);this.listeners.length>0?i.setAttribute("onclick","GradeScaleControl_selectGrade(this, "+c+"); "+this.listeners[0]+"()"):i.setAttribute("onclick","GradeScaleControl_selectGrade(this, "+c+");");i.setAttribute("onmouseover","this.firstChild.setAttribute('src', 'img/shave_grade_"+
d+".png');");i.setAttribute("onmouseout","if (document.getElementById('"+this.valueFieldID+"').value != '"+c+"') this.firstChild.setAttribute('src', 'img/shave_grade_"+d+"_dark.png');");var f=document.createElement("img");f.setAttribute("src","img/shave_grade_"+d+"_dark.png");i.appendChild(f);i.setAttribute("valueFieldID",this.valueFieldID);b.appendChild(i)}this.gradeScale.appendChild(b);b=document.createElement("input");b.setAttribute("type","hidden");b.setAttribute("name",this.valueFieldID);b.setAttribute("id",
this.valueFieldID);this.gradeScale.appendChild(b);a.appendChild(this.gradeScale)};this.loadGradeScale()}function GradeScaleControl_selectGrade(a,c){var b=a.getAttribute("valueFieldID"),b=document.getElementById(b),d=-1;if(b.value!=null&&b.value.length>0)d=b.value;b.value=c;d>-1&&a.parentNode.getElementsByTagName("img")[d].setAttribute("src","img/shave_grade_"+grade_scale[d].toLowerCase()+"_dark.png")}
function init_form(a){var c=new Date;document.getElementById(a).value=c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear()}
function postEntry(a,c){for(var b=[],d=["select","textarea","input"],e=0;e<d.length;e++)for(var g=d[e],h=c.getElementsByTagName(g),i=0;i<h.length;i++){var f=h[i];switch(g){case "input":switch(f.getAttribute("type")){case "radio":if(!f.checked)continue;break;case "submit":continue}}var j=escape(f.getAttribute("name")),f=f.value.replace(/"/g,'\\"');b.push(j+"="+f)}console.log("sendData(",a,",",b,")");(new libHTTPRequest).sendData(a,b)}
function clearForm(a){for(var c=["select","textarea","input"],b=0;b<c.length;b++)for(var d=c[b],e=a.getElementsByTagName(d),g=0;g<e.length;g++){var h=e[g];switch(d){case "textarea":h.value="";break;case "select":h.selectedIndex=0;break;case "input":switch(h.getAttribute("type")){case "text":h.value="";break;case "radio":h.checked=!1}}}submissionMessageLayer!=null&&(clearInterval(submissionMessageInterval),submissionMessageLayer.parentNode.removeChild(submissionMessageLayer))};
