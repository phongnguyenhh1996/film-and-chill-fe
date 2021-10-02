import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createSocketConnectionInstance } from '../../../services/socketConnection/socketConnection';
import FootBar from '../../resuableComponents/navbar/footbar';
import { getObjectFromUrl } from '../../../utils/helper';
import UserPopup from '../../resuableComponents/popup/userPopup';
import ChatBox from '../../resuableComponents/chatBox/ChatBox';
import { ToastContainer } from 'react-toastify';
// Icons imports
import CallIcon from '@material-ui/icons/CallEnd';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ChatIcon from '@material-ui/icons/Chat';
import { CircularProgress, Avatar } from '@material-ui/core';
import 'react-toastify/dist/ReactToastify.css';


const Video = ({ stream, ...rest }: any) => {
    const localVideo: any = useRef(null);
  
    // localVideo.current is null on first render
    // localVideo.current.srcObject = stream;
    
    useEffect(() => {
      // Let's update the srcObject only after the ref has been set
      // and then every time the stream prop updates
      if (localVideo.current) localVideo.current.srcObject = stream;
    }, [stream, localVideo]);
  
    return <video ref={localVideo} {...rest}/>
  };

const RoomComponent = (props: any) => {
    let socketInstance: any = useRef(null);
    const [micStatus, setMicStatus] = useState(true);
    const [camStatus, setCamStatus] = useState(true);
    const [streaming, setStreaming] = useState(false);
    const [chatToggle, setChatToggle] = useState(false);
    const [userDetails, setUserDetails] : any = useState(null);
    const [displayStream, setDisplayStream] = useState(false);
    const [messages, setMessages] = useState([]);
    const [peers, setPeers] = useState([])

    useEffect(() => {
        return () => {
            // @ts-ignore
            socketInstance.current?.destoryConnection();
        }
    }, []);

    useEffect(() => {
        if (userDetails) startConnection();
    }, [userDetails]);

    const startConnection = () => {
        let params = getObjectFromUrl();
        if (!params) params = {quality: 12}
        // get media permission first
        // @ts-ignore
        const myNavigator = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;
        myNavigator({video: true, audio: true}).then(() => {
            socketInstance.current = createSocketConnectionInstance({
                updateInstance: updateFromInstance,
                params,
                userDetails
            });
        })
    }

    const updateFromInstance = (key:string, value:any) => {
        if (key === 'streaming') setStreaming(value);
         // @ts-ignore
        if (key === 'message') setMessages([...value]);
        if (key === 'displayStream') setDisplayStream(value);
        if (key === 'peers') setPeers(value); 
    }

    useLayoutEffect(() => {
        const appBar = document.getElementsByClassName('app-navbar');
        // @ts-ignore
        if (appBar && appBar[0]) appBar[0].style.display = 'none';
        return () => {
            // @ts-ignore
            if (appBar && appBar[0]) appBar[0].style.display = 'block';
        } 
    });

    const handleDisconnect = () => {
         // @ts-ignore
        socketInstance.current?.destoryConnection();
        props.history.push('/');
    }

    const handleMyMic = () => {
         // @ts-ignore
        const { getMyVideo, reInitializeStream } = socketInstance.current;
        const myVideo = getMyVideo();
        if (myVideo) myVideo.srcObject?.getAudioTracks().forEach((track:any) => {
            if (track.kind === 'audio')
                // track.enabled = !micStatus;
                micStatus ? track.stop() : reInitializeStream(camStatus, !micStatus);
        });
        setMicStatus(!micStatus);
    }

    const handleuserDetails = (userDetails:any) => {
        setUserDetails(userDetails);
    }

    const chatHandle = (bool:boolean=false) => {
        setChatToggle(bool);
    }

    const toggleScreenShare = () => {
        // @ts-ignore
        const { reInitializeStream, toggleVideoTrack } = socketInstance.current;
        displayStream && toggleVideoTrack({video: false, audio: true});
        reInitializeStream(false, true, !displayStream ? 'displayMedia' : 'userMedia').then(() => {
            setDisplayStream(!displayStream);
            setCamStatus(false);
        });
    }

    return (
        <React.Fragment>
            {userDetails !== null && !streaming && 
                <div className="stream-loader-wrapper">
                    <CircularProgress className="stream-loader" size={24} color="primary" />
                </div>
            }
            <div id="room-container">
                {peers.map((peer: any) => {
                    return (
                        <div key={peer.id}>
                            <Video stream={peer.stream} id={peer.id} autoPlay muted={peer.muted}/>
                        </div>
                    )
                })}
            </div>
            <FootBar className="chat-footbar">
            <div className="footbar-title">WatchTogether
                {peers.map((peer: any) => {
                    return (
                        <Video style={{height: '60px'}} stream={peer.stream} id={peer.id} autoPlay muted={true}/>
                    )
                })}
            </div>
            {streaming && <div className="status-action-btn mic-btn" onClick={handleMyMic} title={micStatus ? 'Disable Mic' : 'Enable Mic'}>
                        {micStatus ? 
                            <MicIcon></MicIcon>
                            :
                            <MicOffIcon></MicOffIcon>
                        }
                    </div>}
                <div>
                    <div className="screen-share-btn" onClick={toggleScreenShare}>
                        <h4 className="screen-share-btn-text">{displayStream ? 'Stop Screen Share' : 'Share Screen'}</h4>
                    </div>
                    <div onClick={() => chatHandle(!chatToggle)} className="chat-btn" title="Chat">
                        <ChatIcon></ChatIcon>
                    </div>
                </div>
            </FootBar>
            <UserPopup submitHandle={handleuserDetails}></UserPopup>
            <ChatBox 
                chatToggle={chatToggle} 
                closeDrawer={() => chatHandle(false)} 
                socketInstance={socketInstance.current} 
                myDetails={userDetails} 
                messages={messages}>
            </ChatBox>
            <ToastContainer 
                autoClose={2000}
                closeOnClick
                pauseOnHover
            />
        </React.Fragment>
    )
}

export default RoomComponent;