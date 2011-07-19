//******************************************************************************

var offMargin = "2px 0px 0px 4px";
var overMargin = "2px 0px 0px 4px";
var downMargin = "3px 0px 0px 5px";

// Initialize the toolbar after it first loads. Test for "Toolbar" frame
// because toolbar.js is also loaded by the frameset file.
if (window.name == "Toolbar") {
  onload = initToolbar;
}


// Set padding on the buttons after the toolbar loads.
//
function initToolbar() {
  var backButton = document.getElementById("BackButton");
  var printButton = document.getElementById("PrintButton");
  var popoutButton = document.getElementById("PopoutButton");

  setButtonIconPosition(backButton,offMargin);
  setButtonIconPosition(printButton,offMargin);
  setButtonIconPosition(popoutButton,offMargin);

  // For secondary windows, hide unwanted toolbar buttons.
  if (top.DocSecondary) {
    popoutButton.style.display = "none";
//    backButton.style.left = "10";
//    printButton.style.left = "50";

    var backButtonIcon = document.getElementById("BackButtonIcon");
    backButtonIcon.src = "images/back_off.gif";
  }
}


// Sets button padding for various mouse events to make the button look like it 
// was pressed down and then released. Used by other button functions.
// "clickedButton" originates in function call in button DIV in toolbar.htm.
//
function setButtonIconPosition(clickedButton,marginStyle) {
  var buttonIcon = getButtonIcon(clickedButton);
  buttonIcon.style.margin = marginStyle;
}


// Toggles the icon displayed in a button. Used by other button functions.
// "clickedButton" originates in function call in button DIV in toolbar.htm.
//
function toggleButtonIcon(clickedButton) {
  var buttonIcon = getButtonIcon(clickedButton);
  if (buttonIcon) {
    var iconSrc = buttonIcon.src;
    var iconOff = /_off/;
    var iconOn = /_on/;
    var extractIconFile = /[A-za-z0-9_\-%]+\.gif/gi;
    var iconPath = iconSrc.replace(extractIconFile,"");
    var iconFile = iconSrc.match(extractIconFile);
    iconFile = iconFile.toString();

    // Needed by NS62.
    var ns62Char = /[\[\"\]]/gi;
    iconFile = iconFile.replace(ns62Char,"");

    // Process icon file name separately to avoid replacing "_on" and "_off"
    // characters that may exist in the path.
    if (iconSrc.indexOf("off") != -1) {
      iconFile = iconFile.replace(iconOff,"_on");
      buttonIcon.src = iconPath + iconFile;
    }
    else {
      iconFile = iconFile.replace(iconOn,"_off");
      buttonIcon.src = iconPath + iconFile;
    }
  }
}


// Gets the button icon node. Used by other button functions.
//
function getButtonIcon(clickedButton) {
  if (is_ie) {
    var buttonIcon = clickedButton.childNodes[0];
  }
  else if (is_ns) {
    var buttonIcon = clickedButton.childNodes[1];
  }
  return buttonIcon;
}


// Displays a button with its "active" appearance when move pointer over it.
// "clickedButton" is passed by function call in button DIV in toolbar.htm.
//
function mouseOverButton(clickedButton) {
  if (is_ie) {
    // If user moves mouse within the button, exit without doing anything.
    if (window.event && clickedButton.contains(window.event.fromElement)) {
      return false;
    }
  }

  // Applies to all buttons except Back button when first topic is displayed.
  // "NotFirstTopic" is set by initTopic() in topics.js.
  var notFirstTopic = docCookie("read","NotFirstTopic");
  if (clickedButton.id != "BackButton" || notFirstTopic == "true" || top.DocSecondary) {
    clickedButton.style.backgroundColor = overBackColor;
    clickedButton.style.color = overTextColor;
    clickedButton.style.borderColor = overBorderColor;
//    setButtonIconPosition(clickedButton,overPadding);
    toggleButtonIcon(clickedButton);
  }
}


// Displays a button with its "inactive" appearance when move pointer off it.
// "clickedButton" is passed by function call in button DIV in toolbar.htm.
//
function mouseOffButton(clickedButton) {
  if (is_ie) {
    // If user moves mouse within the button, exit without doing anything.
    if (window.event && clickedButton.contains(window.event.toElement)) {
      return false;
    }
  }

  clickedButton.style.backgroundColor = offBackColor;
  clickedButton.style.borderColor = offBorderColor;
  clickedButton.style.color = offTextColor;
  setButtonIconPosition(clickedButton,offMargin);
  toggleButtonIcon(clickedButton);

  // For NavFrameButton. Makes it visible after hidden during transition.
  var buttonIcon = getButtonIcon(clickedButton);
  buttonIcon.style.visibility = "visible";

  // Delete "BackButtonActive" cookie because button is no longer "active".
  // Cookie is set by mouseClickUp().
  if (top.Topic) {
    docCookie("delete","BackButtonActive");
  }
  else if (top.DocSecondary) {
    docCookie("delete","SecondaryBackButtonActive");
  }
}


// Displays button with "clicked" appearance when mouse button is pressed down.
// "clickedButton" is passed by function call in button DIV in toolbar.htm.
//
function mouseClickDown(clickedButton) {

  // Applies to all buttons except Back button when first topic is displayed.
  var notFirstTopic = docCookie("read","NotFirstTopic");
  if (clickedButton.id != "BackButton" || notFirstTopic == "true" || top.DocSecondary) {
    clickedButton.style.borderColor = downBorderColor;
    setButtonIconPosition(clickedButton,downMargin);
  }
}


// Performs the button function when the mouse button is released.
// "clickedButton" is passed by function call in button DIV in toolbar.htm.
//
function mouseClickUp(clickedButton) {
  switch (clickedButton.id) {
    case "BackButton":
      backButton();

      // Set "BackButtonActive" cookie to remain while pointer is on button.
      // Cookie is deleted by mouseOffButton().
      if (top.Topic) {
        docCookie("write","BackButtonActive","true");
      }
      else if (top.DocSecondary) {
        docCookie("write","SecondaryBackButtonActive","true");
      }

      // Keep "active" appearance after click so looks ready to click again.
      // Else if is first topic, give it a "disabled" appearance.
      var notFirstTopic = docCookie("read","NotFirstTopic");
      if (notFirstTopic == "true") {
        clickUpRestore(clickedButton);
      }
      else {
        clickedButton.style.backgroundColor = offBackColor;
        clickedButton.style.color = offTextColor;
        clickedButton.style.borderColor = offBorderColor;
        setButtonIconPosition(clickedButton,offMargin);
      }
      break;
    case "PrintButton":
      clickUpRestore(clickedButton);
      printButton();
      break;
    case "PopoutButton":
      clickUpRestore(clickedButton);
      popoutButton();
      break;
  }
}


// Keeps "active" appearance after click so looks ready to click again.
// Used by mouseClickUp().
//
function clickUpRestore(clickedButton) {
  clickedButton.style.backgroundColor = overBackColor;
  clickedButton.style.color = overTextColor;
  clickedButton.style.borderColor = overBorderColor;
  setButtonIconPosition(clickedButton,overMargin);
}


// Duplicates browser's Back button. Used by mouseClickUp().
//
function backButton() {

  if (top.DocSecondary) {
    top.history.back();

    // If clicked Back on first secondary topic, close the window.
    // "SecondaryFirstTopic" is set by initTopic() in topics.js.
    // Test for !secondaryFirstTopic in case DocMain window is closed while
    // DocSecondary is open (closing DocMain deletes all cookies). "undefined"  
    // is needed by NS6 because it's so slow (closes it every time click Back).
    // IE modeless dialogs have no history, so always close it.
    var secondaryFirstTopic = docCookie("read","SecondaryFirstTopic");
    if (top.history.length == 0 || !secondaryFirstTopic || top.DocSecondary.location.href == secondaryFirstTopic || secondaryFirstTopic == "undefined") {

      // "SecondaryFirstTopic" is also reset by close() to handle clicking the 
      // Close button.
      docCookie("write","SecondaryFirstTopic","");
      top.close();
    }
  }
  else {
    // Go back only if Back button is enabled. "BackDisabled" is set by 
    // initTopic() in topics.js.
    var backDisabled = docCookie("read","BackDisabled");
    if (backDisabled != "true") {
      top.history.back();
    }
  }
}


// Prints the page in the "Topic" frame using the browser's print function.
// Used by mouseClickUp().
//
function printButton() {
  if (top.Topic) {
    // Focus needed for IE but not NS.
    top.Topic.focus();
    top.Topic.print();
  }
  else if (top.DocSecondary) {
    top.DocSecondary.focus();
    top.DocSecondary.print();
  }
}


// Displays the topic in a large secondary window.
// Used by mouseClickUp().
//
function popoutButton() {
  var topicFile = top.Topic.location.href;

  // The called function is also used by topic links in processClicks().
  showSecondaryWindow(topicFile);
}

