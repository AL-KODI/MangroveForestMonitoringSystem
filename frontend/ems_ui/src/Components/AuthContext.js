import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

    const logout = async () => {
      const response = await fetch('http://localhost:5000/User/LogOut', {
        method: 'POST',
        credentials: "include"  
      });
      if (response.ok) {
        setUser(null);
        window.location.href = '/login';
        console.log('Successfully LogOut');
      }
      
    };

  useEffect(() => {
    fetch("http://localhost:5000/User/whoami", {
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setLoading(false);
       console.log(data);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading ,logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
