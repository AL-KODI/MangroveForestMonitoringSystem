import { useEffect, useState } from "react";
import { connection } from "./signalr";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import Register from "./Pages/RegisterForm";
import RealTimeData from "./Pages/RealTimeData";
import Login from "./Pages/Login";
import AddUnit from "./Pages/AddUnit";
import AddProperty from "./Pages/AddProperty";
import PrivateRoute from "./Components/PrivateRoute";
import Layout from './Components/Layout';
import Dashboard from './Pages/Dashboard';
import UnitDashboard from './Pages/UnitDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
         
          <Route path="/addunit" element={<PrivateRoute><AddUnit /></PrivateRoute>} />
          <Route path="/addproperty" element={<PrivateRoute><AddProperty /></PrivateRoute>} />
          <Route path="/realtimedata" element={<PrivateRoute><RealTimeData /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/unitdashboard/:id" element={<PrivateRoute><UnitDashboard /></PrivateRoute>} />
        </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
