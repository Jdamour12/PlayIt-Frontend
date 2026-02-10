import React, { useState } from "react";
import Input from "../common/input";
import { useDispatch, useSelector } from "react-redux";
import { closeAuthModel, switchAuthModel } from "../../redux/slices/uiSlices";
import {
  clearError,
  setError,
  setLoading,
  setUser,
} from "../../redux/slices/authSlice";
import { CiUser } from "react-icons/ci";
import axios from "axios";
import "../../css/auth/Signup.css";

const Signup = () => {
  const dispatch = useDispatch();
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = useSelector((state) => state.auth.error);
  const isLoading = useSelector((state) => state.auth.isLoading);
  // Avatar States
  const [previewImage, setPreviewImage] = useState("");
  const [base64Image, setBase64Image] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result);
      setBase64Image(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!fullname || !email || !password) {
      dispatch(setError("Please fill all the fields!"));
      return;
    }
    dispatch(setLoading(true));
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/signup`,
        {
          name: fullname,
          email,
          password,
          avatar: base64Image ? base64Image : undefined,
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
      console.log("Signup Successful");
    } catch (error) {
      const serverMessage =
        error?.data?.message || error?.response?.data?.error;
      dispatch(setError(serverMessage || "Signup Failed, Please try again"));
    }
  };
  return (
    <div className="signup-wrapper">
      <h3 className="signup-title">Create an account</h3>
      <p className="signup-subtitle">Join us today by entering your details</p>
      <form className="signup-form" onSubmit={handleSubmit}>
        <div>
          <div className="profile-image-container">
            {previewImage ? (
              <img src={previewImage} alt="avatar" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                <CiUser size={40} />
              </div>
            )}
            <label className="image-upload-icon">
              📷
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>
          </div>
          <Input
            type="text"
            label="Name"
            placeholder="Enter your name"
            value={fullname}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <span
          className="forgot-link"
          onClick={() => {
            dispatch(clearError());
            dispatch(switchAuthModel("login"));
          }}
        >
          Do you already have an account?
        </span>
        {error && <div className="signup-error">{error}</div>}
        <div className="signup-actions">
          <button
            className="signup-btn-submit"
            disabled={isLoading}
            type="submit"
          >
            <span>{isLoading ? "Signing Up" : "Signup"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
