import React, { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function AuthForm({ onLoginSuccess, addToast }) {
  const [isLogin, setIsLogin] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const res = await loginUser({ email, password });
        addToast("Login successful! Welcome back.", "success");
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        // Register Flow
        await registerUser({ name, email, password });
        addToast("User registered successfully! Please log in.", "success");
        setIsLogin(true); // Switch to login after registration
        setPassword("");
      }
    } catch (err) {
      setFormError(err.message || "Authentication request failed");
      addToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${isLogin ? "active" : ""}`}
          onClick={() => {
            setIsLogin(true);
            setFormError(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab ${!isLogin ? "active" : ""}`}
          onClick={() => {
            setIsLogin(false);
            setFormError(null);
          }}
        >
          Register
        </button>
      </div>

      <div className="auth-body">
        <h3>{isLogin ? "Welcome Back" : "Create an Account"}</h3>
        <p className="auth-subtitle">
          {isLogin
            ? "Sign in with your email and password to access your protected tasks."
            : "Register with your name, email, and a secure password (min 6 characters)."}
        </p>

        {formError && (
          <div className="auth-error-banner">
            <span>⚠ {formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name *</label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Manthan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address *</label>
            <input
              id="auth-email"
              type="email"
              placeholder="e.g. manthan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password *</label>
            <input
              id="auth-password"
              type="password"
              placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            className="submit-task-btn auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Registering..."
              : isLogin
              ? "Sign In →"
              : "Register Now →"}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setIsLogin(false);
                  setFormError(null);
                }}
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setIsLogin(true);
                  setFormError(null);
                }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
