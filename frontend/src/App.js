import { useEffect, useState } from "react";
import { connection } from "./signalr";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import Register from "./Pages/RegisterForm";
import RealTimeData from "./Pages/RealTimeData";
import Login from "./Pages/Login";
import PrivateRoute from "./Components/PrivateRoute";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/realtimedata" element={<PrivateRoute><RealTimeData /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
