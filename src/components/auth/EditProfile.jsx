import React, { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  clearError,
  setError,
  setLoading,
  setUser,
} from "../../redux/slices/authSlice";
import { CiUser } from "react-icons/ci";
import "../../css/auth/EditProfile.css";

const EditProfile = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // update password
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [previewImage, setPreviewImage] = useState(user?.avatar || "");
  const [base64Image, setBase64Image] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPreviewImage(user.avatar || "");
    }
  }, [user]);

  // for imagekit row image to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setBase64Image(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle password toggle
  const handlePasswordToggle = () => {
    if (showPasswordFields) {
      // Clearing password fields when closing
      setPassword("");
      setNewPassword("");
    }
    setShowPasswordFields(!showPasswordFields);
  };

  //   handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const payload = {};
    if (name && name !== user.name) payload.name = name;
    if (email && email !== user.email) payload.email = email;
    if (base64Image) payload.avatar = base64Image;

    if (showPasswordFields) {
      if (!password || !newPassword) {
        dispatch(setError("Please fill in both password fields"));
        return;
      }
      payload.currentPassword = password;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      dispatch(setError("No changes made"));
      return;
    }

    dispatch(setLoading(true));
    const storedToken = token || localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await response.json();

      // Update the previewImage with the new avatar URL from the server
      if (data.user?.avatar) {
        setPreviewImage(data.user.avatar);
      }

      // Clear the base64Image after successful submission
      setBase64Image("");

      // Update Redux with new user data
      dispatch(
        setUser({
          user: data.user,
          token: storedToken,
        }),
      );

      // Show success message briefly before closing
      dispatch(clearError());

      // Close modal after a short delay so user can see the update
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 500);

      console.log("Profile updated successfully");
    } catch (error) {
      let serverErrorMessage =
        error.response?.data?.message ||
        error.message ||
        error?.response?.data?.error ||
        "An error occurred while updating profile";
      dispatch(
        setError(
          serverErrorMessage || "An error occurred while updating profile",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };
  return (
    <div className="editprofile-wrapper">
      <h3 className="editprofile-title">Edit Profile</h3>
      <p>Update your profile information</p>

      <form className="editprofile-form" onSubmit={handleSubmit}>
        {/* Profile Image */}
        <div className="profile-image-container">
          {previewImage ? (
            <img src={previewImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-placeholder">
              <CiUser size={40} />
            </div>
          )}
          <label htmlFor="image-upload" className="image-upload-icon">
            📷
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Error Message */}
        {error && <div className="editprofile-error">{error}</div>}

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="form-input"
          />
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="form-input"
          />
        </div>

        {/* Password Toggle */}
        <button
          type="button"
          className="editprofile-password-toggle"
          onClick={handlePasswordToggle}
        >
          {showPasswordFields ? "Hide" : "Change"} Password
        </button>

        {/* Password Fields */}
        {showPasswordFields && (
          <>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="form-input"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="editprofile-actions">
          <button
            type="button"
            className="editprofile-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="editprofile-btn-submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
