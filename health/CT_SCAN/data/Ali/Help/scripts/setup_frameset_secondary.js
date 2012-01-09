//******************************************************************************

window.name = "DocSecondaryFrameset";

onunload = resetSecFirstTopic;

if (is_ie) {
  var topicPath = dialogArguments;
}
else {
  // Obtain resolution and available area of screen to size new window.
  var screenWidth = screen.width;
  var screenHeight = screen.height;
  var windowWidth = screenWidth - 35;
  var windowHeight = screenHeight - 35;

  // Calculate position to place window so it's centered on the screen.
  var windowX = (screenWidth - windowWidth) / 2;
  var windowY = (screenHeight - windowHeight) / 2;
  top.moveTo(windowX,windowY);

  // Extract the target file name.
  if (window.location.search) {

    // Get the parameter string and remove the "?" symbol.
    var topicPath = window.location.search;
    var parameterString = topicPath.substring(1);
    var topicID = parameterString;

    var extractFile = /[A-za-z0-9_]+\.htm/gi;
    var fileOpened = topicID.match(extractFile);
    fileOpened = fileOpened.toString();
    var ns62Char = /[\[\"\]]/gi;
    fileOpened = fileOpened.replace(ns62Char,"");

    var topicPath = fileOpened;
    var pathOnly = "";
  }
}


// Reset "SecondaryFirstTopic". The cookie is also reset by backButton();
//
function resetSecFirstTopic() {
  docCookie("write","SecondaryFirstTopic","");
}
 