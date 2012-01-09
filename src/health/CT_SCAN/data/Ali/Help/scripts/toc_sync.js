//******************************************************************************

// Declare global variables.
//
// Used by syncTOC() and resetTOCSync().
var syncBlockIDs = new Array;

// Used by syncTOC().
var syncBlockHeight = 0;


// Shows where topics displayed in the "Topic" frame are located in the TOC.
//
function syncTOC(linkTarget) {

  // Close any blocks previously opened by syncTOC().
  resetTOCSync();

  // Create "topicFile" containing only the file name of the target file (the
  // file that was the target of the link clicked in the "Topic" frame). Used
  // to match the file names in the anchors.
  var extractFile = /[A-za-z0-9_\-%]+\.htm/gi;
  var topicFile = linkTarget.match(extractFile);

  // Convert results of reg expressions to strings to process as strings.
  topicFile = topicFile.toString();

  // Needed for NS62 ("spaceChar" for NS7, too).
  var fileExtension = /\.htm/;
  topicFile = topicFile.replace(fileExtension,"");
  var spaceChar = /%20/g;
  topicFile = topicFile.replace(spaceChar,"_");
  var ns62Char = /[\[\"\]]/gi;
  topicFile = topicFile.replace(ns62Char,"");

  var syncNum = 1;

  // Get all anchors in the "Navigation" frame.
  var tocAnchors = top.Navigation.document.getElementsByTagName("a");

  // Test each anchor to find the one matching the target file.
  for (i = 0; i < tocAnchors.length; i++) {
    var tocAnchor = tocAnchors.item(i);

    // If the anchor name matches the target file, highlight it and find
    // all its upper-level (parent) UL blocks so they can be opened.
    if (tocAnchor.name == topicFile) {

      // Highlight target item and save its ID in a cookie for resetTOCSync().
      // If item was previously clicked manually, don't change its highlight.
      if (tocAnchor.style.backgroundColor != bcolor_TOC_Selected.toLowerCase()) {
        tocAnchor.style.backgroundColor = bcolor_SyncTOC_Selected;
        tocAnchor.style.color = fcolor_SyncTOC_Selected;
        docCookie("write","SyncTOCAnchor",tocAnchor.id);
      }

      // Find each parent UL block of the target item.
      var syncBlock = tocAnchor.parentNode.parentNode;
      while (syncBlock.nodeName == "UL") {

        // Store sync block ID in cookie because NS can't scroll to target link 
        // in "Navigation" after "while" loop processing, not even if set a 
        // delay. Else could set "syncBlock" to open at this point.
        if (syncBlock.className != "TOC") {
          docCookie("write","SyncTOCBlock" + syncNum,syncBlock.id);

          // Increment cookie counter to prepare for next sync block.
          syncNum++;
        }

        // Update "syncBlock" for the next loop.
        if (is_ie) syncBlock = syncBlock.parentNode.parentNode;
        if (is_ns) syncBlock = syncBlock.parentNode;
      }
      break;
    }
  }

  // Open each block specified by an ID in a cookie and change the block's icon.
  var count = 1;
  var syncBlockID = docCookie("read","SyncTOCBlock" + count);
  while (syncBlockID) {
    var syncBlock = top.Navigation.document.getElementById(syncBlockID);
    if (is_ie) syncIcon = syncBlock.parentNode.firstChild;
    if (is_ns) syncIcon = syncBlock.previousSibling.previousSibling.firstChild;

    syncBlock.style.display = "block";
    syncIcon.setAttribute("src",linksPath + "images/toc_close_icon.gif");

    count++;
    syncBlockID = docCookie("read","SyncTOCBlock" + count);
  }

  // Scroll the TOC to the target node. NS62 requires normal link and scroll.
  if (is_ie || is_ns7up) {
    syncTOCScroll(topicFile);
  }
  else if (is_ns6) {
    docCookie("write","TopicFileNS6",topicFile);

    // NS6 needs time to finish opening branches before scrolling.
    setTimeout("scrollNS6();",150);
  }
}


// Scrolls NS6 to the topic node during AutoSync.
// Called by syncTOC().
//
function scrollNS6() {
  var topicFile = docCookie("read","TopicFileNS6");
  top.Navigation.location.replace("table_of_contents.htm#" + topicFile);
}


// Scroll the TOC to the target anchor node. Doesn't work in NS62.
// Scroll instead of link so don't update history and affect Back button.
// Since would use a named anchor in the link, location.replace() wouldn't 
// work any differently than location=. Called by syncTOC().
//
function syncTOCScroll(syncTarget) {

  // Determine total height of all nodes above target node.
  var tocBody = top.Navigation.document.getElementsByTagName("body")[0];
  if (tocBody) {
    var bodyNodes = tocBody.childNodes;
    var tocSyncHeight = 0;

    // Test each node. Add node height until find node that's subtopic heading.
    var nodeHeight = 0;
    var ulTopMargin = 0;
    var bodyNode = "";

    // Don't use "i" as counter because conflicts with "i" in cookie used by
    // calcNodeHeight().
    for (k = 0; k < bodyNodes.length; k++) {
      bodyNode = bodyNodes[k];

      // Calculate the height of each node until reach the "TOC" node.
      // Then get all the nodes in the "TOC" UL list.
      // Test for node type for NS.
      if (bodyNode.nodeType == 1) {
        if (bodyNode.className != "TOC") {
          nodeHeight = calcNodeHeight(bodyNode);

          // Keep running total for all node heights up to this point.
          tocSyncHeight = tocSyncHeight + nodeHeight;
        }
        else {
          var tocNodes = bodyNode.getElementsByTagName("a");

          // Add for the space above the TOC UL node.
          var removeEM = /em/;
          var removePX = /px/;
          if (is_ie) {
            nodeMargins = bodyNode.currentStyle.margin;
            nodeMarginsArray = nodeMargins.split(" ");
            nodeFontSize = bodyNode.currentStyle.fontSize;
            nodeFontSize = nodeFontSize.replace(removePX,"");

            if (nodeMarginsArray[0] && nodeMarginsArray[0] != "auto") {
              nodeTopMargin = nodeMarginsArray[0].replace(removeEM,"");
              topAdjustment = nodeFontSize * Number(nodeTopMargin);
            }
          }
          else if (is_ns) {
            // NS automatically returns the calculated margin values based on 
            // font size. The "getPropertyValue" is needed for NS6 but not NS7.
            nodeTopMargin = window.getComputedStyle(bodyNode,null).getPropertyValue("margin-top");
            nodeTopMargin = nodeTopMargin.replace(removePX,"");
            nodeTopMargin = Number(nodeTopMargin);
            topAdjustment = nodeTopMargin;
          }

          tocSyncHeight = tocSyncHeight + topAdjustment;

          break;
        }
      }
    }

    // Process each node in the "TOC" UL list until reach the target node.
    var firstAnchor = "";
    var tocNode = "";
    var prevBlockID = "";
    var currentBlockID = "";
    var ulBlock = "";
    var closedBlockLink = "";

    // Don't use "i" as counter because conflicts with "i" in cookie used by
    // calcNodeHeight().
    for (k = 0; k < tocNodes.length; k++) {
      tocNode = tocNodes.item(k);
      ulBlock = tocNode.parentNode.parentNode;

      // Add link node height only if node is in an open TOC branch.
      if (ulBlock.style.display != "none") {

        // If node isn't the target node, add its height.
        if (tocNode.name != syncTarget) {
          nodeHeight = calcNodeHeight(tocNode);
          tocSyncHeight = tocSyncHeight + nodeHeight;
        }
        else {
          break;
        }
      }
    }

    // Scroll to the subtopic. Subtract some to show more above target node.
//    tocBody.scrollTop = tocSyncHeight - 50;
    top.Navigation.scrollTo(0,tocSyncHeight - 50);
  }
}


// Calculate the height of a node, including collapsing margins.
// Called by syncTOCScroll().
//
function calcNodeHeight(currentNode) {

  // Regular expression definitions.
  var removeEM = /em/;
  var removePX = /px/;

  // Initialize variables.
  var nodeMargins = "";
  var nodeMarginsArray = "";
  var nodeTopMargin = "";
  var nodeBottomMargin = "";
  var bottomAdjustment = 0;
  var nodeFontSize = 0;
  var calcHeight = 0;

  var bottomAdjustmentPrevious = docCookie("read","PrevBottomMargin");
  if (bottomAdjustmentPrevious >= 0) {
  }
  else {
    var bottomAdjustmentPrevious = 0;
  }

  // Compensate for element.offsetHeight not including CSS margin values.
  // Calculate amount to compensate based on font size and collapsing of
  // top and bottom margins (only the larger of the two is used).
  if (is_ie) {
    nodeMargins = currentNode.currentStyle.margin;
    nodeMarginsArray = nodeMargins.split(" ");
    nodeFontSize = currentNode.currentStyle.fontSize;
    nodeFontSize = nodeFontSize.replace(removePX,"");
    if (nodeMarginsArray[0] && nodeMarginsArray[0] != "auto") {
      nodeTopMargin = nodeMarginsArray[0].replace(removeEM,"");
      topAdjustment = nodeFontSize * Number(nodeTopMargin);
    }

    if (nodeMarginsArray[2] && nodeMarginsArray[2] != "auto") {
      nodeBottomMargin = nodeMarginsArray[2].replace(removeEM,"");
      bottomAdjustment = nodeFontSize * Number(nodeBottomMargin);
    }
  }
  else if (is_ns) {
    // Base calculations on the LI node instead of the A node.
    if (currentNode.nodeName == "A") {
      currentNode = currentNode.parentNode;
    }

    // NS7 automatically returns the calculated margin values based on 
    // font size. The "getPropertyValue" is needed for NS6 but not NS7. 
    nodeTopMargin = window.getComputedStyle(currentNode,null).getPropertyValue("margin-top");
    nodeTopMargin = nodeTopMargin.replace(removePX,"");
    nodeTopMargin = Number(nodeTopMargin);

    nodeBottomMargin = window.getComputedStyle(currentNode,null).getPropertyValue("margin-bottom");
    nodeBottomMargin = nodeBottomMargin.replace(removePX,"");
    nodeBottomMargin = Number(nodeBottomMargin);

    topAdjustment = nodeTopMargin;
    bottomAdjustment = nodeBottomMargin;
  }

  // Determine whether to use previous bottom value or current top value.
  if (bottomAdjustmentPrevious <= topAdjustment) {
    calcHeight = currentNode.offsetHeight - bottomAdjustmentPrevious + topAdjustment;
  }
  else {
    calcHeight = currentNode.offsetHeight;
  }

  // Always add current bottom value.
  calcHeight = calcHeight + bottomAdjustment;

  // Reset "PrevBottomMargin".
  docCookie("write","PrevBottomMargin",bottomAdjustment);

//alert("currentNode:" + currentNode.nodeName + "\nText:" + currentNode.innerHTML + "\nNode height:" + currentNode.offsetHeight + "\ncalcHeight:" + calcHeight + "\ntopAdjustment:" + topAdjustment + "\nbottomAdjustment:" + bottomAdjustment + "\nbottomAdjustmentPrevious:" + bottomAdjustmentPrevious);

  return calcHeight;
}


// Close blocks previously opened by syncTOC() to prepare for new sync item.
// If TOC branch containing previous sync item also contains an item clicked
// by the user, don't close that branch.
//
function resetTOCSync() {

  // Get anchor previously highlighted by syncTOC() in "Navigation" frame.
  var syncTOCAnchor = docCookie("read","SyncTOCAnchor");
  var targetAnchor = top.Navigation.document.getElementById(syncTOCAnchor);

  // Remove the anchor's highlighting.
  if (targetAnchor) {
    targetAnchor.style.backgroundColor = bcolor_SyncTOC_NotSelected;
    targetAnchor.style.color = fcolor_SyncTOC_NotSelected;
  }

  var sameParent = "";
  var syncNum = 1;
  var syncBlockID = docCookie("read","SyncTOCBlock" + syncNum);

  // Close each block identified in a "SyncTOCBlock" cookie unless the branch 
  // containing the block has a link clicked by the user.
  while (syncBlockID) {

    // Remove the cookie to prepare for another sync action.
    docCookie("delete","SyncTOCBlock" + syncNum);

    // Get the sync block identified by the ID.
    var syncBlock = top.Navigation.document.getElementById(syncBlockID);

    // Determine if sync block has same parent as a clicked block, if any.
    var clickedLinkID = docCookie("read","TOCLinkID");
    if (clickedLinkID) {

      // Get the clicked link and obtain its parent UL block.
      var clickedLink = top.Navigation.document.getElementById(clickedLinkID);
      var clickedBlock = clickedLink.parentNode.parentNode;

      // Assign blocks to different variables so can process without changing 
      // original variables.
      var clickedBlockParent = clickedBlock;
      var syncBlockParent = syncBlock;

      // For each sync block parent, do the following.
      while (syncBlockParent && syncBlockParent.className != "TOC") {

        // Test each clicked-block parent to see if it matches the sync parent.
        while (clickedBlockParent && clickedBlockParent.className != "TOC") {

          // If the two blocks match, set "sameParent".
          if (syncBlockParent.id == clickedBlockParent.id) {
            sameParent = "true";
            break;
          }

          // Update values for next clicked-block parent to test.
          if (is_ie) clickedBlockParent = clickedBlockParent.parentNode.parentNode;
          if (is_ns) clickedBlockParent = clickedBlockParent.parentNode;
        }
        if (sameParent == "true") break;

        // Update values for next sync-block parent to test.
        if (is_ie) syncBlockParent = syncBlockParent.parentNode.parentNode;
        if (is_ns) syncBlockParent = syncBlockParent.parentNode;
      }
    }

    // If sync block not in same branch as clicked block, close the sync blocks.
    if (sameParent != "true") {

      // Get the icon associated with the sync block.
      if (is_ie) syncIcon = syncBlock.parentNode.firstChild;
      if (is_ns) syncIcon = syncBlock.previousSibling.previousSibling.firstChild;

      syncBlock.style.display = "none";
      syncIcon.setAttribute("src",linksPath + "images/toc_open_icon.gif");
    }

    // Update values for another open sync block.
    syncNum++;
    syncBlockID = docCookie("read","SyncTOCBlock" + syncNum);
  }
}

