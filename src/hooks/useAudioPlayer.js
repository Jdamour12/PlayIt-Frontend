import { useReducer, useRef, useState } from "react";

const initialAudioState = {
    isPlaying: false,
    isLoading: false,
    isMuted: false,
    volume: 1,
    loopEnabled: false,
    shuffleEnabled: false,
    playbackSpeed: 1,
    currentIndex: null,
    currentSong: null,
    currentTime: 0,
}

// Reducer function to manage audio player state
export const audioReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return {
                ...state,isLoading: true,
            }
        case "PLAY":
            return {
                ...state, isPlaying: true, isLoading: false,
            }
        case "PAUSE":
            return {
                ...state, isPlaying: false, isLoading: false,
            }
            case "MUTE":
            return {
                ...state, isMuted: true,
            }
        case "UNMUTE":
            return {
                ...state, isMuted: false,
            }
            case "SET_VOLUME":
            return {
                ...state, volume: action.payload,
            }
            case "TOGGLE_LOOP":
            return {
                ...state, loopEnabled: !state.loopEnabled, shuffleEnabled: false,
            }
        case "TOGGLE_SHUFFLE":
            return {
                ...state, shuffleEnabled: !state.shuffleEnabled, loopEnabled: false,
            }
        case "SET_PLAYBACK_SPEED":
            return {
                ...state, playbackSpeed: action.payload,
            }
            case "SET_CURRENT_TRACK":
            return {
                ...state, currentIndex: action.payload.index, currentSong: action.payload.song, isLoading: true,
            }
        case "SET_CURRENT_TIME":
            return {
                ...state, currentTime: action.payload,
            }
        default:
            return state;
    }
}

const useAudioPlayer = (songs) => {
    const [audioState, dispatch] = useReducer(audioReducer, initialAudioState);
    const [duration, setDuration] = useState(0);
    const previousIndexRef = useRef(1);
    const audioRef = useRef(null);

    // Play a song at a specific value
    const playSongAtIndex = (index) => {
        if (!songs || songs.length === 0) return;
        const song = songs[index];
        dispatch({ type: "SET_CURRENT_TRACK", payload: { index, song } });
        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });

        const audio = audioRef.current;
        if (!audio) return;
        dispatch({ type: "LOADING" });
        audio.load();

        audio.playbackRate = audioState.playbackSpeed;
        audio.play().then(() => {
            dispatch({ type: "PLAY" });
        }).catch((error) => {
            console.error("Error playing audio:", error);
            dispatch({ type: "PAUSE" });
        });
    };

    const handleTogglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if(audio.paused) {
            audio.play().then(() => {
                dispatch({ type: "PLAY" });
            }).catch((error) => {
                console.error("Error playing audio:", error);
                dispatch({ type: "PAUSE" });
            });
    } else {
        audio.pause();
        dispatch({ type: "PAUSE" });
    }};

    const handleNext = () => {
        if (!songs || songs.length === 0) return;
        if(audioState.currentIndex === null) {
            playSongAtIndex(0);
            return;
        }
        // if shuffle is enabled, pick a random song index different from the current one
        if(audioState.shuffleEnabled) {
            let randomIndex = audioState.currentIndex;
            while(randomIndex === audioState.currentIndex) {
                randomIndex = Math.floor(Math.random() * songs.length);
            }
            playSongAtIndex(randomIndex);
            return;
        }
        // otherwise, play the next song in the list, or loop back to the start if at the end
        const nextIndex = (audioState.currentIndex + 1) % songs.length;
        playSongAtIndex(nextIndex);
    };

    const handlePrevious = () => {
        if (!songs || songs.length === 0) return;
        if(audioState.currentIndex === null) {
            playSongAtIndex(0);
            return;
        }
        const prevIndex = (audioState.currentIndex - 1 + songs.length) % songs.length;
        playSongAtIndex(prevIndex);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio) return;
        dispatch({ type: "SET_CURRENT_TIME", payload: audio.currentTime || 0 });
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (!audio) return;
        setDuration(audio.duration || 0);
        audio.playbackRate = audioState.playbackSpeed;
        audio.volume = audioState.volume;
        audio.muted = audioState.isMuted;

        dispatch({type: "PLAY"});
    };

    const handleEnded = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if(audioState.loopEnabled) {
            audio.currentTime = 0;
            audio.play().then(() => {
                dispatch({ type: "PLAY" });
                dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
            }).catch((error) => {
                console.error("Error playing audio:", error);
                dispatch({ type: "PAUSE" });
            });
        } else {
            handleNext();
        }
    };

    const handleToggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if(audioState.isMuted) {
            const restoreVolume = audioState.volume || 1;
            audio.volume = restoreVolume;
            audio.muted = false;
            dispatch({ type: "UNMUTE" });
            dispatch({ type: "SET_VOLUME", payload: restoreVolume });
        } else {
            previousIndexRef.current = audioState.volume || 1;
            audio.muted = true;
            audio.volume = 0;
            dispatch({ type: "MUTE" });
            dispatch({ type: "SET_VOLUME", payload: 0 });
        }
    };

    const handleToggleLoop = () => {
        dispatch({ type: "TOGGLE_LOOP" });
    };

    const handleToggleShuffle = () => {
        dispatch({ type: "TOGGLE_SHUFFLE" });
    };

    const handleChangePlaybackSpeed = (speed) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.playbackRate = speed;
        dispatch({ type: "SET_PLAYBACK_SPEED", payload: speed });
    };

    const handleSeek = (time) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        dispatch({ type: "SET_CURRENT_TIME", payload: time });
    }
    
    const handleVolumeChange = (volume) => {
        const audio = audioRef.current;
        if (!audio) return;
        if(volume > 0) {
            previousIndexRef.current = volume; };
            dispatch({ type: "SET_VOLUME", payload: volume });
            audio.volume = volume;

            if(volume === 0) {
                audio.muted = true;
                dispatch({ type: "MUTE" });
            } else if(audioState.isMuted) {
                audio.muted = false;
                dispatch({ type: "UNMUTE" });
            }
        };

    return {
        audioRef,
        currentIndex: audioState.currentIndex,
        currentSong: audioState.currentSong,
        isPlaying: audioState.isPlaying,
        isLoading: audioState.isLoading,
        currentTime: audioState.currentTime,
        duration,
        isMuted: audioState.isMuted,
        loopEnabled: audioState.loopEnabled,
        shuffleEnabled: audioState.shuffleEnabled,
        playbackSpeed: audioState.playbackSpeed,
        volume: audioState.volume,
        handleTogglePlay,
        handleNext,
        handlePrevious,
        handleToggleMute,
        handleToggleLoop,
        handleToggleShuffle,
        handleChangePlaybackSpeed,
        handleVolumeChange,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleEnded,
        playSongAtIndex,
        handleSeek,
    }
    };

export default useAudioPlayer;