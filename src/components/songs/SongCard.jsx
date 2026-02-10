import React from 'react';
import "../../css/songs/SongCard.css";

const SongCard = ({song, onSelectFavorite}) => {
  return (
    <div className="song-card" onClick={onSelectFavorite}>
        <div className="song-card-image">
            <img src={song.image} alt={song.name} />
        </div>
        <div className="song-card-info">
            <h3 className="song-title">{song.name}</h3>
            <p className="song-artist">{song.artist}</p>
        </div>
    </div>
  )
}

export default SongCard;
