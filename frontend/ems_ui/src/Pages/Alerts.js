import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadAlerts(true);

        const interval = setInterval(() => {
            loadAlerts(false);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    async function loadAlerts(showLoader = false) {
        try {
            if (showLoader) setLoading(true);

            const response = await fetch(`${API_BASE_URL}/Data/getalerts`, {
                method: "POST",
                credentials: "include"
            });

            const data = response.ok ? await response.json() : [];
            setAlerts(Array.isArray(data) ? data : []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error loading alerts:", error);
            if (showLoader) setAlerts([]);
        } finally {
            if (showLoader) setLoading(false);
        }
    }

    function getBadgeClass(type) {
        if (type === "CRITICAL") return "alert-badge critical";
        if (type === "WARNING") return "alert-badge warning";
        return "alert-badge safe";
    }

    function getIcon(type) {
        if (type === "CRITICAL") return "🚨";
        if (type === "WARNING") return "⚠️";
        return "✅";
    }

    return (
        <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
            <video autoPlay loop muted className="bg-video">
                <source src="/background.mp4" type="video/mp4" />
            </video>

            <div className="container py-5">
                <div className="glass-card alerts-wrapper mx-auto">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold mb-2">Alerts Center</h2>
                        <p className="glass-muted mb-2">
                            SMS and system-generated environmental alerts
                        </p>
                        <div className="live-indicator">
                            <span className="live-dot"></span>
                            Live Updates
                            {lastUpdated && (
                                <span className="ms-2 small">
                                    • Last updated: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success"></div>
                            <p className="mt-3 glass-muted">Loading alerts...</p>
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="glass-empty-box text-center py-4">
                            <div className="fs-1 mb-2">📭</div>
                            <h5 className="mb-2">No alerts found</h5>
                            <p className="glass-muted mb-0">
                                New system alerts will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {alerts.map((alert, index) => (
                                <div className="glass-card-soft glass-hover p-3 p-md-4" key={index}>
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="alert-icon">{getIcon(alert.type)}</span>
                                                <h6 className="fw-semibold mb-0">{alert.message}</h6>
                                            </div>

                                            <div className="glass-meta">
                                                <span>{alert.source || "System"}</span>
                                                <span className="mx-2">•</span>
                                                <span>{alert.timestamp}</span>
                                            </div>
                                        </div>

                                        <span className={getBadgeClass(alert.type)}>
                                            {alert.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Alerts;
