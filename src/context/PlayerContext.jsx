import React, { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const url = 'http://localhost:4000';


    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);

    const [track, setTrack] = useState(null); // <-- Fix: initialize as null
    const [playerStatus, setPlayerStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const play = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setPlayerStatus(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayerStatus(false);
        }
    };

    const playWithId = (id) => {
        const found = songsData.find(item => item._id === id);
        if (found) {
            setTrack(found);
            setTimeout(() => {
                if (audioRef.current) audioRef.current.play();
            }, 100);
            setPlayerStatus(true);
        }
    };

    const previous = () => {
        const index = songsData.findIndex(item => item._id === track?._id);
        if (index > 0) {
            setTrack(songsData[index - 1]);
            setTimeout(() => {
                if (audioRef.current) audioRef.current.play();
            }, 100);
            setPlayerStatus(true);
        }
    };

    const next = () => {
        const index = songsData.findIndex(item => item._id === track?._id);
        if (index !== -1 && index < songsData.length - 1) {
            setTrack(songsData[index + 1]);
            setTimeout(() => {
                if (audioRef.current) audioRef.current.play();
            }, 100);
            setPlayerStatus(true);
        }
    };

    const seekSong = (e) => {
        if (!audioRef.current || !seekBg.current) return;

        const offset = e.nativeEvent.offsetX;
        const width = seekBg.current.offsetWidth;
        const duration = audioRef.current.duration;

        if (duration) {
            audioRef.current.currentTime = (offset / width) * duration;
        }
    };

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs);
            if (response.data.songs.length > 0) {
                setTrack(response.data.songs[0]);
            }
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        }
    };

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.error("Failed to fetch albums:", error);
        }
    };

    useEffect(() => {
        if (!audioRef.current) return;

        const updateTime = () => {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;

            if (seekBar.current && duration) {
                seekBar.current.style.width = `${Math.floor(currentTime / duration * 100)}%`;
            }

            setTime({
                currentTime: {
                    second: Math.floor(currentTime % 60),
                    minute: Math.floor(currentTime / 60)
                },
                totalTime: {
                    second: Math.floor(duration % 60),
                    minute: Math.floor(duration / 60)
                }
            });
        };

        audioRef.current.ontimeupdate = updateTime;

        return () => {
            audioRef.current.ontimeupdate = null;
        };
    }, [track]);

    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playerStatus, setPlayerStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        songsData,
        albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
