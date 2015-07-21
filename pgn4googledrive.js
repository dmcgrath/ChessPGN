var thisParamString = window.location.search;

// Drive API information needed to identify this app.
var CLIENT_ID = '1023257958231-8nav97ck2tohrhvfguecrvo03qe3t2ie.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.install', 'https://www.googleapis.com/auth/userinfo.profile'];
var PROJECT_NUMBER = 1023257958231;

// Circular error buffer size.
var BUFFER_SIZE = 25;

function logDriveError(errorResponse) {
   if(typeof Storage !== "undefined") {
      if(localStorage.bufferIndex) {
         bufferIndex = localStorage.bufferIndex;
         if(bufferIndex > BUFFER_SIZE) {
            bufferIndex = 0;
         }
         bufferIndex += 1;
         localStorage.bufferIndex = bufferIndex;
         
         errors = JSON.parse(localStorage.errors);
         errors[bufferIndex-1] = JSON.stringify(errorResponse);
      } else {
         localStorage.bufferIndex = 1;
         bufferIndex = 1;
         
         errors = [];
         errors[0] = JSON.stringify(errorResponse);
      }
      
      localStorage.errors = JSON.stringify(errors);
   } else {
      console.log(JSON.stringify(errors));
   }
}

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

var shareDrive;

 // Enable sharing
var init = function() {
  shareDrive = new gapi.drive.share.ShareClient(PROJECT_NUMBER);
  shareDrive.setItemIds([this.pgnDrive]);
}

// Check if we have authorization to the user's Drive account to retrieve the PGN file
// If not, call to ask the user for authorization to do so.
// Generally, we only need to ask the user the very first time they access the app.
function getAuth(fileID) {
  var driveData = {pgnDrive: fileID};
  var handleRes = handleAuthResult.bind(driveData)
  gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true}, handleRes);
  
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
    if(resp.error) {
      if (resp.error.code === 400) {
         logDriveError(resp.error);
      } else if (resp.error.code === 401) {
         logDriveError(resp.error);
      } else if (resp.error.code === 403) {
         logDriveError(resp.error);
      } else if (resp.error.code === 404) {
         alert("Google Drive reports this file ID doesn't exist. Please ensure you open the file via in Drive.");
         logDriveError(resp.error);
      } else if (resp.error.code === 500) {
         alert("Google Drive reported an internal server error. Please try again in 1 minute.");
         logDriveError(resp.error);
      } else {
         logDriveError(resp.error);
      }
    } else {
      downloadFile(resp, start_pgn4web);
    }
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
