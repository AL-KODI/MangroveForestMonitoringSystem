import { useEffect, useState } from "react";
import { connection } from "../signalr";
import { useAuth } from './AuthContext';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Alert } from "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useRef } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [Alerts, setAlerts] = useState(false);
  const [audioState, setAudioState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/alert.mp3");
    audioRef.current.preload = "auto";

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      }
    };
  }, []);

  const playAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.loop = true;
    audioRef.current.currentTime = 0;
    audioRef.current.pause();
    audioRef.current.play().catch(err => {
      console.log("Play prevented:", err);
    });
  };

  const stopAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setShowModal(false);
  };

  useEffect(() => {
    if (connection.state === "Disconnected") {
      connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch(err => console.error(err));
    }
    console.log(connection.state);

    if (!connection) return;

    connection.on("Alerts", (alert) => {
      console.log("Alerts are Comming !!!");
      setShowModal(true);
      setAlerts(alert);
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
          <a
            className="navbar-brand brand fw-bold fs-4"
            href="/dashboard"
            style={{ color: "white", textDecoration: "none" }}
          >
            <h1 className="glow-green mb-0">EMS</h1>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="menu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <a className="nav-link nav-link-custom" href="/addUnit">Add Unit</a>
              </li>

              <li className="nav-item">
                <a className="nav-link nav-link-custom" href="/addProperty">Add Property</a>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link nav-link-custom" to="/alerts">Alerts</NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link nav-link-custom" to="/reports">Reports</NavLink>
              </li>

              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button className="glass-btn" onClick={logout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {showModal && (
        <>
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

          <div className="modal-backdrop fade show" onClick={() => stopAudio()}></div>
        </>
      )}
    </div>
  );
};

export default Navbar;
