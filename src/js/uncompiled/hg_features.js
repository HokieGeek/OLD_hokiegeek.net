function HG_Feature(title, data_update, data_retriever, update_rate) {
	this.title = title;
	this.data = null;
	this.data_updated = false;
	this.data_update_callback = data_update;
	this.data_retriever_callback = data_retriever;
	this.update_rate = update_rate;
	this.created = false;
}

function HG_FeatureView(data, renderer) {
	this.data = data;
	this.content_renderer = renderer;

	this.elem = null;
	this.HG_FEATURE_CLASS = "hg_feature";
	this.HG_FEATURE_HEADER_CLASS = "hg_feature_header";
	this.HG_FEATURE_CONTENT_CLASS = "hg_feature_content";
}

HG_FeatureView.prototype._createHeader = function() {
	var header = document.createElement("div");
	header.setAttribute("class", this.HG_FEATURE_HEADER_CLASS);
	header.appendChild(document.createTextNode(this.data.title));
    header.appendChild(document.createElement("hr"));

	this.elem.appendChild(header);
}

HG_FeatureView.prototype.create = function() {
	this.elem = document.createElement('div');
	this.elem.setAttribute("class", this.HG_FEATURE_CLASS);
	//this.elem.setAttribute("style", "height: "+this.height+"px; width: "+this.width+"px");

	// Add the header
	this._createHeader();

	// Add the content
	var content = document.createElement("div");
    content.setAttribute("id", "feature_"+this.data.title.toLowerCase()
														 .replace(/\s/g, "_")
														 .replace(/,/g, ""));
	content.setAttribute("class", this.HG_FEATURE_CONTENT_CLASS);
	this.elem.appendChild(content);

	this.created = true;
}

HG_FeatureView.prototype.render = function() {
	return this.content_renderer(this.elem.lastChild);
}

HG_FeatureView.prototype.refresh = function() {
	this.elem.lastChild.innerHTML = "";
	this.render();
}

//===============================//
//======= FEATURE MANAGER =======//
//===============================//
//TODO: scheduler for the features
function HG_FeatureManager() { 
	this.elem = null;
	this.features = [];
	this.initial_create = true;

	// CONSTANTS
	this.HG_FEATURES_CLASS = "hg_features";
}

HG_FeatureManager.prototype._dataRetrieved = function(feature_idx) {
	// TODO: checks
	this.features[feature_idx].data.data_update_callback();
	this.renderFeature(feature_idx);
}

HG_FeatureManager.prototype.renderFeature = function(feature_idx) {
	// TODO: checks
	var f = this.features[feature_idx];
	if (f.data.data_updated) {
		if (!f.created) {
			if (this.initial_create) {
				this.elem.innerHTML = "";
				this.initial_create = false;
			}
			f.create();
			this.elem.appendChild(f.elem);
		}
		f.render();
	} else {
		var retriever = f.data.data_retriever_callback;
		if (retriever != null) {
			HG_FeatureManager_dataLoadingTimer(retriever(), this, feature_idx);
        } else {
			this._dataRetrieved(feature_idx);
        }
	}
}

HG_FeatureManager.prototype.addFeature = function(feature) {
	if (feature == null) return false;
	//feature.create();
	//this.elem.appendChild(feature.elem);
	this.features.push(feature);
	this.renderFeature(this.features.length-1);
	return true;
}

HG_FeatureManager.prototype.create = function(elem) {
	this.elem = elem;
	this.elem.setAttribute("class", this.HG_FEATURES_CLASS);
}

function HG_FeatureManager_dataLoadingTimer(condition, manager, feature_idx, first) {
	if (eval(condition)) {
		manager._dataRetrieved(feature_idx);
	} else {
		setTimeout(function() { HG_FeatureManager_dataLoadingTimer(condition, manager, feature_idx, false); }, 5000);
	}
}
