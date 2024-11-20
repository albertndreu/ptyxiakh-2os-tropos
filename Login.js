// src/Login.js

import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        code,
      });

      if (response.data.success) {
        setMessage("Login successful!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("token", `Bearer ${response.data.token}`);
        window.location.href = '/';
      } else {
        setMessage("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage("An error occurred during login. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    window.location.href = '/';
  };

  if (isLoggedIn) {
    return (
      <div className="logout-container">
        <h2>Logged in as {localStorage.getItem("username")}</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Code:</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
    
  );
}

export default Login;
