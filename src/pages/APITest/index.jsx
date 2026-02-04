import React, { useState } from "react";
import { authService, userService, bikeService } from "../services";
import { API_CONFIG } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";
import "./index.css";

/**
 * API Test Page
 * Test các chức năng API integration
 */
const APITestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const addResult = (testName, success, data, error = null) => {
    setResults((prev) => ({
      ...prev,
      [testName]: { success, data, error, timestamp: new Date().toISOString() },
    }));
    setLoading((prev) => ({ ...prev, [testName]: false }));
  };

  const testBackendHealth = async () => {
    const testName = "backend_health";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/actuator/health`);
      const data = await response.json();
      addResult(testName, true, data);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testLogin = async () => {
    const testName = "login";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testRegister = async () => {
    const testName = "register";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await authService.register({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        phone: "0123456789",
      });
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testGetProfile = async () => {
    const testName = "get_profile";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await userService.getProfile();
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testGetBikes = async () => {
    const testName = "get_bikes";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await bikeService.getAllBikes({ page: 1, limit: 10 });
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testSearchBikes = async () => {
    const testName = "search_bikes";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await bikeService.searchBikes("mountain");
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const testLogout = async () => {
    const testName = "logout";
    setLoading((prev) => ({ ...prev, [testName]: true }));

    try {
      const result = await authService.logout();
      addResult(testName, true, result);
    } catch (error) {
      addResult(testName, false, null, error.message);
    }
  };

  const clearResults = () => {
    setResults({});
  };

  const tests = [
    {
      name: "backend_health",
      label: "🏥 Backend Health Check",
      handler: testBackendHealth,
      requiresAuth: false,
    },
    {
      name: "register",
      label: "📝 Register New User",
      handler: testRegister,
      requiresAuth: false,
    },
    {
      name: "login",
      label: "🔐 Login",
      handler: testLogin,
      requiresAuth: false,
    },
    {
      name: "get_profile",
      label: "👤 Get Profile",
      handler: testGetProfile,
      requiresAuth: true,
    },
    {
      name: "get_bikes",
      label: "🚲 Get All Bikes",
      handler: testGetBikes,
      requiresAuth: false,
    },
    {
      name: "search_bikes",
      label: "🔍 Search Bikes",
      handler: testSearchBikes,
      requiresAuth: false,
    },
    {
      name: "logout",
      label: "🚪 Logout",
      handler: testLogout,
      requiresAuth: true,
    },
  ];

  return (
    <div className="api-test-page">
      <div className="api-test-container">
        <h1>🧪 API Integration Tests</h1>

        <div className="test-info">
          <p>
            <strong>Backend URL:</strong> {API_CONFIG.BASE_URL}
          </p>
          <p>
            <strong>Token:</strong>{" "}
            {localStorage.getItem(STORAGE_KEYS.TOKEN)
              ? "✅ Present"
              : "❌ Not Found"}
          </p>
        </div>

        <div className="test-buttons">
          {tests.map((test) => (
            <button
              key={test.name}
              onClick={test.handler}
              disabled={loading[test.name]}
              className={`test-button ${results[test.name]?.success ? "success" : ""} ${results[test.name]?.error ? "error" : ""}`}
            >
              {loading[test.name] ? "⏳ Loading..." : test.label}
              {test.requiresAuth && <span className="auth-badge">🔒</span>}
            </button>
          ))}

          <button onClick={clearResults} className="clear-button">
            🗑️ Clear Results
          </button>
        </div>

        <div className="test-results">
          <h2>📊 Test Results</h2>
          {Object.keys(results).length === 0 ? (
            <p className="no-results">
              Chưa có kết quả. Click vào các button trên để test.
            </p>
          ) : (
            Object.entries(results).map(([testName, result]) => (
              <div
                key={testName}
                className={`result-card ${result.success ? "success" : "error"}`}
              >
                <div className="result-header">
                  <h3>
                    {result.success ? "✅" : "❌"}{" "}
                    {testName.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <span className="timestamp">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {result.success ? (
                  <pre className="result-data">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <div className="result-error">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default APITestPage;
