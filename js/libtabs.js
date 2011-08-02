var LibTabs_Orientation={TOP:0,LEFT:1,BOTTOM:2,RIGHT:3},LibTabs_keyboardListeners=[];function LibTabs_tabsNav(g){for(var f=LibTabs_keyboardListeners.length-1;f>=0;f--)eval(LibTabs_keyboardListeners[f])._keyboardNav(g)}
function LibTabs(g,f,j,i,k){function h(a,b){this.name=a;this.content=b;this.visible=!1}this.ThisObj=g;this.ParentLyr=null;this.CurrentTab=-1;this.Tabs=[];this.Orientation=i==void 0?LibTabs_Orientation.TOP:i;this.NestedTabs=[];this._gutterWidth=0;this.IgnoreKeyboard=!1;this.ToggleListeners=[];this.ExcludedTabs=k;this.Reloaded=!1;this.TAB_NAME_SPACING=5;this._findPos=function(a){var b=etop=0;if(a.offsetParent){do b+=a.offsetLeft,etop+=a.offsetTop;while(a=a.offsetParent);return[b,etop]}};this._removeDupStyle=
function(a,b){if(a==null)return"";for(var c=null,c=a.style!=void 0&&typeof a.style.cssText=="string"?a.style.cssText.split(";"):a.getAttribute("style").split(";"),d="",e=c.length-1;e>=0;e--){var f=c[e].split(":");b.indexOf(f[0].replace(/^\s*/,"").replace(/\s*$/,"")+":")==-1&&(d+=c[e]+";")}return d.replace("; ",";").replace(/^ ;/,"").replace(/^\s*/,"").replace(/\s*$/,"")};this._setStyle=function(a,b){if(!(a==null||b==null)){var c=this._removeDupStyle(a,b),b=b.replace("; ",";");if(typeof a.style.cssText==
"string")a.style.cssText=c+b;a.setAttribute("style",c+b)}};this._getStyleProperty=function(a,b){if(a==null||b==null)return"";for(var c=null,c=typeof a.style.cssText=="string"?a.style.cssText.split(";"):a.getAttribute("style").split(";"),d=c.length-1;d>=0;d--){var e=c[d].split(":");if(b==e[0])return e[1].replace(/^\s+|\s+$/,"")}return""};this._keyboardNav=function(a){if(!this.IgnoreKeyboard&&(a=a?a:window.event?window.event:null))a=a.charChode?a.charCode:a.keyCode?a.keyCode:a.which?a.which:0,a>=49&&
a<=57&&this.ToggleTab(parseInt(String.fromCharCode(a))-1)};this._hideAll=function(){if(!(this.Tabs.length<=0)){for(var a=this.Tabs.length-1;a>=0;a--)this._setStyle(this.Tabs[a].name,"visibility: hidden;"),this._setStyle(this.Tabs[a].content,"visibility: hidden;"),this.Tabs[a].visible=!1;this._setStyle(this.Tabs[0].name.parentNode,"visibility: hidden;")}};this._showAll=function(){if(!(this.Tabs.length<=0)){this._setStyle(this.Tabs[0].name.parentNode,"visibility: visible;");for(var a=this.Tabs.length-
1;a>=0;a--)this._setStyle(this.Tabs[a].name,"visibility: visible;")}};this._hideTab=function(a,b){if(b<0||b>=a.length)return null;var c=a[b];if(c.visible){c.content.style.visibility="hidden";var d=c.name.getAttribute("class"),e=c.content.getAttribute("class");c.name.setAttribute("class",d.replace(" selected_tab",""));c.content.setAttribute("class",e.replace(" selected_content",""));c.visible=!1;c=this.NestedTabs[b];if(c!=null&&c.Tabs.length>0)this._setStyle(c.Tabs[0].parentNode,"visibility: hidden;"),
c._hideAll(),c.IgnoreKeyboard=!0}};this._showTab=function(a,b,c){if(b<0||b>=a.length)return null;a=a[b];if(!a.visible){this._showAll();var d=a.name.offsetWidth,e=a.name.offsetHeight,f=a.name.getAttribute("class"),g=a.content.getAttribute("class");this._setStyle(a.content,"visibility: visible;");a.name.setAttribute("class",f+" selected_tab");a.content.setAttribute("class",g+" selected_content");a.visible=!0;switch(c.Orientation){case LibTabs_Orientation.TOP:this._setStyle(a.name,"height: "+e+"px; width: "+
(d-13)+"px;");break;case LibTabs_Orientation.BOTTOM:this._setStyle(a.name,"width: "+(d-13)+"px;")}b=this.NestedTabs[b];if(b!=null&&b.Tabs.length>0)b._showAll(),b.CurrentTab==-1&&b.ToggleTab(0),this._setStyle(b.Tabs[b.CurrentTab].content,"visibility: visible;"),b.Tabs[b.CurrentTab].visible=!0,b.IgnoreKeyboard=!1}};this._addTopTab=function(a){a.setAttribute("class",a.getAttribute("class")+" top_tab");var b=null,c=null,a=a.childNodes,d=0,d=this.ExcludedTabs;for(child in a)if(a[child].nodeType!=void 0&&
a[child].nodeType!=Node.TEXT_NODE){var e=a[child].getAttribute("class");if(!(d!=null&&d.contains(a[child].firstChild.nodeValue)))e=="tab_name"&&b==null?(b=a[child],b.style.visibility="visible",b.setAttribute("onclick",this.ThisObj+".ToggleTab("+this.Tabs.length+");")):e.indexOf("tab_content")!=-1&&c==null&&(c=a[child])}if(b!=null&&c!=null){d=0;if(this.Tabs.length!=0)a=this.Tabs[this.Tabs.length-1].name,d=a.offsetWidth+parseInt(a.style.left)+this.TAB_NAME_SPACING;this._setStyle(b,"left: "+d+"px");
this._setStyle(c,"visibility: hidden");this.Tabs.push(new h(b,c,!1))}};this._addBottomTab=function(a){a.setAttribute("class",a.getAttribute("class")+" bottom_tab");var b=null,c=null,d=a.childNodes,e=0,e=this.ExcludedTabs;for(child in d)if(d[child].nodeType!=void 0&&d[child].nodeType!=Node.TEXT_NODE){var f=d[child].getAttribute("class");if(!(e!=null&&e.contains(d[child].firstChild.nodeValue)))f=="tab_name"&&b==null?(b=d[child],b.style.visibility="visible",b.setAttribute("onclick",this.ThisObj+".ToggleTab("+
this.Tabs.length+");")):f.indexOf("tab_content")!=-1&&c==null&&(c=d[child])}if(b!=null&&c!=null){a.innerHTML="";a.appendChild(c);a.appendChild(b);e=0;if(this.Tabs.length!=0)a=this.Tabs[this.Tabs.length-1].name,e=a.offsetWidth+parseInt(a.style.left)+this.TAB_NAME_SPACING;this._setStyle(b,"left: "+e+"px");this._setStyle(c,"visibility: hidden");this.Tabs.push(new h(b,c,!1))}};this._addLeftTab=function(a){a.setAttribute("class",a.getAttribute("class")+" left_tab");var b=null,c=null,a=a.childNodes;for(child in a)if(a[child].nodeType!=
void 0&&a[child].nodeType!=Node.TEXT_NODE){var d=a[child].getAttribute("class");d=="tab_name"&&b==null?(b=a[child],b.style.visibility="visible",b.setAttribute("onclick",this.ThisObj+".ToggleTab("+this.Tabs.length+");")):d.indexOf("tab_content")!=-1&&c==null&&(c=a[child])}if(b!=null&&c!=null){a=0;if(this.Tabs.length!=0)a=this.Tabs[this.Tabs.length-1].name,a=a.offsetHeight+parseInt(a.style.top)+(this.TAB_NAME_SPACING-2),this.Reloaded||(a+=8);this._setStyle(b,"top: "+a+"px");this._setStyle(c,"visibility: hidden");
this.Tabs.push(new h(b,c,!1))}};this._getNested=function(a){for(var b=a.getElementsByTagName("div"),c=null,a=0;a<b.length;a++)if(b[a].getAttribute("class")=="tab_content"){c=b[a];break}if(c==null)return null;b=c.getElementsByTagName("div");for(a=0;a<b.length;a++)if(b[a].getAttribute("class")=="tab_content")return b[a].parentNode.parentNode;return null};this.LoadTabs=function(a,b){if(a!=null){this.ParentLyr=a;this._gutterWidth=0;var c=a.getElementsByTagName("div");this.NestedTabs=[];for(var d=0;d<
c.length;d++)if(c[d].getAttribute("class")=="tab"){var e=this._getNested(c[d]);if(e!=null)e=new LibTabs(this.ThisObj+".NestedTabs["+this.Tabs.length+"]",e,0,this.Orientation+1),this.NestedTabs[this.Tabs.length]=e,e.HandleKeyboardInputs(),e.IgnoreKeyboard=!0,e.Tabs.length>0&&e._hideAll();switch(this.Orientation){case LibTabs_Orientation.RIGHT:case LibTabs_Orientation.LEFT:this._addLeftTab(c[d]);break;case LibTabs_Orientation.TOP:this._addTopTab(c[d]);break;case LibTabs_Orientation.BOTTOM:this._addBottomTab(c[d])}if(this.Orientation==
LibTabs_Orientation.LEFT||this.Orientation==LibTabs_Orientation.RIGHT)if(e=this.Tabs[this.Tabs.length-1].name.offsetWidth,e>this._gutterWidth)this._gutterWidth=e}if(this.Orientation==LibTabs_Orientation.LEFT||this.Orientation==LibTabs_Orientation.RIGHT){this._gutterWidth=70;for(d=this.Tabs.length-1;d>=0;d--)c=this.Tabs[d],this._setStyle(c.name,"width: "+(this._gutterWidth+6)+"px;"),this._setStyle(c.content,"left: "+(this._gutterWidth+18)+"px;")}(this.Orientation==LibTabs_Orientation.TOP||this.Orientation==
LibTabs_Orientation.BOTTOM)&&b!=void 0&&this.ToggleTab(b)}};this.ReloadTabs=function(){this.Tabs=[];this.Reloaded=!0;this.LoadTabs(this.ParentLyr,this.CurrentTab)};this.ToggleTab=function(a){if(a<0||a>=this.Tabs.length)return null;var b=this.CurrentTab,c=this.Tabs;this._hideTab(c,b);this._showTab(c,a,this);this.CurrentTab=a;this.Tabs[this.CurrentTab].content.focus();for(a=0;a<this.ToggleListeners.length;a++)this.ToggleListeners[a](b,this.CurrentTab)};this.AddToggleListener=function(a){a!=null&&this.ToggleListeners.push(a)};
this.NextTab=function(){this.ToggleTab((this.CurrentTab+1)%this.Tabs.length)};this.PrevTab=function(){this.ToggleTab((this.CurrentTab==0?this.Tabs.length:this.CurrentTab)-1)};this.Size=function(){return this.Tabs.length};this.HandleKeyboardInputs=function(){LibTabs_keyboardListeners.push(this.ThisObj);if(document.onkeydown==null)document.onkeydown=LibTabs_tabsNav,document.layers&&document.captureEvents(Event.KEYDOWN)};f!=null&&this.LoadTabs(f,j)};
