//******************************************************************************

// Displays topics in a secondary window. Used by links in topics.js and
// popoutButton() in toolbar.js
//
function showSecondaryWindow(linkTarget) {

  // Get the resolution and available area of screen to size new window.
  var screenWidth = screen.width;
  var screenHeight = screen.height;
  var windowWidth = screenWidth - 50;
  var windowHeight = screenHeight - 100;

  // Get the topic file name.
  var extractFile = /[A-za-z0-9_]+\.htm/gi;
  var topicFile = linkTarget.match(extractFile);
  topicFile = topicFile.toString();
  var ns62Char = /[\[\"\]]/gi;
  topicFile = topicFile.replace(ns62Char,"");

  // Get the path to the topic folder. If clicked Popout Window button in
  // toolbar, path is at doc root level.
  var topicPath = linkTarget.replace(extractFile,"");
  topicPath = topicPath.toString();
  var ns62Char = /[\[\"\]]/gi;
  topicPath = topicPath.replace(ns62Char,"");
  var extractParameter = /\?[A-za-z0-9_]+/gi;
  topicPath = topicPath.replace(extractParameter,"");

  // Open the secondary window.
  if (window.name == "DocSecondary") {
    window.location.href = topicFile;
  }
  else {
    if (is_ie) {
      var secondaryWindow = showModelessDialog(topicPath + "doc_frameset_secondary.htm",topicFile,"dialogWidth:" + windowWidth + "px; dialogHeight:" + windowHeight + "px; help: no; resizable: yes; status: no;");
    }
    else {
      var secondaryWindow = window.open(topicPath + "doc_frameset_secondary.htm?" + topicFile, "DocSecondaryFrameset", "height=" + windowHeight + ",width=" + windowWidth + ",dependent=yes,resizable=yes,scrollbars=yes,menubar=no,location=no,status=no,toolbar=no");

      // Force the focus on the secondary window so it's not hidden by other windows.
      secondaryWindow.focus();
    }
  }
}

