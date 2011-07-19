//******************************************************************************

// Declare global variables.
//
// Used by updateTOCForNS().
var tocTarget = "";


// Call initTOC() after page loads so all nodes exist for processing.
if (window.name == "Navigation") {
  onload = setupTOC;
}


// Formats UL lists with class "TOC" as expanding/collapsing table of contents.
//
function setupTOC() {
  var ulArray = document.getElementsByTagName("ul");
  var tocID = 1;
  var isBlockLink = "";

  if (ulArray) {

    // Determine if any of the UL nodes has a class of "TOC".
    for(i = 0; i < ulArray.length; i++) {
      var ulNode = ulArray.item(i);

      // For each UL with class "TOC", format it as a table of contents.
      if (ulNode.className == "TOC") {

        // Assign "class" and "target" attributes to each anchor.
        var tocAnchors = ulNode.getElementsByTagName("a");
        for(j = 0; j < tocAnchors.length; j++) {
          var tocAnchor = tocAnchors.item(j);
          tocAnchor.className = "TocLink";
          tocAnchor.setAttribute("target","Topic");

          // Get the "href" value of the anchor.
          var linkHref = tocAnchor.getAttribute("href");

          // Remove any hash value that may be appended.
          var hashValue = /#wp[0-9]+/g;
          if (linkHref.indexOf("#wp") != -1) {
            linkHref = linkHref.replace(hashValue,"");
            tocAnchor.href = linkHref;
          }

          // Add a "name" attribute to each link that's based on the file name in
          // the "href" attribute. Allows syncTOC() to scroll to the TOC item. 
          if (is_ie) {

            // Extract file name from entire path that IE uses at run time.
            var extractFile = /[A-za-z0-9_\-%]+\.htm/gi;
            linkHref = linkHref.match(extractFile);

            if (linkHref) {
              // Convert results of reg expr to string to process as string.
              linkHref = linkHref.toString();

              // Remove file name extension.
              var fileExtension = /\.htm/;
              linkHref = linkHref.replace(fileExtension,"");

              // Convert space characters to underlines.
              var spaceChar = /%20/g;
              linkHref = linkHref.replace(spaceChar,"_");

              // Assign the new "name" attribute to the anchor tag. IE doesn't
              // support the object.name property, so must "manually" insert it.
              var addName = /href/;
              var linkHTML = tocAnchor.outerHTML;
              var linkHTML = linkHTML.replace(addName,"name=\"" + linkHref + "\" href");
              tocAnchor.outerHTML = linkHTML;
            }
          }
          else if (is_ns) {
            if (linkHref) {
              linkHref = linkHref.toString();
              var fileExtension = /\.htm/;
              linkHref = linkHref.replace(fileExtension,"");
              var spaceChar = /%20/g;
              linkHref = linkHref.replace(spaceChar,"_");

              // Remove extraneous characters added by NS62.
              var ns62Char = /\[\]/g;
              linkHref = linkHref.replace(ns62Char,"");
              var nsQuotes = /"/g;
              linkHref = linkHref.replace(nsQuotes,"");

              // Assign the new "name" attribute to the anchor tag.
              tocAnchor.name = linkHref;
            }
          }
        }

        // Format each nested UL block and its associated link.
        var tocLinks = ulNode.getElementsByTagName("LI");
        for(j = 0; j < tocLinks.length; j++) {
          var tocLink = tocLinks.item(j);

          // Delete any spaces or tabs at end of link text. Else changes number
          // of child nodes to look for to find UL node.
          var extraSpace = /\ +\t+</;
          tocLink.innerHTML = tocLink.innerHTML.replace(extraSpace,"<");

          // Remove space from beginning of link text.
          if (is_ns) {
            var extraSpace = />\ /;
            tocLink.innerHTML = tocLink.innerHTML.replace(extraSpace,">");
          }

          // If link has UL below it, get UL and "mark" link with "isBlockLink".
          if (is_ie) {
            if (tocLink.childNodes[2] && tocLink.childNodes[2].tagName == "UL") {
              isBlockLink = "true";
              var tocBlock = tocLink.childNodes[2];
            }
          }
          else if (is_ns) {
            if (tocLink.nextSibling) {
              if (tocLink.nextSibling.nextSibling && tocLink.nextSibling.nextSibling.tagName == "UL") {
                isBlockLink = "true";
                var tocBlock = tocLink.nextSibling.nextSibling;
              }
            }
          }

          // Create an IMG node to use later to insert the link icons.
          var blockLinkIcon = document.createElement("img");
          blockLinkIcon.id = "TocIcon" + tocID;
          blockLinkIcon.className = "TocIcon";

          // Obtain the anchor node within the LI node.
          var blockLinkAnchor = tocLink.firstChild;

          // If LI has UL block, format the LI link and the UL block below it.
          // Else only insert the "page" icon.
          if (isBlockLink == "true") {
            tocBlock.id = "TocBlock" + tocID;
            tocBlock.style.display = "none";

            // Inserts "book" icon and assigns event handler for clicks on it.
            blockLinkIcon.setAttribute("src",linksPath + "images/toc_open_icon.gif");
            tocLink.insertBefore(blockLinkIcon,blockLinkAnchor);
            blockLinkIcon.onclick = processClick;

            // Completes anchor tag and assigns event handler for clicks on it.
            blockLinkAnchor.id = "TocLink" + tocID;
            blockLinkAnchor.onclick = processClick;
          }
          else {
            blockLinkAnchor.id = "TocLink" + tocID;
            blockLinkIcon.setAttribute("src",linksPath + "images/toc_doc_icon.gif");
            tocLink.insertBefore(blockLinkIcon,blockLinkAnchor);
            blockLinkAnchor.onclick = processClick;
          }

          // Update values for next block.
          tocID++
          isBlockLink = "";
        }
      }
    }
  }
}


// Toggles contents "book" blocks between open and closed.
//
function toggleTOC(nodeClicked) {

  // Get the item that the user clicked.
  if (window.name == "Navigation") {
    var tocItem = top.Navigation.document.getElementById(nodeClicked.id)
  }
  else if (window.name != "Navigation" && window.name != "Toolbar") {
    var tocItem = document.getElementById(nodeClicked.id)
  }

  // Get the anchor of the clicked item, if it's an icon. Else just make the
  // anchor the item the user clicked.
  if (tocItem.nodeName == "A") {
    var tocAnchor = tocItem;
  }
  else if (tocItem.nodeName == "IMG") {
    var tocAnchor = tocItem.nextSibling;
  }

  // Get the UL block that's associated with the clicked item.
  if (is_ie) {
    var clickedBlock = tocAnchor.parentNode.childNodes[3];
  }
  else if (is_ns) {
    var clickedBlock = tocAnchor.parentNode.nextSibling.nextSibling;
  }

  // Get the parent UL block of the first UL block.
  if (is_ie) var clickedBlockParent = clickedBlock.parentNode.parentNode;
  if (is_ns) var clickedBlockParent = clickedBlock.parentNode;

  // Get the icon associated with the first UL block.
  if (is_ie) clickedIcon = clickedBlock.parentNode.firstChild;
  if (is_ns) clickedIcon = clickedBlock.previousSibling.previousSibling.firstChild;

  // If another branch of the TOC tree was open before the item was clicked,
  // close it, including all the open blocks it contains. Don't close it
  // if it contains the clicked item.
  closeTOCBranch(clickedBlock.id);

  // Toggle the clicked block open or closed and change its icon.
  if (clickedBlock.style.display == "block") {
    clickedBlock.style.display = "none";
    clickedIcon.setAttribute("src",linksPath + "images/toc_open_icon.gif");
  }
  else if (clickedBlock.style.display == "none") {
    clickedBlock.style.display = "block";
    clickedIcon.setAttribute("src",linksPath + "images/toc_close_icon.gif");
  }
}


// Closes a previously opened TOC branch when open a new branch. Works at any
// level in the branch hierarchy.
//
function closeTOCBranch(clickedBlockID) {
  var count = 0;
  var ulNodes = document.getElementsByTagName("ul");
  for (i = 0; i < ulNodes.length; i++) {
    var ulNode = ulNodes.item(i);

    // Find the UL element that contains the TOC.
    if (ulNode.className == "TOC") {
      var tocBlocks = ulNode.getElementsByTagName("ul");

      // Test each TOC block to see if its ID matches the clicked block.
      for (j = 0; j < tocBlocks.length; j++) {
        var tocBlock = tocBlocks.item(j);

        // If block is open and is not the block that was clicked, see if
        // it's an ancestor of the clicked block.
        // Else if block is open and is the block clicked, set "isAncestor".
        if (tocBlock.style.display == "block" && tocBlock.id != clickedBlockID) {
          var isAncestor = "";
          var k = 0;
          var tocBlockChildBlocks = tocBlock.getElementsByTagName("ul");
          var tocBlockChild = tocBlockChildBlocks.item(k);

          // Test each child block to see if its ID matches the clicked block.
          while (tocBlockChild) {

            // If blocks match, set "isAncestor" to identify TOC block as parent.
            if (tocBlockChild.id == clickedBlockID) {
              var isAncestor = "true";
            }
            else {
            }
            k++;
            var tocBlockChild = tocBlockChildBlocks.item(k);
          }
        }
        else if (tocBlock.style.display == "block" && tocBlock.id == clickedBlockID) {
          var isAncestor = "true";
        }

        // If TOC block isn't an ancestor of clicked block, close TOC block.
        if (isAncestor != "true") {
          if (tocBlock.style.display == "block") {

            // Close the block and change its icon.
            tocBlock.style.display = "none";
            if (is_ie) tocIcon = tocBlock.parentNode.firstChild;
            if (is_ns) tocIcon = tocBlock.previousSibling.previousSibling.firstChild;
            tocIcon.setAttribute("src",linksPath + "images/toc_open_icon.gif");
          }
        }
      }
    }
  }
}


// Highlights links in TOC that users click, in contrast to links highlighted
// by syncTOC(). Clicked links have priority over links highlighted by sync.
//
function showTOCLink(nodeClicked) {
  var clickedLink = nodeClicked;
  var prevLinkID = docCookie("read","TOCLinkID");

  // Updates "TOCLinkID" so next click uses current link as previous link.
  // Also used by resetTOCSync().
  docCookie("write","TOCLinkID",clickedLink.id);

  // If a previously clicked link exists, remove its highlighting.
  // Test for prevLinkID because it doesn't exist the first click.
  if (prevLinkID) {

    // Get the link identified by the ID.
    prevLink = document.getElementById(prevLinkID);

    // Remove the link highlighting.
    if (prevLink) {
      prevLink.style.backgroundColor = bcolor_TOC_NotSelected;
      prevLink.style.color = fcolor_TOC_NotSelected;
    }
  }

  // Add highlighting to the current link.
  clickedLink.style.backgroundColor = bcolor_TOC_Selected;
  clickedLink.style.color = fcolor_TOC_Selected;

  // If a link previously highlighted by syncTOC() exists, remove its
  // highlighting. To do this: Get the link, if any, currently highlighted by 
  // syncTOC(). If the "sync" link exists, and it's not the current clicked 
  // link, remove its highlighting.
  var syncTOCAnchor = docCookie("read","SyncTOCAnchor");
  var syncLink = top.Navigation.document.getElementById(syncTOCAnchor);
  if (syncLink && syncLink != clickedLink) {
    syncLink.style.backgroundColor = bcolor_SyncTOC_NotSelected;
    syncLink.style.color = fcolor_SyncTOC_NotSelected;
  }
}

