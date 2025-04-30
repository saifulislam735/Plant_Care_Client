
import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`;
      console.log("Login fetch URL:", url);
      console.log("Request body:", JSON.stringify({ email, password }));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Failed to parse error response:", e);
          errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error("Error data:", errorData);
        throw new Error(errorData.detail || "Login failed");
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
        throw new Error("Invalid response from server: Unable to parse JSON");
      }
      console.log("Response data:", data);

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Login fetch error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();

      // Add all user data to formData
      Object.keys(userData).forEach((key) => {
        if (key === "image" && userData[key]) {
          formData.append("image", userData[key]);
        } else {
          formData.append(key, userData[key]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Failed to parse register error response:", e);
          errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error("Register error data:", errorData);
        throw new Error(errorData.detail || "Registration failed");
      }

      return true;
    } catch (error) {
      console.error("Register fetch error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isOfficer = () => {
    return user && user.role === "officer";
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isOfficer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;