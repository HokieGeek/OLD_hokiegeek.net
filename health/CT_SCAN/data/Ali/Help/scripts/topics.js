//******************************************************************************

// Declare global variables.
//
// Used by blinkArrow().
var n = 0;

// Used by the popup block functions.
var popupTarget = "";
var samePage = "";


// For topipcs, call initTopic() after page loads so all nodes exist for processing.
// For popups in the "Hidden" frame, call showPopupBlock().
if (window.name != "Hidden") {
  onload = initTopic;
}
else if (window.name == "Hidden") {
  onload = showPopupBlock;
}


// Not currently used. Displays message when specified errors occur in the help.
//
function handleErrors(f,msg) {
  alert("Error in McKesson documentation code.\n\nFunction: " + f + "\nDescription: " + msg +"\n\nPlease report this error to your McKesson Support Representative.");

/*
  // Sample
  else {
    handleErrors("updateSectionTOCCookie()","No cookie with block ID that matches block closed by closeTOCBranch().");
  }
*/

}


// Sets up the page for events and initial display of elements.
//
function initTopic() {

  // Place focus on the topic so users can scroll using keyboard.
  if (window.name == "Topic") {
    top.Topic.focus();
  }

  // Assign the event handler in event_handler.js to all the links.
  setupLinks();

  // Set up any section TOCs.
  setupTOC();

  // Set up any drop-down blocks on the page.
  setupDropDowns();

  // If link was to a subtopic, highlight the subtopic.
  // Don't highlight it if clicked an index entry.
  var indexEntry = docCookie("read","IndexEntry");
  if (indexEntry != "true") {
    showSubtopic(window.location.href);
  }

  // Run syncTOC() only if clicked link not in TOC, and "Navigation" frame
  // is open, and wasn't a popup link. "ClickedTOC" and "PopupBlock" are set 
  // in processClick() in event_handler.js. 
  var inTOC = docCookie("read","ClickedTOC");
  var popupBlock = docCookie("read","PopupBlock");
  var syncFile = window.location.href;

  // Remove "first_topic" parameter from file name of first topic.
  if (syncFile.indexOf("?") != -1) {
    var parameterStart = syncFile.indexOf("?");
    syncFile = syncFile.substring(0, parameterStart);
  }

  if (inTOC != "true" && top.Navigation && popupBlock != "true") {
    syncTOC(syncFile);
  }
  else if (inTOC == "true") {

    // Prepare for next page by deleting the cookie.
    docCookie("delete","ClickedTOC");
  }

  // Save file name of first topic for Back button use. "NotFirstTopic" is
  // used by toolbar.js. "FirstTopic" is used by setup_frameset.js.
  var firstExists = docCookie("read","FirstTopic");
  if (!firstExists) {
    docCookie("write","FirstTopic",window.location.href);
    docCookie("write","NotFirstTopic","true");
  }

  // Process Back button only if topic not displayed in secondary window.
  // Control whether Back button is enabled or disabled by whether current topic
  // is first topic. Button appearance when clicked is controlled in toolbar.js.
  if (top.Toolbar && !top.DocSecondary) {

    // If current topic is same as first topic but isn't literal first topic,
    // don't disable Back button. The "first_topic" parameter (query string)
    // is added to the file name in setup_frameset.js.
    var popupBlock = docCookie("read","PopupBlock");
    var firstTopicFlag = window.location.search;
    firstTopicFlag = firstTopicFlag.substring(1);

    // Keep "first_topic" parameter in file name if click TOC link of first
    // topic after it first opens, but not if click it later. IE replaces first
    // history entry with file name without parameter. NS adds each click as
    // separate history entries. Doc-system Back button compensates: for IE
    // it duplicates browser's Back, and for NS it works correctly even though
    // browser's button doesn't. "PreviousTopic" is set at end of initTopic();
    var previousTopic = docCookie("read","PreviousTopic");
    if (previousTopic && previousTopic.indexOf("?") != -1) {
      var parameterStart = previousTopic.indexOf("?");
      var previousParameter = previousTopic.substring(parameterStart + 1);
      var withNoParameter = previousTopic.substring(0, parameterStart);

      // If current topic is same as previous, and previous had "first_topic"
      // flag, user clicked first-topic link, so reset history value as first
      // topic.
      if (window.location.href == withNoParameter && previousParameter == "first_topic") {
        window.location.replace(previousTopic);
        firstTopicFlag = "first_topic";
      }
    }

    if (firstTopicFlag == "first_topic") {
      docCookie("write","NotFirstTopic","false");
      var backButton = top.Toolbar.document.getElementById("BackButton");
      if (backButton) backButton.title = "No previous topic";
      var backButtonIcon = top.Toolbar.document.getElementById("BackButtonIcon");
      if (backButtonIcon) backButtonIcon.src = "images/back_disabled.gif";

      // Used by toolbar.js to prevent going back when button is disabled.
      docCookie("write","BackDisabled","true");
    }
    else if (popupBlock != "true") {
      docCookie("write","NotFirstTopic","true");
      var backButton = top.Toolbar.document.getElementById("BackButton");
      if (backButton) backButton.title = "Back to the previous topic";
      var backButtonIcon = top.Toolbar.document.getElementById("BackButtonIcon");

      // If mouse pointer isn't on Back button, set the icon to "off".
      // "BackButtonActive" is set by mouseClickUp() in toolbar.js.
      var backButtonActive = docCookie("read","BackButtonActive");
      if (backButtonActive != "true") {
        backButtonIcon.src = "images/back_off.gif";
      }
      docCookie("delete","BackDisabled");
    }
  }
  else if (top.Toolbar && top.DocSecondary) {
    // "SecondaryFirstTopic" is used by backButton() in toolbar.js.
    var secondaryFirstTopic = docCookie("read","SecondaryFirstTopic");
    if (!secondaryFirstTopic || secondaryFirstTopic == "") {
      docCookie("write","SecondaryFirstTopic",top.DocSecondary.location.href);
    }

    // Keep the Back button displayed.
    var backButton = top.Toolbar.document.getElementById("BackButton");
    if (backButton) backButton.title = "Back to the previous topic";
    var backButtonIcon = top.Toolbar.document.getElementById("BackButtonIcon");

    // If mouse pointer isn't on Back button, set the icon to "off".
    // "SecondaryBackButtonActive" is set by mouseClickUp() in toolbar.js.
    var secondaryBackButtonActive = docCookie("read","SecondaryBackButtonActive");
    if (secondaryBackButtonActive != "true") {
      if (backButtonIcon) backButtonIcon.src = "images/back_off.gif";
    }
  }

  // For IE, save current topic as previous topic. Used to control Back button.
  var previousTopic = window.location.href;
  docCookie("write","PreviousTopic",previousTopic);

  // If the topic is displayed as a popup by the application software, display
  // only the target popup text. "IsPopup" is set by setup_topic.js when topic
  // ID is used.
  if (window.name == "DocPopup" || docCookie("read","IsPopup") == "true") {
    docCookie("delete","IsPopup");
    setupPopupWindow();
  }
}


// Sets up drop-down content blocks identified by class "DropDownLink" for the 
// link paragraph and class "DropDownStop" for the terminating paragraph.
//
function setupDropDowns() {

  // Create collection of all the nodes on the page.
  var docBody = document.getElementsByTagName("body");
  var docNodes = docBody.item(0).childNodes;
  var inDropDown = "";
  var dropDownItems = new Array;
  var count = 0;

  // For each node that's part of drop-down content, store it in an array.
  for(i = 0; i < docNodes.length; i++) {
    var itemClass = docNodes.item(i).className;

    // If node is a link to a drop-down block, set a flag to "true".
    if (itemClass == "DropDownLink") {
      inDropDown = "true";
    }

    // If node is end of block, store it in the array and reset the flag.
    else if (itemClass == "DropDownStop") {
      dropDownItems[count] = docNodes.item(i);
      count++;
      inDropDown = "";
    }

    // If node is in drop-down block, store it in the array.
    if (inDropDown == "true") {
      if (docNodes.item(i).nodeType == 1) {
        dropDownItems[count] = docNodes.item(i);
        count++;
      }
    }
  }
  // Process the array to format the drop-down block nodes.
  formatDropDowns(dropDownItems);
}


// Formats drop-down block nodes in the array into dynamic drop-down blocks.
//
function formatDropDowns(dropDownItems) {
  var docBody = document.getElementsByTagName("Body");
  var blockID = 1;

  for(i = 0; i < dropDownItems.length; i++) {
    var dropDownItem = dropDownItems[i];

    // Make a link out of the link paragraph.
    if (dropDownItem.className == "DropDownLink") {
      var linkIndex = i;

      // Save the text of the link, which is a child of the paragraph node.
      var linkText = dropDownItem.childNodes.item(1);

      // Create a new node that's an anchor <a> tag.
      var linkAnchor = document.createElement("a");
      linkAnchor.id = "DropDownLink" + blockID;
      linkAnchor.setAttribute("href","JavaScript:toggleDropDown(" + blockID + ")");
      linkAnchor.setAttribute("title", "Click to view drop-down information.");
      linkAnchor.className = "DropDownLink";

      // Insert the new anchor as a child of the link paragraph node.
      dropDownItem.insertBefore(linkAnchor,linkText);

      // Assign the event handler "processClick()" to the new anchor.
      linkAnchor.onclick = processClick;

      // Create and insert an icon into the new anchor.
      var linkIcon = document.createElement("img");
      dropDownItem.insertBefore(linkIcon,linkAnchor);
      linkAnchor.appendChild(linkIcon);
      linkIcon.src = linksPath + "images/drop_down_open_icon.gif";
      linkIcon.id = "DropDownIcon" + blockID;
      linkIcon.className = "DropDownIcon";

      // Move the link text into the new anchor.
      linkAnchor.appendChild(linkText);

    }

    // If is the first node after the link node, start the drop-down block.
    if (i == linkIndex + 1) {

      // Create a new node that's a <div> tag.
      var dropDownBlock = document.createElement('div');
      dropDownBlock.id = "DropDownBlock" + blockID;
      dropDownBlock.className = "DropDownBlock";
      blockID++;

      // Insert the new <div> above the current node.
      docBody.item(0).insertBefore(dropDownBlock,dropDownItem);

      // Apply style because style sheets don't apply to created elements.
      dropDownBlock.style.display = "none";

      // Move the current node into the new <div> structure.
      dropDownBlock.appendChild(dropDownItem);
    }

    // If is any node after the first node, move it into the <div> structure.
    else if (i > linkIndex + 1) {

      // If is last node in the block, remove it so no blank line in display.
      if (dropDownItem.className == "DropDownStop") {
        docBody.item(0).removeChild(dropDownItems[i]);
      }
      else {
        dropDownBlock.appendChild(dropDownItem);
      }
    }
  }
}


// Toggles the display of the drop-down block identified by the link.
//
function toggleDropDown(nodeClicked) {
  var linkID = nodeClicked.id;

  if (nodeClicked.nodeName == "A") {
    var idTextEnd = linkID.indexOf("k");
    var dropDownLink = nodeClicked;
  }
  else if (nodeClicked.nodeName == "IMG") {
    var firstN = linkID.indexOf("n");
    idTextEnd = linkID.indexOf("n",firstN + 1);
    var dropDownLink = nodeClicked.parentNode;
  }

  var idCore = linkID.substring(idTextEnd + 1);
  var dropDownBlock = document.getElementById("DropDownBlock" + idCore);
  var dropDownIcon = document.getElementById("DropDownIcon" + idCore);

  // The display value is empty the first time but "block" after that.
  if (dropDownBlock.style.display == "" || dropDownBlock.style.display == "block") {
    dropDownBlock.style.display = "none";
    dropDownLink.setAttribute("title", "Click to view drop-down information.");
    dropDownIcon.src = linksPath + "images/drop_down_open_icon.gif";
  }
  else {
    dropDownBlock.style.display = "block";
    dropDownLink.setAttribute("title", "Click to close the drop-down information.");
    dropDownIcon.src = linksPath + "images/drop_down_close_icon.gif";
  }
}


// Highlights the subtopic if the page was opened by a link to a subtopic.
//
function showSubtopic(linkTarget) {
  // Resets "n" for use by blinkArrow() in case the user clicks the link again.
  n = 0;

  var isSubtopic = "";
  var currentPath = window.location.href;
  var startValue = currentPath.indexOf("#");
  if (startValue != -1) {
    var currentPath = currentPath.substring(0,startValue);
  }

  // Extract the file names without any path or hash values.
  var extractFile = /[A-za-z0-9_\-%]+\.htm/gi;
  var linkFile = linkTarget.match(extractFile);
  if (linkFile) {
    linkFile = linkFile.toString();

    // Needed by NS62.
    var ns62Char = /[\[\"\]]/gi;
    linkFile = linkFile.replace(ns62Char,"");
  }

  /* Subtopic display depends on URL of page compared to URL stored in a cookie.
     For links to targets on same page, IE uses complete path, but Netscape uses
     only the hash value. But when page is opened by clicking the Back button, 
     Netscape uses complete path, which contains the hash of the subtopic. This
     means the complete path URL won't match the URL in the cookie, so Netscape 
     will display the subtopic as not been linked before. To avoid this, convert
     links with only a hash value to the complete path. */

  // For NS. If link contains no file name, target is on same page as link, so
  // add path of current page to the hash value.
  if (!linkFile) {
    var linkTarget = currentPath + linkTarget;
  }

  // Determine if the link target is a subtopic.
  var topicHeading = testForSubTopic(linkTarget);

  // If link is to a subtopic, process it. Else display it as normal.
  if (topicHeading) {
    isSubtopic = "true";

    // If subtopic isn't in a popup, highlight it. Cookie is for IE and window 
    // name for NS.
    var popupBlock = docCookie("read","PopupBlock");
    if (popupBlock != "true" && window.name != "DocPopup") {
      highlightSubTopic(topicHeading);
    }
  }
  else {
    isSubtopic = "false";
  }
  return isSubtopic;
}


// Determines if link target is a subtopic (a heading other than H1 or H2).
//
function testForSubTopic(linkTarget) {
  // Store the position of the start of the hash value, if any.
  var hashLocation = linkTarget.indexOf("#"); 

  // If the page URL has a hash value, determine if it's a subtopic. 
  if (hashLocation != -1) {

    // Extract the hash value from the link path.
    var hashValue = linkTarget.substring(hashLocation + 1);
    hashValue = hashValue.toString();  // Ensures that it's a string data type.

    // Create an array containing all the nodes that have an anchor tag.
    var linksArray = document.getElementsByTagName("a");

    // Find the anchor node that's the target of the link.
    for(i = 0; i < linksArray.length; i++) {
      var anchorName = linksArray.item(i).getAttribute("name");

      // If node has name that matches hash value of link, it's link target.
      if (anchorName == hashValue) {
        var targetAnchor = linksArray.item(i);
        break;
      }
    }

    // If link target exists, and it's not an H1 or H2 heading, it's a subtopic.
    if (targetAnchor) {
      // Heading is parent node of the anchor.
      var topicHeading = targetAnchor.parentNode;
      if (topicHeading.tagName != "H2" && topicHeading.tagName != "H1") {
        return topicHeading;
      }
    }
  }
}


// Scrolls window to the subtopic heading. Scroll instead of link so don't 
// update history and affect Back button. Called by processClick() in 
// event_handler.js.
//
function scrollToSubtopic(linkTarget) {

  // Obtain the subtopic heading node.
  var targetHeading = testForSubTopic(linkTarget);
  var targetPosition = targetHeading.offsetTop;

  // Scroll to the subtopic. Subtract a little to leave some space above it.
  var topicBody = document.getElementsByTagName("body")[0];
  topicBody.scrollTop = targetPosition;

}


// Displays a flashing arrow next to the subtopic heading.
//
function highlightSubTopic(topicHeading) {

  // Create and insert arrow between <H?> tag and heading text.
  var headingText = topicHeading.childNodes[1];
  var subTopicIcon = document.createElement("img");
  subTopicIcon.id = "SubtopicPointer";
  subTopicIcon.setAttribute("src",linksPath + "images/subtopic_pointer.gif");
  subTopicIcon.style.marginRight = "7px";
  topicHeading.insertBefore(subTopicIcon,headingText);

  // Use timeout so arrow is displayed for half second before being flashed.
  setTimeout("blinkArrow()", 350);
}


// Flashes the subtopic arrow several times and then removes the arrow.
// (The HTML BLINK tag and blink() method don't work in IE.)
//
function blinkArrow() {
  var arrow = document.getElementById("SubtopicPointer");
  var headingNode = arrow.parentNode;

  if (arrow.style.visibility == 'hidden') {
    arrow.style.visibility = 'visible';
  }
  else {
    arrow.style.visibility = 'hidden';
  }

  // Repeat the function using a timeout. Else remove arrow from node tree.
  if (n < 4) {
    setTimeout("blinkArrow()", 350);
    n++
  }
  else {
    headingNode.removeChild(arrow);
  }
}


// Displays popup blocks using text in different HTML files as well as same 
// file that contains the links. Don't place popup text in a JavaScript file so
// customers can easily change it using HTML editor.
// Certain code in this and related functions relates to NS, but currently NS
// bypasses all this and uses its own functions because of Back button and 
// history issues.
//
function showPopupBlock() {

  if (top.DocSecondary) {
    targetWindow = top.DocSecondary;
    hiddenWindow = top.Hidden;
  }
  else if (top.Topic) {
    targetWindow = top.Topic;
    hiddenWindow = top.Hidden;
  }

  // Get popup link node that was clicked. The node ID is set by processClick()
  // in event_handler.js. Reset the ID to get ready for next popup.
  popupTarget = targetWindow.document.getElementById("PopupLink");
  if (popupTarget) {
    popupTarget.id = "";

    // Regular expression always works whereas indexOf() and substring() don't.
    var extractFile = /[A-za-z0-9_]+\.htm/gi;
    var currentFile = window.location.href.match(extractFile);
    var targetFile = popupTarget.href.match(extractFile);

    // Needed for NS62.
    currentFile = currentFile.toString();

    // Needed because "targetFile" is obtained from an event property.
    targetFile = targetFile.toString();

    // Is set as global, but needs to be reset here. Is used by readPopupData().
    samePage = "";

    // If target is on same page as link, update "samePage".
    if (targetFile == currentFile) {
      samePage = "true";
    }

    // Find popup block content in target file in "Hidden" frame.
    readPopupData(popupTarget,targetWindow,hiddenWindow);
  }
}


// Reads the target popup nodes into an array.
//
function readPopupData(popupTarget,targetWindow,hiddenWindow) {

  // Convert "popupTarget" to a string for regular-expression processing.
  popupTargetString = popupTarget.toString();
  var extractFile = /[A-za-z0-9_\-%]+\.htm/gi;
  var targetFile = popupTargetString.match(extractFile);

  var targetHash = popupTarget.hash.substring(1);
  var popupArrayNodes = new Array;
  var count = 0;
  var inPopup = "";

  // The first block in a popup file has no named anchor, so the target
  // is the first block if "popupTarget" has no hash value. In this case, set
  // "firstPopupBlock" so can process links to the first block.
  if (!targetHash) {
    var firstPopupBlock = "true";
  }

  // If target is on current page, read current page nodes.
  // Else read nodes of the file in the "Hidden" frame.
  // "samePage" is a global variable that's updated by showPopupBlock().
  if (samePage == "true") {
    var docBody = document.getElementsByTagName("body").item(0);
  }
  else {
    var docBody = hiddenWindow.document.getElementsByTagName("body").item(0);
  }

  if (docBody) {

    // Find nodes belonging to target popup topic and store them in array.
    var docNodes = docBody.childNodes;
    var anchorName = "";
    if (docNodes.length > 0) {
      for (i = 0; i < docNodes.length; i++) {
        var docNode = docNodes.item(i);

        // Node-type test needed to avoid text node in NS.
        if (docNode.nodeType == 1) {

          // Get the value of the node's named anchor, if any.
          if (docNode.firstChild) {
            anchorName =  docNode.firstChild.name;
          }

          // If "inPopup" is "true", test the node. Else if the node name equals the 
          // target hash or "firstPopupBlock" is "true", set "inPopup" to "true" and 
          // add the node to the popup array. Else keep checking the doc nodes.
          if (docNode.nodeType == 1 && inPopup == "true") {

            // If anchor's next sibling is a heading tag, stop the popup node search.
            // Else add the node to the array.
            if (docNode.tagName.substring(0,1) == "H") {
              var tagDetail = docNode.tagName.substring(1);
              // If the character after the "H" is a number, it's a heading tag.
              if (!isNaN(tagDetail)) {
                break;
              }
            }
            else {
              popupArrayNodes[count] = docNode;
              count++;
            }
          }
          else if (anchorName == targetHash || firstPopupBlock == "true") {
            popupArrayNodes[count] = docNode;
            inPopup = "true";
            count++;
            firstPopupBlock = "";
          }
        }
      }

      // Create and display the popup block.
      if (popupArrayNodes.length > 0) {
        createPopupBlock(popupArrayNodes,popupTarget,targetWindow,hiddenWindow);
      }

      // Remove "Hidden" frame body so browser history.back() doesn't return to 
      // "Hidden" frame when click Back button.
      var docBody = hiddenWindow.document.getElementsByTagName("body").item(0);
      if (docBody) {
        docBody.parentNode.removeChild(docBody);
      }
    }
  }
}


//  Creates popup blocks from the nodes in the array.
//
function createPopupBlock(popupArrayNodes,popupTarget,targetWindow,hiddenWindow) {

  // For NS. When click same link multiple times, removes existing popup block 
  // before creating a new one.
  var popupBlock = targetWindow.document.getElementById("PopupBlock");
  if (popupBlock) {
    popupBlock.parentNode.removeChild(popupBlock);
  }

  // Create a <DIV> block in "Topic" frame to contain the popup topic.
  var popupBlock = targetWindow.document.createElement("div");
  popupBlock.id = "PopupBlock";
  popupBlock.className = "PopupBlock";
  popupBlock.style.position = "absolute";

  // Insert the popup <DIV> block before the <p> that contains the anchor link
  // that displays the popup.
  popupTarget.parentNode.parentNode.insertBefore(popupBlock, popupTarget.parentNode);

  // Create node in current file for each node in popup array and move each new
  // node into the popup <DIV> block.
  for (i = 0; i < popupArrayNodes.length; i++) {
    var popupArrayNode = popupArrayNodes[i];

    // Create a node to match the node in the array.
    var popupNode = targetWindow.document.createElement(popupArrayNode.tagName);

    // Copy the HTML content from the array node to the new node.
    var nodeContent = popupArrayNode.innerHTML;
    if (nodeContent) {
      popupNode.innerHTML = nodeContent;
    }
    popupBlock.appendChild(popupNode);
  }

  // Position popup block relative to pointer position in window.
  positionPopupBlock(popupBlock,targetWindow,hiddenWindow);

  // Set up block to be removed when click the page or switch to another window.
  // NS doesn't recognize focus() as method of popupBlock so needs own code.
  // IE's "onblur" is better than topicBody.onclick. It's simplest way to close
  // popup when click outside topic, such as TOC, toolbar, or another window. 
  if (is_ie) {
    popupBlock.focus();
    popupBlock.onblur = hidePopupBlock;
  }
  else if (is_ns) {
    var topicBody = targetWindow.document.getElementsByTagName("body")[0];
    topicBody.onclick = hidePopupBlock;
    topicBody.onblur = hidePopupBlock;
  }

  // Set up block to be removed when click the block itself.
  popupBlock.onclick = hidePopupBlock;
}


//  Positions popup blocks on the page. Adjusts popup block position to prevent
// display beyond top or edges of window, but allows beyond window bottom.
//
function positionPopupBlock(popupBlock,targetWindow,hiddenWindow) {
  var xPos = "";
  var yPos = "";
  var xMouse = docCookie("read","XMouse");
  xMouse = Number(xMouse);
  var yMouse = docCookie("read","YMouse");
  yMouse = Number(yMouse);

  // Used only by NS6.
  var xPage = docCookie("read","XPage");
  xPage = Number(xPage);
  var yPage = docCookie("read","YPage");
  yPage = Number(yPage);

  if (is_ie) {
    var verticalScroll = targetWindow.document.body.scrollTop;
    var horizontalScroll = targetWindow.document.body.scrollLeft;
  }
  if (is_ns) {
    // Required for NS62. Handles NS7, too, even though IE code works for NS7.
    var horizontalScroll = xPage - xMouse;
    var verticalScroll = yPage - yMouse;
  }

  var bodyWidth = targetWindow.document.body.offsetWidth;
  var blockWidth = popupBlock.offsetWidth;
  var blockHeight = popupBlock.offsetHeight;

  // Adjust for xMouse difference when window is scrolled horizontally.
  // Else adjust position if block would be displayed off right edge of window.
  // Else leave position as is.
  if (horizontalScroll > 0) {
      xPos = xMouse - blockWidth + horizontalScroll;
  }
  else if (xMouse + blockWidth > bodyWidth) {
      xPos = xMouse - blockWidth;
  }
  else {
    xPos = xMouse;
  }

  // Adjust position if block would be displayed off left edge of window.
  if (xPos < 0) {
    xPos = 0 + horizontalScroll;
  }

  // Adjust position if block would be displayed off top of window.
  // Else adjust for yMouse difference when window is scrolled vertically.
  // Else position block slightly above pointer position.
  if (yMouse - 7 - blockHeight < 0) {
    yPos = yMouse + 7 + verticalScroll;
  }
  else if (verticalScroll > 0) {
    yPos = yMouse - 7 - blockHeight + verticalScroll;
  }
  else {
    yPos = yMouse - 7 - blockHeight;
  }

  // Apply position values to the block.
  with (popupBlock) {
    style.left = xPos;
    style.top = yPos;
  }
}


// Removes popup blocks from the node tree.
//
function hidePopupBlock() {

  if (top.DocSecondary) {
    targetWindow = top.DocSecondary;
    hiddenWindow = top.Hidden;
  }
  else if (top.Topic) {
    targetWindow = top.Topic;
    hiddenWindow = top.Hidden;
  }

  var popupBlock = targetWindow.document.getElementById("PopupBlock");

  if (popupBlock) {
    popupBlock.parentNode.removeChild(popupBlock);

    // "PopupBlock" is set in processClick().
    docCookie("delete","PopupBlock");
  }
}


// Hides all content in popup window except nodes for target block.
// Is called by initTopic().
//
function setupPopupWindow() {

  // Get <body> node of document in popup window. Get hash of window URL.
  var windowBody = self.document.getElementsByTagName("body")[0];
  windowBody.className = "Popup";
  var targetHash = window.location.hash.substring(1);

  // If "popup" parameter exists, delete it.
  if (targetHash.indexOf("&") != -1) {
    var parameterArray = targetHash.split("&");
    var targetHash = parameterArray[0];
  }

  // The first block in a popup file has no named anchor, so the target
  // is the first block if "popupTarget" has no hash value. In this case, set
  // "firstPopupBlock" so can process links to the first block.
  if (!targetHash) {
    var firstPopupBlock = "true";
  }

  // Store each child node of the body node in an array. Don't try to move the
  // nodes here because moving nodes interferes with scanning them. 
  var windowNodes = windowBody.childNodes;
  var nodeArray = new Array;
  var windowNode = "";
  var count = 0;
  for (i = 0; i < windowNodes.length; i++) {
    windowNode = windowNodes[i];
    nodeArray[count] = windowNode;
    count++;
  }

  // Move each node that's not part of target popup block into hidden DIV.
  var hiddenDIV = document.createElement("div");
  windowBody.appendChild(hiddenDIV);
  hiddenDIV.style.display = "none";

  var inPopup = "";
  var arrayItem = "";
  var anchorName = "";
  var firstH3 = "";
  for (j = 0; j < nodeArray.length; j++) {
    arrayItem = nodeArray[j];
    if (arrayItem.nodeType == 1) {
      if (arrayItem.firstChild.nodeName == "A") {
        anchorName = arrayItem.firstChild.name;
      }

      // If node is target node (its name equals target hash or 
      // "firstPopupBlock" is "true"), start popup block. Else if node is next
      // popup block (is H3 or H4 (ItemName) but isn't the first one), end
      // popup block. Else the node is H3 or H4 and is the target block, so
      // reset "firstH3" so can end the block with next H3 or H4.
      if (anchorName == targetHash || firstPopupBlock == "true") {
        inPopup = "true";
        firstH3 = "true";
        firstPopupBlock = "";
        anchorName = "";
      }
      else if ((arrayItem.nodeName == "H3" || arrayItem.nodeName == "H4") && firstH3 != "true") {
        inPopup = "";
      }
      else {
        firstH3 = "";
      }

      if (inPopup != "true") {
        hiddenDIV.appendChild(arrayItem);
      }
    }
  }
}

