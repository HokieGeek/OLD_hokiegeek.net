/* Expects tabs to be formatted as such:
 * <div class="tab">
 * 		<span class="tab_name">Lorem</span>
 * 		<span class="tab_content">
 * 			Lorem ipsum dolor sit amet...
 * 		</span>
 * </div>
 *
 * If you supply the constructor with the ID of an 
 * element (tabs_lyr) whose child elements are
 * all tabs formatted as stated, it will handle them accordingly
 */
var LibTabs_Orientation = { TOP : 0, LEFT : 1, BOTTOM: 2, RIGHT: 3 };
var LibTabs_keyboardListeners = [];
function LibTabs_tabsNav(e) {
	for (var i = LibTabs_keyboardListeners.length-1; i >= 0; i--)
		eval(LibTabs_keyboardListeners[i])._keyboardNav(e);
}
function LibTabs (obj_name, tabs_lyr, start_tab, orientation, exclusion_list) 
{
	// Members
	this.ThisObj = obj_name;
	this.ParentLyr = null;
	this.CurrentTab = -1;
	this.Tabs = [];
	this.Orientation = (orientation == undefined) ? LibTabs_Orientation.TOP : orientation;
	this.NestedTabs = [];
	this._gutterWidth = 0;
	this.IgnoreKeyboard = false;
	this.ToggleListeners = [];
	this.ExcludedTabs = exclusion_list;
	this.Reloaded = false;

	// Constants
	this.TAB_NAME_SPACING = 5;

	// Defined types
	function LibTabs_Tab(n, c, v)
	{
		this.name = n;
		this.content = c;
		this.visible = false;
	}

	// Private Methods	
	this._findPos = function (e) {
		var eleft = etop = 0;
		if (e.offsetParent) {
			do {
				eleft += e.offsetLeft;
				etop += e.offsetTop;
			} while (e = e.offsetParent);
			return [eleft, etop];
		}
	}
	this._removeDupStyle = function(e, ns) {
		if (e == null) return "";
		var old_styles = null;
		if (e.style != undefined && typeof(e.style.cssText) == 'string')
			old_styles = e.style.cssText.split(";");
		else
			old_styles = e.getAttribute("style").split(";");
		var clean_style = "";
		for (var i = old_styles.length-1; i >= 0; i--) {
			var os = old_styles[i].split(":");
			if (ns.indexOf(os[0].replace(/^\s*/, "").replace(/\s*$/, "")+":") == -1)
				clean_style += old_styles[i]+";";
		}
		return clean_style.replace("; ", ";").replace(/^ ;/, "").replace(/^\s*/, "").replace(/\s*$/, "");
	}
	this._setStyle = function(e, s) {
		//console.log("setStyle[S]:", e.getAttribute('style'));
		if (e == null || s == null) return;

		var clean = this._removeDupStyle(e, s);
		s = s.replace("; ", ";");
		if (typeof(e.style.cssText) == 'string')
  			e.style.cssText = clean+s;
		e.setAttribute('style', clean+s);
		//console.log("setStyle[E]:", e.getAttribute('style'));
	}
	this._getStyleProperty = function(e, pn) {
		if (e == null || pn == null) return "";

		var s = null;
		if (typeof(e.style.cssText) == 'string')
			s = e.style.cssText.split(";");
		else
			s = e.getAttribute("style").split(";");
		for (var i = s.length-1; i >= 0; i--) {
			var p = s[i].split(":");
			if (pn == p[0])
				return p[1].replace(/^\s+|\s+$/, "");
		}
		return "";
	}

	this._keyboardNav = function (e) {
		if (this.IgnoreKeyboard) return;

		var evt = (e) ? e : ((window.event) ? window.event : null);
		if (evt) {
			var charCode = (evt.charChode) ? evt.charCode : 
							((evt.keyCode) ? evt.keyCode : 
			 					((evt.which) ? evt.which : 0));
			if (charCode >= 49 && charCode <= 57) {
				var tab = parseInt(String.fromCharCode(charCode))-1;
				this.ToggleTab(tab);
			} else {
				/* FIXME: navigating when hidden
				if (this.Orientation == LibTabs_Orientation.TOP) {
					if (charCode == 72) { // 72(h)
						this.PrevTab();
					} else if (charCode == 76) { // 76(l)
						this.NextTab();
					}
				} else {
					if (charCode == 75) { // 75(k)
						this.PrevTab();
					} else if (charCode == 74) { // 74(j)
						this.NextTab();
					}
				}
				*/
			}
		}
	}

	this._hideAll = function() {
		if (this.Tabs.length <= 0) return;

		for (var i = this.Tabs.length-1; i >= 0; i--) {
			this._setStyle(this.Tabs[i].name, "visibility: hidden;");
			this._setStyle(this.Tabs[i].content, "visibility: hidden;");
			this.Tabs[i].visible = false;
		}
		this._setStyle(this.Tabs[0].name.parentNode, "visibility: hidden;");
	}

	this._showAll = function() {
		if (this.Tabs.length <= 0) return;

		this._setStyle(this.Tabs[0].name.parentNode, "visibility: visible;");
		for (var i = this.Tabs.length-1; i >= 0; i--) {
			this._setStyle(this.Tabs[i].name, "visibility: visible;");
			//this.Tabs[i].visible = true;
		}
	}

	this._hideTab = function (tabs, tab_num) {
		if (tab_num < 0 || tab_num >= tabs.length) return null; // ERROR HANDLING
		var tab = tabs[tab_num];	
		if (tab.visible) {
			tab.content.style.visibility = "hidden";
			var name_classes = tab.name.getAttribute("class");
			var content_classes = tab.content.getAttribute("class");
			tab.name.setAttribute("class", name_classes.replace(" selected_tab", ""));
			tab.content.setAttribute("class", content_classes.replace(" selected_content", ""));
			tab.visible = false;
			var nested = this.NestedTabs[tab_num];
			if (nested != null && nested.Tabs.length > 0) {
				//console.log("Hiding Tab: "+tab_num, nested.Tabs[0].name);
				this._setStyle(nested.Tabs[0].parentNode, "visibility: hidden;");
				nested._hideAll();
				nested.IgnoreKeyboard = true;
			}
		}
	}

	this._showTab = function (tabs, tab_num, thisObj) {
		if (tab_num < 0 || tab_num >= tabs.length) return null; // ERROR HANDLING
		var tab = tabs[tab_num];	
		//if (tab != null && !tab.visible) {
		if (!tab.visible) {
			//console.log(this.ThisObj+".LibTabs:_showTab("+tab_num+")");
			this._showAll();
			//console.log(tab.name);
			var w = tab.name.offsetWidth;
			var h = tab.name.offsetHeight;

			var name_classes = tab.name.getAttribute("class");
			var content_classes = tab.content.getAttribute("class");
			this._setStyle(tab.content, "visibility: visible;");
			tab.name.setAttribute("class", name_classes+" selected_tab");
			tab.content.setAttribute("class", content_classes+" selected_content");
			tab.visible = true;

				//console.log("_showTab(): w = ", w, ", h = ", h);
			switch (thisObj.Orientation) {
			case LibTabs_Orientation.TOP:
				this._setStyle(tab.name, "height: "+h+"px; width: "+(w-13)+"px;");
				break;
			case LibTabs_Orientation.BOTTOM:
                this._setStyle(tab.name, "width: "+(w-13)+"px;");
				break;
			default: break;
			}

			var nested = this.NestedTabs[tab_num];
			if (nested != null && nested.Tabs.length > 0) {
				nested._showAll();
				if (nested.CurrentTab == -1) nested.ToggleTab(0);
				this._setStyle(nested.Tabs[nested.CurrentTab].content, "visibility: visible;");
				nested.Tabs[nested.CurrentTab].visible = true;
				nested.IgnoreKeyboard = false;
			}
		}
	}

	this._addTopTab = function (tab) {
		//console.log("LibTabs:_addTopTab(", tab, ")");
		// First, add the top tab classname
		tab.setAttribute('class', tab.getAttribute('class')+" top_tab");
		var name = null;
		var content = null;
		var children = tab.childNodes;
		var left = 0;
		var excluded = this.ExcludedTabs;
		for (child in children) {
			if (children[child].nodeType != undefined && 
					children[child].nodeType != Node.TEXT_NODE) {
				var child_class = children[child].getAttribute("class");

				//
				if (excluded != null && excluded.contains(children[child].firstChild.nodeValue)) {
					continue;
				}

				if (child_class == "tab_name" && name == null) {
					name = children[child];
					name.style.visibility = "visible";
					name.setAttribute("onclick", 
								  	this.ThisObj+".ToggleTab("+this.Tabs.length+");");
				}
				else if (child_class.indexOf("tab_content") != -1 && content == null)
					content = children[child];
				
			}
		}
		if (name != null && content != null) {
			var left = 0;
			if (this.Tabs.length != 0) {
				var last_name = this.Tabs[this.Tabs.length-1].name;
				left = last_name.offsetWidth+parseInt(last_name.style.left)+
						this.TAB_NAME_SPACING;
			}
				//console.log("TAB LEFT: ", last_name, left);
			//name.style.left = left+"px";
			//content.style.visibility = "hidden";
			this._setStyle(name, "left: "+left+"px");
			this._setStyle(content, "visibility: hidden");
			var t = new LibTabs_Tab(name, content, false);
			this.Tabs.push(t);
		}

	}

	this._addBottomTab = function (tab) {
		//console.log("LibTabs:_addBottomTab(", tab, ")");
		// First, add the top tab classname
		tab.setAttribute('class', tab.getAttribute('class')+" bottom_tab");
		var name = null;
		var content = null;
		var children = tab.childNodes;
		var left = 0;
		var excluded = this.ExcludedTabs;
		for (child in children) {
			if (children[child].nodeType != undefined && 
					children[child].nodeType != Node.TEXT_NODE) {
				var child_class = children[child].getAttribute("class");

				//
				if (excluded != null && excluded.contains(children[child].firstChild.nodeValue)) {
					continue;
				}

				if (child_class == "tab_name" && name == null) {
					name = children[child];
					name.style.visibility = "visible";
					name.setAttribute("onclick", 
								  	this.ThisObj+".ToggleTab("+this.Tabs.length+");");
				}
				else if (child_class.indexOf("tab_content") != -1 && content == null)
					content = children[child];
				
			}
		}
		if (name != null && content != null) {
			///// Since this is a bottom tab, we're going to swap their locations
			tab.innerHTML = "";
			tab.appendChild(content);
			tab.appendChild(name);

			var left = 0;
			if (this.Tabs.length != 0) {
				var last_name = this.Tabs[this.Tabs.length-1].name;
				left = last_name.offsetWidth+parseInt(last_name.style.left)+this.TAB_NAME_SPACING;
				//console.log("TAB LEFT: ", left);
			}
			this._setStyle(name, "left: "+left+"px");
			this._setStyle(content, "visibility: hidden");
			var t = new LibTabs_Tab(name, content, false);
			this.Tabs.push(t);
		}

	}

	this._addLeftTab = function (tab) {
		//console.log("LibTabs:_addLeftTab(",tab,")");
		// First, add the left tab classname
		tab.setAttribute('class', tab.getAttribute('class')+" left_tab");
		var name = null;
		var content = null;
		var children = tab.childNodes;
		var left = 0;
		for (child in children) {
			if (children[child].nodeType != undefined && 
					children[child].nodeType != Node.TEXT_NODE) {
				var child_class = children[child].getAttribute("class");
				if (child_class == "tab_name" && name == null) {
					name = children[child];
					name.style.visibility = "visible";
					name.setAttribute("onclick", 
									  this.ThisObj+".ToggleTab("+this.Tabs.length+");");
				}
				else if (child_class.indexOf("tab_content") != -1 && content == null)
					content = children[child];
				
			}
		}
		if (name != null && content != null) {
			var top = 0;
			//console.log("DEBUGGING 1: top = "+top);
			//this._setStyle(name, "width: "+(this._gutterWidth+6)+"px;");
			
			if (this.Tabs.length != 0) {
				//console.log("DEBUGGING 1:   Tabs = ",this.Tabs);
				var last_name = this.Tabs[this.Tabs.length-1].name; // FIXME: weird assumption
				/*
				console.log("DEBUGGING 1:   last_name = ",last_name);
				console.log("DEBUGGING 1:       offsetHeight = ",last_name.offsetHeight);
				console.log("DEBUGGING 1:       parent.offsetHeight = ",last_name.parentNode.offsetHeight);
				console.log("DEBUGGING 1:       child.offsetHeight = ",last_name.firstChild.offsetHeight, last_name.childNodes);
				console.log("DEBUGGING 1:       clientHeight = ",last_name.clientHeight);
				console.log("DEBUGGING 1:       top1 = ",last_name.style.top);
				console.log("DEBUGGING 1:       top2 = ",getStyleProperty(last_name, "top"));
				console.log("DEBUGGING 1:       top3 = ",findPos(last_name)[1]);
				console.log("DEBUGGING 1:       top4 = ",last_name.offsetTop);
				*/
				// need to figure out TOP
				//top = findPos(last_name)[1]+this.TAB_NAME_SPACING;
				//top = last_name.offsetHeight+parseInt(this._getStyleProperty(last_name, "top"))+
				top = last_name.offsetHeight+parseInt(last_name.style.top)+(this.TAB_NAME_SPACING-2);
					if (!this.Reloaded) top += 8; // FIXME
			}
			//console.log("DEBUGGING 2: top = "+top);
			this._setStyle(name, "top: "+top+"px");
			this._setStyle(content, "visibility: hidden");
			var t = new LibTabs_Tab(name, content, false);
			this.Tabs.push(t);
		}

	}

	this._getNested = function(e) {
		//console.log(this.ThisObj, "getNested()", e);
		var tab_divs = e.getElementsByTagName("div");
		var tab_content = null;
		for (var i = 0; i < tab_divs.length; i++) {
			if (tab_divs[i].getAttribute("class") == "tab_content") {
				tab_content = tab_divs[i];
				break;
			}
		}
		if (tab_content == null) return null;
		//console.log(this.ThisObj, "  tab_content", tab_content);

		var tab_content_divs = tab_content.getElementsByTagName("div");
		for (var i = 0; i < tab_content_divs.length; i++) {
			if (tab_content_divs[i].getAttribute("class") == "tab_content") {
				return tab_content_divs[i].parentNode.parentNode;
			}
		}
		return null;
	}

	// Public Methods
	this.LoadTabs = function (tabs_lyr, start_tab) {
		//console.log(this.ThisObj, "LibTabs:LoadTabs(",tabs_lyr,", "+start_tab+")");
		if (tabs_lyr == null) return;

		this.ParentLyr = tabs_lyr;
		this._gutterWidth = 0;

		var elems = tabs_lyr.getElementsByTagName("div");
		// Create the nested tabs array
		this.NestedTabs = [];
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].getAttribute("class") == "tab") {
				//console.log("TAB: ", elems[i]);

				var nest = this._getNested(elems[i]);
				if (nest != null) {
					var nested_tabs = new LibTabs(
									this.ThisObj+".NestedTabs["+(this.Tabs.length)+"]", 
									nest, 0, 
									this.Orientation+1);
					this.NestedTabs[this.Tabs.length] = nested_tabs;
					nested_tabs.HandleKeyboardInputs();
					nested_tabs.IgnoreKeyboard = true;
					if (nested_tabs.Tabs.length > 0)
						nested_tabs._hideAll();
				}

				switch (this.Orientation) {
				case LibTabs_Orientation.RIGHT: 
				case LibTabs_Orientation.LEFT: this._addLeftTab(elems[i]); break;
				case LibTabs_Orientation.TOP: this._addTopTab(elems[i]); break;
				case LibTabs_Orientation.BOTTOM: this._addBottomTab(elems[i]); break;
				}
				// Determine the maximum tab width
				if (this.Orientation == LibTabs_Orientation.LEFT || 
					this.Orientation == LibTabs_Orientation.RIGHT) {

					var tabWidth = this.Tabs[this.Tabs.length-1].name.offsetWidth; 
					if (tabWidth > this._gutterWidth)
						this._gutterWidth = tabWidth;
				}
			}
		}

		if (this.Orientation == LibTabs_Orientation.LEFT || 
			this.Orientation == LibTabs_Orientation.RIGHT) {

			//console.log(this.ThisObj, "GW1:", this._gutterWidth);
			this._gutterWidth = 70;
			for (var i = this.Tabs.length-1; i >= 0; i--) {
				var tab = this.Tabs[i];	
				this._setStyle(tab.name, "width: "+(this._gutterWidth+6)+"px;");
				this._setStyle(tab.content, "left: "+(this._gutterWidth+18)+"px;");
			}
		}

		// Now toggle the start tab
		if ((this.Orientation == LibTabs_Orientation.TOP || 
				this.Orientation == LibTabs_Orientation.BOTTOM) 
					&& start_tab != undefined)  {
			this.ToggleTab(start_tab);
		}
	}

	this.ReloadTabs = function () {
		this.Tabs = [];
		this.Reloaded = true;
		this.LoadTabs(this.ParentLyr, this.CurrentTab);
	}

	this.ToggleTab = function (tab_num) {
		//console.log(this.ThisObj+".LibTabs:ToggleTab("+tab_num+"): "+this.Tabs.length, this.CurrentTab);
		if (tab_num < 0 || tab_num >= this.Tabs.length) return null; // ERROR HANDLING
		//if (this.CurrentTab == tab_num) return;
		var ct = this.CurrentTab;
		var tl = this.Tabs;

		this._hideTab(tl, ct);
		this._showTab(tl, tab_num, this);
		this.CurrentTab = tab_num;
		this.Tabs[this.CurrentTab].content.focus();

		for (var i = 0; i < this.ToggleListeners.length; i++) {
			this.ToggleListeners[i](ct, this.CurrentTab);
		}

	}
	this.AddToggleListener = function (l) {
		if (l != null)
			this.ToggleListeners.push(l);
	}

	this.NextTab = function () {
		//console.log("LibTabs:NextTab()", this);
		this.ToggleTab((this.CurrentTab+1) % this.Tabs.length);
	}
	
	this.PrevTab = function () {
		this.ToggleTab(((this.CurrentTab == 0) ? this.Tabs.length : this.CurrentTab)-1);
	}

	this.Size = function () {
		return this.Tabs.length;
	}

	this.HandleKeyboardInputs = function() {
		LibTabs_keyboardListeners.push(this.ThisObj);
		if (document.onkeydown == null) {
			document.onkeydown = LibTabs_tabsNav;
			if (document.layers) document.captureEvents(Event.KEYDOWN);
		}
	}

	// MAIN
	if (tabs_lyr != null)
		this.LoadTabs(tabs_lyr, start_tab);
};
