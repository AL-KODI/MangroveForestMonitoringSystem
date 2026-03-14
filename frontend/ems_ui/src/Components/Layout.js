// components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <>
      <Navbar />           {/* ← Navbar appears on EVERY page */}
      <main>
        <Outlet />         {/* ← This is where your page content goes */}
      </main>
    </>
  );
};

export default Layout;