import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Footer from "../components/layout/Footer";
import SideMenu from "../components/layout/SideMenu";
import MainArea from "../components/layout/MainArea";

import "../css/pages/HomePage.css";
import useAudioPlayer from "../hooks/useAudioPlayer";
import Modal from "../components/common/Modal";
import EditProfile from "../components/auth/EditProfile";



const Homepage = () => {
  const [view, setView] = useState("home");
  const [songs, setSongs] = useState([]);
  const [searchSongs, setSearchSongs] = useState([]);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const auth = useSelector((state) => state.auth);
  const songsToDisplay = view === "search" ? searchSongs : songs;

  const {
    audioRef,
    currentIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    playbackSpeed,
    volume,
    shuffleEnabled,
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleEnded,
    handleChangePlaybackSpeed,
    handleSeek,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLoop,
    handleToggleShuffle,
  } = useAudioPlayer(songsToDisplay);

  const playerState = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    loopEnabled,
    shuffleEnabled,
    playbackSpeed,
    volume,
  };

  const playerControls = {
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrevious,
    handleEnded,
    handleSeek,
  };

  const playerFeatures = {
    onToggleMute: handleToggleMute,
    onToggleLoop: handleToggleLoop,
    onToggleShuffle: handleToggleShuffle,
    onChangePlaybackSpeed: handleChangePlaybackSpeed,
    onVolumeChange: handleVolumeChange,
  };
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/songs`,
        );
        setSongs(res.data.results || []);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    fetchSongs();
  }, []);

  const loadPlaylist = async (tag) => {
    if (!tag) {
      console.warn("No tag provided for playlist loading.");
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/songs/playlistByTag/${tag}`,
      );
      setSongs(res.data.results || []);
    } catch (error) {
      console.error("Error loading playlist:", error);
      setSongs([]);
    }
  };

  // When user clicks on a song in a table
  const handleSongClick = (index) => {
    playSongAtIndex(index);
  };

  const handlePlayFavorite = (song) => {
    const favorite = auth.user?.favorites || [];
    if (!favorite.length) return;
    const index = songs.findIndex((fav) => fav.id === song.id);
    setSongs(auth.user.favorites);
    setView("home");

    setTimeout(() => {
      playSongAtIndex(index);
    }, 0);
  };
  return (
    <div className="homepage-root">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        {currentSong && <source src={currentSong.audio} type="audio/mpeg" />}
      </audio>
      <div className="homepage-main-wrapper">
        {/* Sidebar */}
        <div className="homepage-sidebar">
          <SideMenu setView={setView} view={view} onOpenEditProfile={() => setOpenEditProfile(true)} />
        </div>
        {/* Main Content */}
        <div className="homepage-content">
          <MainArea
            view={view}
            currentIndex={currentIndex}
            onSelecting={handleSongClick}
            onSelectFavorite={handlePlayFavorite}
            onSelectTag={loadPlaylist}
            songs={songs}
            handleSongClick={handleSongClick}
            songsToDisplay={songsToDisplay}
            setSearchSongs={setSearchSongs}
          />
        </div>
      </div>
      {/* Footer Player */}
      <Footer
        playerState={playerState}
        playerControls={playerControls}
        playerFeatures={playerFeatures}
      />
      {/* Edit Profile Modal */}
      {openEditProfile && <Modal onClose={() => setOpenEditProfile(false)}>
        <EditProfile onClose={() => setOpenEditProfile(false)} />
      </Modal>}
    </div>
  );
};

export default Homepage;
