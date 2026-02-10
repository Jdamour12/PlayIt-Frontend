import React, { useState } from "react";
import validator from "validator";
import Input from "../common/input";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  clearError,
  setError,
  setLoading,
  setUser,
} from "../../redux/slices/authSlice";
import { closeAuthModel, switchAuthModel } from "../../redux/slices/uiSlices";
import "../../css/auth/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // forget password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { authModel } = useSelector((state) => state.ui);
  const isForgot = authModel === "forgot";
  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validator.isEmail(email)) {
      dispatch(setError("Please enter a valid email address!"));
      return;
    }
    if (!password) {
      dispatch(setError("Please enter your password!"));
      return;
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      const data = res.data || {};

      dispatch(
        setUser({
          user: data.user,
          token: data.token,
        }),
      );

      localStorage.setItem("token", data.token);
      dispatch(closeAuthModel());
      console.log("Login successfully!");
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || error?.response?.data?.error;
      dispatch(setError(serverMessage || "Login Failed!"));
    }
  };
  const handleForgotPassword = async (e) => {
    if (!forgotEmail) {
      setForgotMsg("Please enter your email address!");
      return;
    }
    try {
      setForgotMsg("Sending reset instructions...");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/forgot-password`,
        {
          email: forgotEmail,
        },
      );
      setForgotMsg("Reset instructions sent! Please check your email.");
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || error?.response?.data?.error;
      setForgotMsg(serverMessage || "Failed to send reset instructions!");
    }
  };
  return (
    <div className="login-wrapper">
      <h3 className="login-title">Welcome Back</h3>
      <p className="login-subtitle">Please enter your details to login</p>
      <form className="login-form" onSubmit={handleLogin}>
        {!isForgot ? (
          <>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              placeholder="kubwimana@gmail.com"
              type="email"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="********"
              type="password"
            />
            <div
              className="forgot-wrapper"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span
                className="forgot-link"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  dispatch(clearError());
                  dispatch(switchAuthModel("forgot"));
                }}
              >
                Forgot Password?
              </span>
              <span
                className="forgot-link"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  dispatch(clearError());
                  dispatch(switchAuthModel("signup"));
                }}
              >
                Don't have an account? Sign Up
              </span>
            </div>
            {error && <div className="login-error">{error}</div>}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? "Logging in..." : "Login"}</span>
            </button>
          </>
        ) : (
          <div className="forgot-box">
            <Input
              type="text"
              placeholder="Enter your email to register"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className=""
            />
            {forgotMsg && <p className="forgot-msg">{forgotMsg}</p>}
            <button className="forgot-btn" type="button" onClick={handleForgotPassword}>
              Send Reset Instructions
            </button>
            <div
              className="forgot-wrapper"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <span
                className="forgot-link"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  dispatch(clearError());
                  dispatch(switchAuthModel("login"));
                }}
              >
                Back to Login
              </span>
              <span
                className="forgot-link"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  dispatch(clearError());
                  dispatch(switchAuthModel("signup"));
                }}
              >
                Don't have an account? Sign Up
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
export default Login;
