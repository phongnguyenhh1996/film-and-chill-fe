function preferOpus(sdp: any) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex = null
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('m=audio') !== -1) {
      mLineIndex = i;
      break;
    }
  }

  if (mLineIndex === null) return sdp;

  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) 
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      break;
    }
  }

  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
};

var extractSdp = function(sdpLine: any, pattern: any) {
  var result = sdpLine.match(pattern);
  return (result && result.length == 2)? result[1]: null;
};

var setDefaultCodec = function(mLine: any, payload: any) {
  var elements = mLine.split(' ');
  var newLine = new Array();
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) newLine[index++] = payload;
    if (elements[i] !== payload) newLine[index++] = elements[i];
  }
  return newLine.join(' ');
};

var removeCN = function(sdpLines: any, mLineIndex: any) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) mLineElements.splice(cnPos, 1);
      sdpLines.splice(i, 1);
    }
  }
  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
};

export default preferOpus