//******************************************************************************

// Set global variable.
var topicPath = "";

// Assign a function to delete cookies. Place these at end of file because 
// they cause NS to immediately delete all cookies.
if (is_ie) {
  window.onunload = cleanUp;
}
else if (is_ns) {
  // The onunload event doesn't work in Netscape 7 here, but onload does. But 
  // don't use onload because must run cleanUp() before init() runs in the 
  // first page.
  cleanUp();
}

// If a parameter is passed to the frameset file, use it to set "topicPath",
// which identifies the topic file in the src attribute of the Topic frame. 
// Else open default files. The "mode" currently isn't used.
//
if (window.location.search) {

  // Get the parameter string and remove the "?" symbol.
  var topicPath = window.location.search;
  var parameterString = topicPath.substring(1);

  // Extract the topic path and "mode" parameter from the parameter string.
  if (parameterString.indexOf("&") != -1) {
    var parameterArray = parameterString.split("&");
    var topicPath = parameterArray[0];
    var mode = parameterArray[1];
  }
  else if (window.location.hash) {
    var hashString = window.location.hash;
    var hashComponents = hashString.split("&");
    var mode = hashComponents[1];
    var topicPath = parameterString;
  }
  else {
    var topicPath = parameterString;
  }

  // Extract the file name from the topic path. This becomes the "topicPath"
  // used by the Topic frame.
  var extractFile = /[A-za-z0-9_]+\.htm/i;
  var fileOpened = topicPath.match(extractFile);
  fileOpened = fileOpened.toString();
  var ns62Char = /[\[\"\]]/gi;
  fileOpened = fileOpened.replace(ns62Char,"");

  // If topic is first topic, mark it as "first_topic".
  // Used by initTopic() in topics.js to control Back button.
  // If cookie "FirstTopic" doesn't exist, no first topic exists, so make current topic
  // the first topic. "FirstTopic" is set by initTopic() in topics.js.
  var firstExists = docCookie("read","FirstTopic");
  if (!firstExists) {
    var topicPath = fileOpened + "?first_topic";
  }
  else {
    var topicPath = fileOpened;
  }
}
else {
  var topicPath = "title.htm" + "?first_topic";
}

var framesetFile = window.location.href;
framesetFile = framesetFile.match(extractFile);

// For NS6.
framesetFile = framesetFile.toString();
var ns62Char = /[\[\"\]]/gi;
framesetFile = framesetFile.replace(ns62Char,"");

// If topic was opened by itself in a browser window, close the window and open
// it again to control its appearance. "reopen" is passed by setup_topic.js.
// If "doc_type" is "topiconly" and is opened in doc_frameset.htm (as is done by
// show_help.htm when no &topiconly parameter is passed), open the topic without
// the Navigation frame. "doc_type" is set by doc_type.js in the data folder.
if (mode == "reopen") {

  // Calculate doc window size based on screen resolution.
  // Used to open a standard doc window if needed and to position it.
  var screenWidth = screen.width;
  var screenHeight = screen.height;

  if (screenWidth > 1024) {
    var windowHeight = screenHeight / 2;
    var windowWidth = screenWidth / 2;
  }
  else {
    var windowHeight = screenHeight / 1.5;
    var windowWidth = screenWidth / 1.5;
  }

  var windowLeft = (screenWidth - windowWidth) / 2;
  var windowTop = (screenHeight - windowHeight) / 2;

  // The topic wasn't opened in the standard doc window, so close it.
  window.close();

  // Open a new doc window using the standard size, position, and features.
  if (doc_type == "frameset") {
    var docWindow=window.open("doc_frameset.htm?" + topicPath, "DocMain", "width=" + windowWidth + ",height=" + windowHeight + ",left=" + windowLeft + ",top=" + windowTop + ",resizable=yes,scrollbars=yes,menubar=no,location=no,status=no,toolbar=no");
  }
  else {
    var docWindow=window.open("doc_frameset_no_nav.htm?" + topicPath, "DocMain", "width=" + windowWidth + ",height=" + windowHeight + ",left=" + windowLeft + ",top=" + windowTop + ",resizable=yes,scrollbars=yes,menubar=no,location=no,status=no,toolbar=no");
  }
}
else if (doc_type == "topiconly" && framesetFile == "doc_frameset.htm") {
  window.location = "doc_frameset_no_nav.htm?" + topicPath;
}

