//******************************************************************************

// Read or update the "DocCookie" content based on parameters passed.
//
function docCookie(action,name,value) {
  var cookieString = readCookie("DocCookie");

  // If the cookie exists, process it. Else, if "action" is "write", create
  // the cookie with the name-value pair.
  if (cookieString) {

    // Create an array of all the name-value pairs in the cookie. Use comma 
    // delimiter because browsers interpret semicolons as separate cookies.
    var pairArray = cookieString.split(",");
    var pair = "";
    var nameValueArray = "";
    var updatedString = "";

    // Perform different processing based on "action" parameter.
    if (action == "read") {
      for (i = 0; i < pairArray.length; i++) {
        pair = pairArray[i];
        nameValueArray = pair.split("=");

        // If item name matches "name" parameter, return its value.
        if (nameValueArray[0] == name) {
          return nameValueArray[1];
          break;
        }
      }
    }
    else if (action == "write") {
      var pairExists = "";

      for (i = 0; i < pairArray.length; i++) {
        pair = pairArray[i];
        nameValueArray = pair.split("=");

        // If item name matches "name" parameter, replace its value with 
        // "value" parameter.
        if (nameValueArray[0] == name) {
          pairExists = "true";
          nameValueArray[1] = value;
        }

        // Insert a comma delimiter only if the string already exists.
        if (updatedString == "") {
          updatedString = updatedString + nameValueArray[0] + "=" + nameValueArray[1];
        }
        else {
          updatedString = updatedString + "," + nameValueArray[0] + "=" + nameValueArray[1];
        }
      }

      // If the name-value pair exists, update it in the cookie string.
      // Else append it to the end of the cookie string.
      if (pairExists != "true") {
        updatedString = updatedString + "," + name + "=" + value;
      }
      createCookie("DocCookie",updatedString,1);
    }
    else if (action == "delete") {
      for (i = 0; i < pairArray.length; i++) {
        pair = pairArray[i];
        nameValueArray = pair.split("=");

        // If item name matches "name" parameter, omit it when update cookie.
        if (nameValueArray[0] != name) {

          // Insert a comma delimiter only if the string already exists.
          if (updatedString == "") {
            updatedString = updatedString + nameValueArray[0] + "=" + nameValueArray[1];
          }
          else {
          updatedString = updatedString + "," + nameValueArray[0] + "=" + nameValueArray[1];
          }
        }
      }
      createCookie("DocCookie",updatedString,1);
    }
  }
  else if (action == "write") {

    // Cookie doesn't exist, so create it with the parameter values. 
    createCookie("DocCookie",name + "=" + value,1);
  }
}


// Deletes all doc cookies from user's PC. Called by script in frameset file.
//
function cleanUp() {
  eraseCookie("DocCookie");

  // Used only by NS. Don't delete them. Must persist across framesets.
//  eraseCookie("TOCRestoreWidth");
//  eraseCookie("PreviousNavFrame");
}


// Creates a cookie using the parameters provided.
//
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else {
		var expires = "";
	}
	document.cookie = name+"="+value+expires+"; path=/";
}


// Reads the cookie that has the provided name.
//
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');

	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


// Erases the cookie that has the provided name.
//
function eraseCookie(name) {
	createCookie(name,"",-1);
}

