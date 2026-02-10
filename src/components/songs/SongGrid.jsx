import React from "react";
import "../../css/songs/SongGrid.css";
import SongCard from "./SongCard";

const SongGrid = ({ songs, onSelectFavorite }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="song-grid-root">
        <p className="empty-text">No favorite songs yet.</p>
        <p className="empty-subtext">
          Add songs to your favorites to see them here.
        </p>
      </div>
    );
  }
  return (
    <div className="song-grid-wrapper">
      <h2 className="song-grid-heading">Your Favorite Songs</h2>
      <div className="song-grid">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onSelectFavorite={() => onSelectFavorite(song)}
          />
        ))}
      </div>
    </div>
  );
};

export default SongGrid;
