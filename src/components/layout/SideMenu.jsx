import React from "react";

import { IoIosSettings } from "react-icons/io";
import logo from "../../assets/playit.png";
import "../../css/sidemenu/SideMenu.css";
import { CiUser } from "react-icons/ci";
import { AiOutlineHome, AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { openAuthModel } from "../../redux/slices/uiSlices";

const SideMenu = ({ setView, view, onOpenEditProfile }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const displayUser = {
    name: user?.name || "Guest",
    avatar: user?.avatar || null,
  };

  const handleSearchClick = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModel("login"));
      return;
    }
    setView("search");
  };

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModel("login"));
      return;
    }
    setView("favorite");
  };

  const getNavBtnClass = (item) =>
    `sidemenu-nav-btn ${view === item ? "active" : ""}`;
  return (
    <>
      <aside className="sidemenu-root">
        {/* Logo */}
        <div className="sidemenu-header">
          <img src={logo} alt="PlayIt Logo" className="sidemenu-logo-img" />
          <h2 className="sidemenu-logo-title">PlayIt</h2>
        </div>
        {/* Navigation */}
        <nav className="sidemenu-nav" aria-label="Main navigation">
          <ul className="sidemenu-nav-list">
            <li>
              <button
                className={getNavBtnClass("home")}
                onClick={() => setView("home")}
              >
                <AiOutlineHome className="sidemenu-nav-icon" size={18} />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleSearchClick}
                className={getNavBtnClass("search")}
              >
                <AiOutlineSearch className="sidemenu-nav-icon" size={18} />
                <span> Search</span>
              </button>
            </li>
            <li>
              <button
                className={getNavBtnClass("favorite")}
                onClick={handleFavoriteClick}
              >
                <AiOutlineHeart size={18} />
                <span>favorite</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex-1"></div>
        <div className="sidemenu-profile-row">
          <div className="profile-placeholder">
            {displayUser.avatar ? (
              <img
                src={displayUser.avatar}
                alt={displayUser.name}
                className="profile-avatar-image"
              />
            ) : (
              <CiUser size={30} />
            )}
          </div>

          <div className="sidemenu-username-wrapper">
            <div className="sidemenu-username">{displayUser.name}</div>
          </div>
          {isAuthenticated && (
            <button
              className="sidemenu-settings-btn"
              type="button"
              onClick={onOpenEditProfile}
            >
              <IoIosSettings size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
