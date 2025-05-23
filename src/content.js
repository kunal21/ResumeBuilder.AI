/* global chrome */
function extractPageText () {
  // Naïve approach: everything visible on the page.
  return document.body.innerText;
}

// Respond to popup’s request
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'GET_PAGE_TEXT') {
    console.log("in content.js", req);
    sendResponse({ text: extractPageText() });
  }
});