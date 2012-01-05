var url_tea_journal="https://spreadsheets.google.com/feeds/list/tgKsbec6-aJiVrZL6qRJ7hg/od6/private/full",url_tea_products="https://spreadsheets.google.com/feeds/list/tDrCkOvNrsvhJhnt8mpc-lA/od6/private/full",TeaJournalEntries=[],TeaProductEntries=[],TeaAlbum=null,TeaFixins=["Milk","Cream","Half & Half","Sugar","Brown Sugar","Raw Sugar","Honey","Vanilla Extract","Vanilla Bean","Maple Cream","Maple Sugar"],TeaProductRatings=["Leaf Aroma","Brewed Aroma","Taste","Value"],TeaFlushTypes=["1st Flush","2nd Flush",
"Monsoon Flush","Autumn Flush"],TeaPackagingTypes=["Loose Leaf","Bagged"];
function TeaProductEntryType(c){this.Comments=this.Ratings=this.PurchasePrice=this.PurchaseDate=this.PurchaseLocation=this.Packaging=this.Aging=this.Stocked=this.BlendRatio=this.BlendedTeas=this.LeafGrade=this.Size=this.Flush=this.Year=this.Region=this.Country=this.Type=this.Name=this.Date=this.ID=null;this.Pictures=[];this._loadPictures=function(a){if(a!=void 0)this.Pictures=HG_retrievePicturesFromAlbum(a,TeaAlbum)};this._loadRatings=function(a){if(a!=void 0)this.Ratings=a};this._load=function(a){if(a!=
null){this.ID=a.id;if(a.date!=null)this.Date=new Date(a.date);this.Name=a.name;this.Type=a.type;this.Country=a.country;this.Region=a.region;this.Year=a.year;this.Flush=a.flush;this.Size=a.size;this.LeafGrade=a.leafgrade;if(this.Type=="Blend")this.BlendedTeas=a.blendedteas,this.BlendRatio=a.blendratio.replace(/;/g,":");this.Stocked=a.stocked=="TRUE"?!0:!1;this.Aging=a.aging=="TRUE"?!0:!1;this.Packaging=a.packaging;this.PurchaseLocation=a.purchaselocation;if(a.purchasedate!=null)this.PurchaseDate=new Date(a.purchasedate);
this.PurchasePrice=a.purchaseprice;this.Comments=a.comments;this._loadRatings(a.ratings);this._loadPictures(a.pictures)}};this.getName=function(){var a="";this.Year!=null&&(a+=this.Year+" ");this.Flush!=null&&(a+=TeaFlushTypes[this.Flush-1]+" ");a+=this.Name;this.LeafGrade!=null&&(a+=" "+this.LeafGrade);return a};this.getOrigin=function(){var a="";this.Region!=null&&(a+=this.Region+", ");this.Country!=null&&(a+=this.Country);return a};this.getType=function(){return(this.Type=="Blend"?this.BlendRatio+
" ":"")+this.Type};this.getPackaging=function(){return TeaPackagingTypes[this.Packaging]};this.getJournalEntries=function(){for(var a=[],b=0;b<TeaJournalEntries.length;b++)TeaJournalEntries[b].Tea.ID==this.ID&&a.push(TeaJournalEntries[b]);return a};this._load(c)}
function TeaJournalEntryType(c){this.Comments=this.Rating=this.Fixins=this.SessionInstance=this.Temperature=this.SteepingVessel=this.SteepTime=this.Tea=this.EntryTime=this.EntryDate=this.Date=null;this.Pictures=[];this._loadPictures=function(a){if(a!=void 0)this.Pictures=HG_retrievePicturesFromAlbum(a,TeaAlbum)};this._loadFixins=function(a){if(a!=void 0){if(this.Fixins==null)this.Fixins=[];for(var a=a.split(";"),b=a.length-1;b>=0;b--)this.Fixins.push(TeaFixins[a[b]])}};this._loadSteepTime=function(a){if(a!=
void 0){var b=a.split(" "),c=a=0;b.length>1?(a=parseInt(b[0]),c=parseInt(b[1])):(b=b[0],b.substr(-1,1).toLowerCase()=="m"?a=parseInt(b):c=parseInt(b));this.SteepTime=(a*60+c)*1E3}};this._load=function(a){if(a!=null){if(a.date!=null&&(this.EntryDate=a.date,this.Date=new Date(this.EntryDate),a.time!=null))this.EntryTime=a.time,this.Date.setMinutes(this.EntryTime.substr(-2)),this.Date.setHours(this.EntryTime.substr(0,this.EntryTime.length-2));this.Tea=HG_getProductByID(TeaProductEntries,a.tea);this.Temperature=
a.steeptemperature==null?212:a.steeptemperature;this.SteepingVessel=a.steepingvessel;this.SessionInstance=a.sessioninstance;this.Rating=a.rating;this.Comments=a.comments;this._loadSteepTime(a.steeptime);this._loadFixins(a.fixins);this._loadPictures(a.pictures)}};this._load(c)}function sortTeaProducts(){TeaProductEntries.sort(function(c,a){var b=parseInt(c.ID),d=parseInt(a.ID);return b>d?1:b<d?-1:0})}
function sortTeaJournal(){TeaJournalEntries.sort(function(c,a){return!(c.Date instanceof Date)?1:!(a.Date instanceof Date)?0:c.Date.getTime()-a.Date.getTime()})}function formatSteepTime(c){var a=c/1E3,c=Math.floor(a/60),a=Math.ceil(a-c*60),b="";c>0&&(b=c+"m");a>0&&(b+=" "+a+"s");return b}
function getTeaData(c){HG_getJournalData({album_id:"HG_Tea",album_var:"TeaAlbum",spreadsheets:[{name:"teas",entries_var:"TeaProductEntries",entries_type:"TeaProductEntryType",retrieval_url:url_tea_products},{name:"journal",entries_var:"TeaJournalEntries",entries_type:"TeaJournalEntryType",retrieval_url:url_tea_journal}],loaded_callback:c},HG_Journal_loadingMessage)};
