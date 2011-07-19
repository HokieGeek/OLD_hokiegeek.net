//******************************************************************************

// If topic wasn't opened in a frameset, determine whether to open it in a
// frameset. After first topic is opened, subsequent topics are in a frameset,
// so "Toolbar" always exists after that, and this code doesn't run anymore.
// Don't run this code in a secondary window.
//
if (!top.Toolbar && !top.DocSecondary) {
  var topicPath = window.location.href;
  var extractFile = /[A-za-z0-9_]+\.htm/gi;
  var topicFile = topicPath.match(extractFile);

  // For NS6.
  topicFile = topicFile.toString();
  var ns62Char = /[\[\"\]]/gi;
  topicFile = topicFile.replace(ns62Char,"");

  // Test for "mode" parameter.
  if (topicPath.indexOf("&") != -1) {
    var parameterArray = topicPath.split("&");
    var mode = parameterArray[1];
  }

  // If a popup topic, allow it to open without the frameset and set "IsPopup"
  // so initTopic() in topics.js will process it as a popup.
  // Else redirect the window to one of the frameset files based on "doc_type".
  if (window.name == "DocPopup" || mode == "popup") {
    docCookie("write","IsPopup","true");

    // Assign a function to delete cookies.
    window.onunload = cleanUp;
  }
  else if (doc_type == "frameset") {
    window.location.replace("doc_frameset.htm?" + topicFile + "&reopen");
  }
  else {
    window.location.replace("doc_frameset_no_nav.htm?" + topicFile + "&reopen");
  }
}

