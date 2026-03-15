import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Dashboard() {
  const [units, setUnits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [unitsRes, alertsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Data/getunits`, {
          method: "POST",
          credentials: "include"
        }),
        fetch(`${API_BASE_URL}/Data/getalerts`, {
          method: "POST",
          credentials: "include"
        }),
        fetch(`${API_BASE_URL}/Data/getdashboardsummary`, {
          method: "POST",
          credentials: "include"
        })
      ]);

      const unitsData = unitsRes.ok ? await unitsRes.json() : [];
      const alertsData = alertsRes.ok ? await alertsRes.json() : [];
      const summaryData = summaryRes.ok ? await summaryRes.json() : [];

      setUnits(Array.isArray(unitsData) ? unitsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setSummary(Array.isArray(summaryData) ? summaryData : []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("Unable to load dashboard data.");
      setUnits([]);
      setAlerts([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  function goToUnit(unitId) {
    navigate(`/unitdashboard/${unitId}`);
  }

  function getAlertTypeClass(type) {
    if (type === "CRITICAL") return "alert-badge critical";
    if (type === "WARNING") return "alert-badge warning";
    return "alert-badge safe";
  }

  function getIcon(type) {
    if (type === "CRITICAL") return "🚨";
    if (type === "WARNING") return "⚠️";
    return "✅";
  }

  // Pick an emoji icon based on property name
  function getPropertyIcon(name) {
    const n = name?.toLowerCase() || "";
    if (n.includes("temp")) return "🌡️";
    if (n.includes("humid")) return "💧";
    if (n.includes("co2") || n.includes("carbon")) return "🌫️";
    if (n.includes("salt")) return "🧂";
    if (n.includes("air")) return "💨";
    if (n.includes("pressure")) return "🔵";
    if (n.includes("light")) return "💡";
    return "📟";
  }

  return (
    <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="container py-5">
        <div className="dashboard-wrapper mx-auto">
          <div className="glass-card p-4 p-md-5 mb-4">
            <h2 className="fw-bold mb-2">Environmental Monitoring Dashboard</h2>
            <p className="glass-muted mb-0">
              Real-time sensor data, unit monitoring, and system alerts
            </p>
          </div>

          {loading ? (
            <div className="glass-card p-5 text-center">
              <div className="spinner-border text-success"></div>
              <p className="mt-3 glass-muted mb-0">Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-5 text-center">
              <div className="fs-2 mb-2">⚠️</div>
              <h5 className="mb-2">Unable to load dashboard</h5>
              <p className="glass-muted mb-0">{error}</p>
            </div>
          ) : (
            <>
              {/* Dynamic Summary Cards — one per property */}
              <div className="row g-3 mb-4">

                {/* Total Units card always shown first */}
                <div className="col-sm-6 col-lg-3">
                  <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                    <div className="summary-icon mb-2">📟</div>
                    <h6 className="glass-muted mb-1">Total Units</h6>
                    <h2 className="fw-bold mb-0">{units.length}</h2>
                  </div>
                </div>

                {/* One card per property from DB */}
                {summary.map((item, index) => (
                  <div className="col-sm-6 col-lg-3" key={index}>
                    <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                      <div className="summary-icon mb-2">
                        {getPropertyIcon(item.propertyName)}
                      </div>
                      <h6 className="glass-muted mb-1">{item.propertyName}</h6>
                      <h2 className="fw-bold mb-0">
                        {item.value} {item.value !== "--" ? item.measuringUnit : ""}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="glass-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">Sensor Units</h5>
                        <p className="glass-muted small mb-0">
                          Select a unit to view detailed live information
                        </p>
                      </div>
                      <span className="glass-badge">{units.length} Units</span>
                    </div>

                    {units.length === 0 ? (
                      <div className="glass-empty-box text-center py-4">
                        <div className="fs-2 mb-2">📭</div>
                        <h6 className="mb-1">No units found</h6>
                        <p className="glass-muted mb-0">
                          No monitoring units are available right now.
                        </p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {units.map((unit) => (
                          <div className="col-md-6" key={unit.unitId}>
                            <div
                              className="glass-card-soft h-100 p-3 glass-hover unit-card"
                              onClick={() => goToUnit(unit.unitId)}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                                <h5 className="fw-bold mb-0">{unit.unitName}</h5>
                                <span className="glass-badge">ID: {unit.unitId}</span>
                              </div>

                              <p className="glass-muted mb-2">
                                <span className="fw-semibold">Location:</span> {unit.location || "--"}
                              </p>

                              <p className="glass-muted mb-3">
                                {unit.unitDescription || "No description available."}
                              </p>

                              <button className="glass-btn unit-btn">View Unit</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="glass-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">Recent Alerts</h5>
                        <p className="glass-muted small mb-0">
                          Real alerts from the monitoring system
                        </p>
                      </div>
                      <span className="glass-badge">{alerts.length} Alerts</span>
                    </div>

                    {alerts.length === 0 ? (
                      <div className="glass-empty-box text-center py-4">
                        <div className="fs-2 mb-2">✅</div>
                        <h6 className="mb-1">No alerts available</h6>
                        <p className="glass-muted mb-0">
                          The system has not reported any recent alerts.
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {alerts.slice(0, 6).map((alert, index) => (
                          <div key={index} className="glass-card-soft p-3 glass-hover">
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div>
                                <div className="fw-semibold mb-1">
                                  {getIcon(alert.type)} {alert.message}
                                </div>
                                <small className="glass-muted">
                                  {alert.source || "System"} • {alert.timestamp || "--"}
                                </small>
                              </div>
                              <span className={getAlertTypeClass(alert.type)}>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;