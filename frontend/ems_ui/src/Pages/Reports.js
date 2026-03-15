import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:5000";
const METRICS = ["Temperature", "Humidity", "Air Quality Index", "CO2"];

function Reports() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("Temperature");

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/Data/getalldashboarddata`, {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load report data");
            }

            const data = await response.json();
            setReportData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading reports:", error);
            setError("Unable to load reports right now.");
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredData = useMemo(() => {
        return reportData.filter(
            (item) => item.propertyName?.trim() === selectedMetric
        );
    }, [reportData, selectedMetric]);

    const summary = useMemo(() => {
        const values = filteredData
            .map((item) => Number(item.value))
            .filter((v) => !isNaN(v));

        if (values.length === 0) {
            return { min: "--", max: "--", avg: "--", count: 0 };
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);

        return { min, max, avg, count: values.length };
    }, [filteredData]);

    return (
        <div className="glass-page d-flex justify-content-center align-items-center min-vh-100 position-relative">
            <video autoPlay loop muted className="bg-video">
                <source src="/background.mp4" type="video/mp4" />
            </video>

            <div className="container py-5">
                <div className="reports-wrapper mx-auto">
                    <div className="glass-card p-4 p-md-5 mb-4">
                        <h2 className="fw-bold mb-2">Reports</h2>
                        <p className="glass-muted mb-0">
                            Environmental monitoring summaries by metric and timestamp
                        </p>
                    </div>

                    <div className="glass-card p-3 mb-4">
                        <div className="d-flex flex-wrap gap-2">
                            {METRICS.map((metric) => (
                                <button
                                    key={metric}
                                    type="button"
                                    className={`metric-pill ${selectedMetric === metric ? "active" : ""}`}
                                    onClick={() => setSelectedMetric(metric)}
                                >
                                    {metric}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-lg-3">
                            <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                                <div className="summary-icon mb-2">⬇️</div>
                                <h6 className="glass-muted mb-1">Min Value</h6>
                                <h3 className="fw-bold mb-0">{summary.min}</h3>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                                <div className="summary-icon mb-2">⬆️</div>
                                <h6 className="glass-muted mb-1">Max Value</h6>
                                <h3 className="fw-bold mb-0">{summary.max}</h3>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                                <div className="summary-icon mb-2">📊</div>
                                <h6 className="glass-muted mb-1">Average</h6>
                                <h3 className="fw-bold mb-0">{summary.avg}</h3>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3">
                            <div className="glass-card-soft h-100 p-3 glass-hover text-center">
                                <div className="summary-icon mb-2">🧾</div>
                                <h6 className="glass-muted mb-1">Records</h6>
                                <h3 className="fw-bold mb-0">{summary.count}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                            <div>
                                <h5 className="fw-bold mb-1">{selectedMetric} Report</h5>
                                <p className="glass-muted small mb-0">
                                    Historical values collected from monitoring units
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success"></div>
                                <p className="mt-3 glass-muted mb-0">Loading reports...</p>
                            </div>
                        ) : error ? (
                            <div className="glass-empty-box text-center py-4">
                                <div className="fs-2 mb-2">⚠️</div>
                                <h6 className="mb-1">Error</h6>
                                <p className="glass-muted mb-0">{error}</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="glass-empty-box text-center py-4">
                                <div className="fs-2 mb-2">📂</div>
                                <h6 className="mb-1">No report data found</h6>
                                <p className="glass-muted mb-0">
                                    There are no records available for {selectedMetric}.
                                </p>
                            </div>
                        ) : (
                            <div className="glass-table">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 reports-table">
                                        <thead>
                                            <tr>
                                                <th>Unit</th>
                                                <th>Metric</th>
                                                <th>Value</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.unitName || `Unit ${item.unitId}`}</td>
                                                    <td>{item.propertyName}</td>
                                                    <td className="fw-semibold">{item.value}</td>
                                                    <td>{item.timestamp || item.createdAt || "--"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;
