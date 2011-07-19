//******************************************************************************

var pathInfo = new Object();

// If a parameter is passed to show_help.htm, use it to find the topic ID.
// Else open default files.
// The software application doesn't need to load this JS file to access the
// showHelp() function. It only needs to open show_help.htm (with a topic ID
// attached) in whatever help container it uses (C#, iframe, or browser).
//
if (window.location.search) {

  // Get the parameter string and remove the "?" symbol.
  var topicPath = window.location.search;
  var parameterString = topicPath.substring(1);

  // Test for "mode" parameter. 
  if (parameterString.indexOf("&") != -1) {
    var parameterArray = parameterString.split("&");
    var topicID = parameterArray[0];
    var mode = parameterArray[1];
  }
  else {
    var topicID = parameterString;
    var mode = "";
  }
}
else {
  var topicID = "";
  var mode = "";
}

// Open the topic specified by the topic ID.
showHelp(topicID, mode);


// Displays online help based on parameters passed by application help link.
// Can call it directly or indirectly by calling show_help.htm (which loads
// this file).
//
function showHelp(topicID, mode) {

  // "pathInfo" is initialized at top of this file.
  pathInfo = findTopic(topicID, mode);
  displayTopic(pathInfo, mode);
}


// Find the topic path from the topic ID in doc_map.js.
//
function findTopic(topicID, mode) {
  var mapData = "";
  var mapID = "";
  var topicData = "";
  var topicPath = "";
  var pathOnly = "";
  var foundItem = "";

  // Array "docTopics" is defined in doc_map.js.
  // Test each map file entry to see if its topic ID matches the topic ID 
  // passed in the parameter.
  for (i = 0; i < docTopics.length; i++) {
    mapData = docTopics[i].split("[");
    mapID = mapData[0];

    // Save the complete topic path.
    topicData = mapData[1].split("]");
    topicPath = topicData[1];

    // If the topic IDs match, save the path by removing the file name.
    if (mapID == topicID) {
      foundItem = "true";
      var extractFile = /[A-za-z0-9_]+\.htm#*.*/gi;
      pathOnly = topicPath.replace(extractFile,"");
      break;
    }
  }

  // If no topic is found in the map data, open the default files.
  if (foundItem != "true") {
    topicPath = "default.htm";
    pathOnly = "default/";
  }

  pathInfo.topicPath = topicPath;
  pathInfo.pathOnly = pathOnly;
  return pathInfo;
}


// Display the topic based on the mode. 
//
function displayTopic(pathInfo, mode) {
  var topicPath = pathInfo.topicPath;
  var pathOnly = pathInfo.pathOnly;  

  switch (mode) {
    case "topiconly":
      window.location = pathOnly + "doc_frameset_no_nav.htm?" + topicPath;
      break;

    case "popup":
      window.location = topicPath + "&popup";
      break;

    default:
      window.location = pathOnly + "doc_frameset.htm?" + topicPath;
  }
}

