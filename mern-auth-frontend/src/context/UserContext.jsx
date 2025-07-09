import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    console.log("📦 Stored User (localStorage):", stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("🧠 Parsed User:", parsed);
      setUser(parsed);
      if (parsed._id) {
        const token = localStorage.getItem("token");
        setLoading(true);
        axiosInstance.get(`/auth/user/${parsed._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => {
            console.log("✅ Refreshed User from API:", res.data.user);
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          })
          .catch((err) => {
            console.error("❌ Error fetching user:", err);
          })
          .finally(() => setLoading(false));
      }
    }
  }, []);

  const refreshUser = async () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) return;

    const parsedUser = JSON.parse(storedUser);
    setLoading(true);

    try {
      const res = await axiosInstance.get(`/auth/user/${parsedUser._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("❌ Error fetching user (refreshUser):", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ This return was missing!
  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
