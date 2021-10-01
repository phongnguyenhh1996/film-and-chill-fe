function preferOpus(sdp: any) {
  const newSdp = sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000');
  return newSdp
}

export default preferOpus