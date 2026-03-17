import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connection } from "../signalr";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title
);

const API_BASE_URL = "http://localhost:5000";

const COLORS = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(0, 255, 200, 1)",
  "rgba(255, 0, 150, 1)",
];

function buildGraphsPerProperty(measurements, unitProperties) {
  // Returns an object: { [propertyId]: { chartData, propertyName } }
  const result = {};

  unitProperties.forEach((prop, index) => {
    const pId = prop.propertyId;
    const pMeasurements = measurements
      .filter((m) => m.propertyId === pId)
      .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));

    result[pId] = {
      propertyName: prop.propertyName,
      measuringUnit: prop.measuringUnit || "",
      chartData: {
        labels: pMeasurements.map((m) => {
          const d = new Date(m.timeStamp);
          return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        }),
        datasets: [
          {
            label: prop.propertyName,
            data: pMeasurements.map((m) => m.value),
            borderColor: COLORS[index % COLORS.length],
            backgroundColor: COLORS[index % COLORS.length].replace(
              "1)",
              "0.15)"
            ),
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: "white",
          },
        ],
      },
    };
  });

  return result;
}

function UnitDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unitProperties, setUnitProperties] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [graphs, setGraphs] = useState({});
  const [propertyData, setPropertyData] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load unit properties first, then measurements
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Step 1 — get properties for this unit
      const propsRes = await fetch(
        `${API_BASE_URL}/Data/getunitproperties`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UnitId: id }),
        }
      );
      const propsData = propsRes.ok ? await propsRes.json() : [];
      setUnitProperties(propsData);

      // Step 2 — get measurements for this unit
      const measRes = await fetch(
        `${API_BASE_URL}/Data/getmeasurements`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parseInt(id), propertyIds: [] }),
        }
      );
      const measData = measRes.ok ? await measRes.json() : [];
      setMeasurements(measData);

      // Step 3 — build graphs using both
      setGraphs(buildGraphsPerProperty(measData, propsData));
      setLoading(false);
    }

    loadData();
  }, [id]);

  // SignalR real-time updates
  useEffect(() => {
    if (connection.state === "Disconnected") {
      connection.start().catch((err) => console.error(err));
    }

    connection.on("UpdateMeasurements", (data, unitId) => {
      if (parseInt(id) === parseInt(unitId)) {
        setMeasurements(data);
        setGraphs((prev) => {
          // Rebuild graphs keeping current properties
          return buildGraphsPerProperty(data, unitProperties);
        });
      }
    });

    return () => {
      connection.off("UpdateMeasurements");
    };
  }, [id, unitProperties]);

  function getProperties() {
    setShow(true);
    fetch(`${API_BASE_URL}/Data/getproperties`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPropertyData(data));
  }

  function addProperty(pId) {
    fetch(`${API_BASE_URL}/Data/addunitproperty`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: pId, uid: parseInt(id) }),
    }).then(() => {
      setShow(false);
      window.location.reload();
    });
  }

  function sendDummyData() {
    const vals = {};
    unitProperties.forEach((p) => {
      vals[p.propertyId] = Math.random() * 100;
    });

    fetch(`${API_BASE_URL}/Data/sendunitdata`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(id),
        Vals: vals,
        TId: 199,
      }),
    });
  }

  const chartOptions = (title, unit) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#111" } },
      title: {
        display: true,
        text: `${title} ${unit ? `(${unit})` : ""}`,
        color: "#111",
      },
    },
    scales: {
      x: {
        ticks: { color: "#333", maxTicksLimit: 8 },
        grid: { color: "rgba(0,0,0,0.07)" },
      },
      y: {
        beginAtZero: false,
        ticks: { color: "#333" },
        grid: { color: "rgba(0,0,0,0.07)" },
      },
    },
  });

  return (
    <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="container py-5">
        <div className="dashboard-wrapper mx-auto">
          <div className="glass-card p-4 p-md-5 mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-1">Unit Dashboard</h2>
                <p className="glass-muted mb-0">
                  Live monitoring data for unit {id}
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="glass-btn" onClick={sendDummyData}>
                  Send Dummy Data
                </button>
                <button className="metric-pill" onClick={getProperties}>
                  Add Property
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">🆔</div>
                <h6 className="glass-muted mb-1">Unit ID</h6>
                <h3 className="fw-bold mb-0">{id}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">🧩</div>
                <h6 className="glass-muted mb-1">Properties</h6>
                <h3 className="fw-bold mb-0">{unitProperties.length}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-stat-card p-4 text-center h-100 glass-hover">
                <div className="summary-icon mb-2">📈</div>
                <h6 className="glass-muted mb-1">Measurements</h6>
                <h3 className="fw-bold mb-0">{measurements.length}</h3>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="glass-card p-5 text-center">
              <div className="spinner-border text-success"></div>
              <p className="mt-3 glass-muted mb-0">Loading unit data...</p>
            </div>
          ) : (
            <div className="row g-4">
              {/* Properties List */}
              <div className="col-lg-3">
                <div className="glass-card p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Properties</h5>
                    <span className="glass-badge">{unitProperties.length}</span>
                  </div>

                  {unitProperties.length === 0 ? (
                    <div className="glass-empty-box p-4 text-center">
                      <p className="glass-muted mb-0">No properties assigned</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {unitProperties.map((prop) => {
                        const latest = measurements
                          .filter((m) => m.propertyId === prop.propertyId)
                          .sort(
                            (a, b) =>
                              new Date(b.timeStamp) - new Date(a.timeStamp)
                          )[0];

                        return (
                          <div
                            key={prop.propertyId}
                            className="glass-list-item"
                          >
                            <div className="fw-semibold">{prop.propertyName}</div>
                            <small className="glass-muted">
                              Latest:{" "}
                              {latest
                                ? `${latest.value} ${prop.measuringUnit || ""}`
                                : "--"}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Graphs — one per property */}
              <div className="col-lg-9">
                <div className="glass-card p-4">
                  <h5 className="fw-bold mb-1">Property Graphs</h5>
                  <p className="glass-muted small mb-4">
                    Separate real-time chart for each property
                  </p>

                  {Object.keys(graphs).length === 0 ? (
                    <div className="glass-empty-box p-4 text-center">
                      <div className="fs-2 mb-2">📉</div>
                      <h6 className="mb-1">No data yet</h6>
                      <p className="glass-muted mb-0">
                        Send some data to see graphs appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {Object.entries(graphs).map(([pId, graph]) => (
                        <div className="glass-chart-card p-3" key={pId}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">{graph.propertyName}</h6>
                            <span className="glass-badge">Live</span>
                          </div>
                          <div style={{ height: "260px" }}>
                            {graph.chartData.datasets[0].data.length === 0 ? (
                              <div className="glass-empty-box text-center py-4">
                                <p className="glass-muted mb-0">
                                  No measurements yet for {graph.propertyName}
                                </p>
                              </div>
                            ) : (
                              <Line
                                data={graph.chartData}
                                options={chartOptions(
                                  graph.propertyName,
                                  graph.measuringUnit
                                )}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Property Modal */}
          {show && (
            <div className="glass-modal-overlay">
              <div className="glass-modal-card">
                <div className="glass-modal-header">
                  <h5 className="mb-0">Add Property to Unit</h5>
                </div>
                <div className="glass-modal-body">
                  {propertyData.map((property) => (
                    <div
                      key={property.propertyId}
                      className="glass-list-item glass-hover unit-card mb-2"
                      onClick={() => addProperty(property.propertyId)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{property.propertyName}</span>
                        <span className="glass-badge">Add</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="glass-modal-footer text-end">
                  <button
                    className="metric-pill"
                    onClick={() => setShow(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitDashboard;