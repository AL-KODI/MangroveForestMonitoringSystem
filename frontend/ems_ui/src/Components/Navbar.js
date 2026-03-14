// components/Navbar.jsx

import { useEffect, useState } from "react";
import { connection } from "../signalr";
import { useAuth } from './AuthContext';   // ← your hook from before
import { useNavigate } from "react-router-dom";
import { Alert } from "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useRef } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [Alerts,setAlerts] = useState(false);
  const [audioState,setAudioState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
    
    // Optional: better behavior for rapid triggers
    audioRef.current.preload = "auto";
    // audioRef.current.loop = false; // usually false for alerts

    // Cleanup when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = ""; // helps GC in some browsers
      }
    };
  }, []);

  const playAudio = () => {
    if (!audioRef.current) return;

    // Most reliable way to interrupt & replay:
    audioRef.current.loop = true;
    audioRef.current.currentTime = 0;
    audioRef.current.pause();           // stop if already playing
    audioRef.current.play().catch(err => {
      console.log("Play prevented:", err); // autoplay policy, etc.
    });
  };

  const stopAudio = () => {
    if (!audioRef.current) return;

    // Most reliable way to interrupt & replay:
    audioRef.current.pause();    
    audioRef.current.currentTime = 0;
    setShowModal(false);
           // stop if already playing
    
  };

 /* const audio = new Audio("/alert.mp3");
  const playAudio = () => {
    if(audioState == false){
        console.log("Alert Sound Start");
        setAudioState(true);
        audio.play();
      }
  };
    
  const stopAudio = () => {
    audio.pause(); 
    audio.currentTime = 0; 
    console.log("Alert Sound Stopped");
    setShowModal(false);
    setAudioState(false);
  };*/
  useEffect(() => {
      if (connection.state === "Disconnected") {
        connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch(err => console.error(err));
      }
      console.log(connection.state);
  
              
      if (!connection) return;
  
      // Listen for server → client messages
      connection.on("Alerts", (alert) => {
        console.log("Alerts are Comming !!!")
          setShowModal(true);
          setAlerts(alert)
          playAudio();
        console.log(alert);
      });
  
      return () => {
        connection.off("Alerts");
      };
    });


  return (
<div>
<nav className="navbar navbar-expand-lg glass-nav px-3">
    
  <div className="container-fluid">
    
    

    <a className="navbar-brand" href="/dashboard" style={{color:"white"}}><h1 className="glow-green">EMS</h1></a>
    
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span className="navbar-toggler-icon"></span>
      </button>
    <div className="collapse navbar-collapse" id="menu">



      <ul className="navbar-nav ms-auto">
       
        

        <li className="nav-item">
          <a className="nav-link" href="/addUnit">Add Unit</a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="/addProperty">Add Property</a>
        </li>

        <li className="nav-item">
           <button className="glass-btn" onClick={logout}>Logout</button>
        </li>

      </ul>
    </div>

  </div>
</nav>
{showModal && (
        <>
          {/* Fix: Added 'show' and 'd-block' for visibility */}
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">System Alerts</h5>

                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => stopAudio()}
                  ></button>
                </div>
                <div className="modal-body">
                  {Alerts}
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => stopAudio()}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Backdrop for closing */}
          <div className="modal-backdrop fade show" onClick={() => stopAudio()}></div>
        </>
      )}
</div>
  );
};

export default Navbar;