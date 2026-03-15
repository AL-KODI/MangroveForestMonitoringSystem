import React, { useEffect, useState } from "react";
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
  Title
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

function RealTimeData() {
  const [chartData, setChartData] = useState({
    labels: ["10:00", "10:05", "10:10", "10:15"],
    temperature: [27, 28, 29, 30],
    humidity: [60, 62, 65, 64]
  });

  const [status, setStatus] = useState("Online");

  useEffect(() => {
    let isMounted = true;

    async function startConnection() {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
        }

        connection.on("ReceiveSensorData", (payload) => {
          if (!isMounted) return;

          const timeLabel = payload?.time || new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

          const temperature = Number(payload?.temperature);
          const humidity = Number(payload?.humidity);

          setChartData((prev) => {
            const nextLabels = [...prev.labels, timeLabel].slice(-10);
            const nextTemperature = [...prev.temperature, temperature].slice(-10);
            const nextHumidity = [...prev.humidity, humidity].slice(-10);

            return {
              labels: nextLabels,
              temperature: nextTemperature,
              humidity: nextHumidity
            };
          });
        });

        setStatus("Online");
      } catch (error) {
        console.error("SignalR connection error:", error);
        setStatus("Offline");
      }
    }

    startConnection();

    return () => {
      isMounted = false;
      connection.off("ReceiveSensorData");
    };
  }, []);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Temperature",
        data: chartData.temperature,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        tension: 0.35,
        fill: false
      },
      {
        label: "Humidity",
        data: chartData.humidity,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.35,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#111"
        }
      },
      title: {
        display: true,
        text: "Live Environmental Sensor Data",
        color: "#111"
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#333"
        },
        grid: {
          color: "rgba(0,0,0,0.08)"
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#333"
        },
        grid: {
          color: "rgba(0,0,0,0.08)"
        }
      }
    }
  };

  return (
    <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
      <video autoPlay loop muted className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="container py-5">
        <div className="realtime-wrapper mx-auto">
          <div className="glass-card p-4 p-md-5 mb-4">
            <h2 className="fw-bold mb-2">Unit Real-Time Data</h2>
            <p className="glass-muted mb-0">
              Live charts and monitoring data for the selected unit
            </p>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="glass-card-soft h-100 p-4 glass-hover text-center">
                <h6 className="glass-muted">Temperature Status</h6>
                <h3 className="fw-bold text-danger">Active</h3>
                <small className="glass-muted">
                  Latest value: {chartData.temperature.at(-1) ?? "--"} °C
                </small>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-card-soft h-100 p-4 glass-hover text-center">
                <h6 className="glass-muted">Humidity Status</h6>
                <h3 className="fw-bold text-primary">Active</h3>
                <small className="glass-muted">
                  Latest value: {chartData.humidity.at(-1) ?? "--"} %
                </small>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-card-soft h-100 p-4 glass-hover text-center">
                <h6 className="glass-muted">Monitoring Status</h6>
                <h3 className={`fw-bold ${status === "Online" ? "text-success" : "text-danger"}`}>
                  {status}
                </h3>
                <small className="glass-muted">SignalR live connection status</small>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h5 className="fw-bold mb-1">Live Sensor Chart</h5>
            <p className="glass-muted small mb-4">
              Combined line view of recent sensor readings
            </p>

            <div className="chart-panel">
              <div className="chart-box">
                <Line data={data} options={options} />
              </div>
            </div>
          </div>

          <div className="glass-card-soft p-3 mt-4">
            <span className="fw-semibold">Note:</span> This page displays the latest sensor values received from the real-time monitoring stream.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealTimeData;
