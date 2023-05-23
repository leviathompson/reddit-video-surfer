// This event is fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(function() {
    // Use the chrome.storage API to save and retrieve data for the extension
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });
  
    // Use the chrome.commands API to handle keyboard shortcuts
    chrome.commands.onCommand.addListener(function(command) {
      console.log('Command:', command);
      // Here you would put the code to handle the command, e.g. navigate to the next/previous image/video
    });
  });
  