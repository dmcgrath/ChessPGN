
var thisParamString = window.location.search;

// Drive API information needed to identify this app.
var CLIENT_ID = '1023257958231-8nav97ck2tohrhvfguecrvo03qe3t2ie.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.install', 'https://www.googleapis.com/auth/userinfo.profile'];
var PROJECT_NUMBER = 1023257958231;

// Accept the JSON state variable that is passed along by Google Drive when opening a PGN file
function start_drive() {
  var pgnDrive = null;
  thisRegExp = /(&|\?)(state)=([^&]*)(&|$)/i;
  if (thisParamString.match(thisRegExp) !== null) {
    var stateJSON = unescape(thisParamString.match(thisRegExp)[3]);
    pgnDrive = JSON.parse(stateJSON).ids[0];
  }
  getAuth(pgnDrive);
}

// Check if we have authorization to the user's Drive account to retrieve the PGN file
// If not, call ask the user for authorization to do so.
// Generally, we only need to ask the user the very first time they access the app.
function getAuth(fileID) {
  var driveData = {pgnDrive: fileID};
  var handleRes = handleAuthResult.bind(driveData)
  gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true}, handleRes);
  
    // Enable sharing
   var init = function() {
     var s = new gapi.drive.share.ShareClient(PROJECT_NUMBER);
     s.setItemIds([this.pgnDrive]);
   }
   init = init.bind(driveData);
   gapi.load('drive-share', init);
}

// Called by getAuth to handle the result of checking for authorization,
// asking the user if we don't already have it.
function handleAuthResult(authResult) {
  if (!authResult || authResult.error) {
    var handleRes = handleAuthResult.bind(this)
    gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false}, handleRes);
  } else {
    var loadPgn = getPgn.bind(this);
    gapi.client.load('drive', 'v2', loadPgn);
   }
}

// Using the file id passed in the state variable from Drive, attempt to get the PGN file.
// Once completed, start the pgn4web engine.
function getPgn() {
      var request = gapi.client.drive.files.get({'fileId': this.pgnDrive});
      request.execute(function(resp) {
        downloadFile(resp, start_pgn4web);
      });
}

// Retrieve the PGN file's bytes from Google Drive.
// Store the PGN data in the pgnText TextArea so the pgn4web engine can load it
function downloadFile(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      document.getElementById("pgnText").value = xhr.responseText;
      callback();
    };
    xhr.onerror = function() {
      callback();
    };
    xhr.send();
  } else {
    callback();
  }
}
