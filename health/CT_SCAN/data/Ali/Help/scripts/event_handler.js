//******************************************************************************

// Assign the event handler to all the links.
//
function setupLinks() {

  // Assign processClick() to the click event of every link (anchor node).
  var linksArray = document.getElementsByTagName("a");

  // For each anchor that's a link, attach the event handler.
  for(i = 0; i < linksArray.length; i++) {
    var isLink = linksArray.item(i).getAttribute("href");
    if (isLink) {
      linksArray.item(i).onclick = processClick;
    }
  }

  // For each anchor that's a link in an image map, attach the event handler.
  var imageMaps = document.getElementsByTagName("area");
  for(i = 0; i < imageMaps.length; i++) {
    var isLink = imageMaps.item(i).getAttribute("href");
    if (isLink) {
      imageMaps.item(i).onclick = processClick;
    }
  }
}


// Event handler for click events when links and other nodes are clicked.
//
function processClick(e) {

  // For IE. Event object not picked up in function argument (e), so assign it.
  if (!e) {
    var e = window.event;
  }

  // Prevent event bubbling.
  e.cancelBubble = true;   // For IE.
  if (e.stopPropagation) e.stopPropagation();   // For Netscape.

  // For popup block positioning. Is mouse position relative to window.
  var xMouse = e.clientX;
  var yMouse = e.clientY;

  // For NS62 in popup block positioning. Is mouse position relative to page.
  var xPage = e.pageX;
  var yPage = e.pageY;

  // Save for use when "Hidden" frame topic is displayed for popups.
  docCookie("write","XPage",xPage);
  docCookie("write","YPage",yPage);
  docCookie("write","XMouse",xMouse);
  docCookie("write","YMouse",yMouse);

  // Assign the node that was clicked to variable "nodeClicked".
  if (e.srcElement) {   // For IE.
    var nodeClicked = e.srcElement;
  }
  else if (e.target) {   // For Netscape.
    var nodeClicked = e.target;

    // If clicked a text node, convert it to the containing element node.
    if (nodeClicked.nodeType == 3) {
      nodeClicked = nodeClicked.parentNode;
    }
  }

  // If the node is the <i> tag, change to its parent node. It can be <i> when 
  // clicked in the italics part of a "see also" index entry.
  if (nodeClicked.nodeName == "I") {
    nodeClicked = nodeClicked.parentNode;
  }

  // If the node has an "href" attribute, save the URL.
  if (nodeClicked.getAttribute("href")) {
    var linkTarget = nodeClicked.getAttribute("href");
  }

//alert("Clicked:" + nodeClicked.tagName + "\nType:" + nodeClicked.nodeType + "\nID:" + nodeClicked.id + "\nText:" + nodeClicked.innerHTML + "\nClass name:" + nodeClicked.className);

  // Assign further processing based on node class name, if it exists.
  switch (nodeClicked.className) {

    case "Window":
      showSecondaryWindow(linkTarget);
      return false;
      break;

    case "Popup":

      // Display as popup block only if in "Topic" frame. Display as normal
      // link if in secondary window, as when user clicks Popout button.
      // For NS: Lines that display popups in popup windows instead of blocks
      // are commented out because blocks now work without Back button problem.
      if (window.name == "Topic" || window.name == "DocSecondary") {

        // Used by initTopic() to prevent AutoSync when click popup links.
        // It's removed in hidePopupBlock().
        docCookie("write","PopupBlock","true");

        // Assign ID to node so can find it later in showPopupBlock() in
        // topics.js.
        nodeClicked.id = "PopupLink";

        // Extract the file name from the link. 
        var popupFilePath = nodeClicked.href;
        var extractFile = /[A-za-z0-9_]+\.htm/gi;
        var popupFileOnly = popupFilePath.match(extractFile);

        // For NS6 if ever use popup blocks with it instead of windows.
        var ns62Char = /[\[\"\]]/gi;
        popupFileOnly = popupFileOnly.toString();
        popupFileOnly = popupFileOnly.replace(ns62Char,"");

        // "DocSecondary" cookie is used by topics.js.
        if (window.name == "DocSecondary") {
          docCookie("write","DocSecondary","true");
        }

        // Load the target popup file in the "Hidden" frame.
        top.Hidden.location.replace(popupFileOnly);

        return false;
      }

      break;

    case "DropDownLink":
      toggleDropDown(nodeClicked);
      return false;
      break;

    case "DropDownIcon":
      toggleDropDown(nodeClicked);
      return false;
      break;

    case "TocLink":

      // If link is in TOC, highlight link and open topic in "Topic" frame.
      // Else if link is in section TOC, only open topic as a normal link.
      if (window.name == "Navigation") {

        // Highlight the clicked item in the TOC.
        showTOCLink(nodeClicked);

        // To allow TOC link clicks to open sub-blocks, un-comment the next line.
//        toggleTOC(nodeClicked);

        // Used by initTopic() in topics.js to prevent running syncTOC() when click 
        // TOC item.
        docCookie("write","ClickedTOC","true");

        // Display the target page in the "Topic" frame.
        top.Topic.location.href = linkTarget;

        return false;
      }
      else if (window.name == "DocSecondary") {
        // "SecondaryFirstTopic" is set in topics.js and used in toolbar.js.
        docCookie("write","SecondaryFirstTopic","");

        top.opener.top.Topic.location = linkTarget;
        top.close();

        return false;
      }

      break;

    case "TocIcon":
      toggleTOC(nodeClicked);

      // No "return false" is needed because no link is involved.
      break;

    // Handles all normal links.
    default:

      // Set cookie to prevent subtopic highlight when click an index entry.
      if (nodeClicked.parentNode.className) {
        var parentClass = nodeClicked.parentNode.className;
        if (parentClass.indexOf("IX") != -1) {
          docCookie("write","IndexEntry","true");
        }
        else {
          docCookie("delete","IndexEntry");
        }
      }
      else {
        docCookie("delete","IndexEntry");
      }

      // Highlight subtopic if link is to subtopic on same page.
      // Links to subtopics on other pages are handled by initTopic().
      // Show highlight only if not a popup.
      var isSubtopic = showSubtopic(linkTarget);
      if (isSubtopic == "true") {

        // Scroll to the subtopic heading. Placed here instead of showSubtopic()
        // because subtopic links to other pages don't need it. For NS62, skip
        // scrolling and handle as a normal link.
        if (is_ie || is_ns7up) {
          scrollToSubtopic(linkTarget);

          // Disable normal link action for a subtopic to avoid history update
          // so Back button ignores link. Scrolling to subtopic is handled by 
          // scrollToSubtopic().
          return false;
        }
      }

      if (window.name == "DocSecondary") {
        if (isSubtopic != "true") {

          // "SecondaryFirstTopic" is set in topics.js and used in toolbar.js.
          docCookie("write","SecondaryFirstTopic","");

          top.opener.top.Topic.location = linkTarget;
          top.close();

          return false;
        }
      }

      // No "return false" for normal links so can complete normal processing.
  }
}

