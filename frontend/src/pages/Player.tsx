import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useQueue } from "../context/QueueContext";
import PlayerLayout from "../components/layout/PlayerLayout";
import LyricsDisplay from "../components/player/LyricsDisplay";
import ProgressBar from "../components/player/ProgressBar";
import QueueList from "../components/queue/QueueList";
import { skipToNext } from "../services/queueService";
import { useSettingsStore } from "../stores/useSettingsStore";
import { Song } from "../types/Song";
import SyncedLyricsDisplay from "@/components/player/SyncedLyricsDisplay";
import { Button } from "@/components/ui/button";

const PlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state: playerState, dispatch: playerDispatch } = usePlayer();
  const { state: queueState, dispatch: queueDispatch } = useQueue();
  const settings = useSettingsStore();
  const defaultVocalVolume = useSettingsStore(
    (state) => state.audio.defaultVocalVolume
  );

  const [vocalsMuted, setVocalsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const handleOpenControls = () => {
    navigate("/player/controls");
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      const currentTimeValue = audioElement.currentTime;
      const duration = audioElement.duration;
      if (duration > 0) {
        const calculatedProgress = currentTimeValue / duration;
        console.log("Audio Progress:", calculatedProgress);
        setProgress(calculatedProgress);
        // Convert current time to milliseconds for synced lyrics
        setCurrentTime(currentTimeValue * 1000);
      }
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  const handlePlayPause = () => {
    playerDispatch({ type: "TOGGLE_PLAY_PAUSE" });
  };

  const handleSkipNext = async () => {
    try {
      const response = await skipToNext();

      if (response.data) {
        queueDispatch({ type: "SET_CURRENT_ITEM", payload: response.data });

        if (response.data) {
          playerDispatch({ type: "SET_CURRENT_SONG", payload: response.data });
          playerDispatch({
            type: "SET_DURATION",
            payload: response.data.song.duration,
          });
          playerDispatch({ type: "SET_STATUS", payload: "playing" });
        } else {
          playerDispatch({ type: "SET_CURRENT_SONG", payload: null });
          playerDispatch({ type: "SET_STATUS", payload: "idle" });
        }
      }
    } catch (err) {
      console.error("Failed to skip to next song:", err);
    }
  };

  // Toggle vocals
  const handleToggleVocals = () => {
    if (vocalsMuted) {
      // Restore vocal volume
      playerDispatch({
        type: "SET_VOCAL_VOLUME",
        payload: defaultVocalVolume,
      });
      setVocalsMuted(false);
    } else {
      // Mute vocals
      playerDispatch({ type: "SET_VOCAL_VOLUME", payload: 0 });
      setVocalsMuted(true);
    }
  };

  // Handle seeking (in a real app, this would control the audio element)
  const handleSeek = (time: number) => {
    // For now, just update the current time
    playerDispatch({ type: "SET_CURRENT_TIME", payload: time });
  };

  return (
    <PlayerLayout>
      <Button
        className="p-3 rounded-full bg-accent text-background z-100"
        onClick={handleOpenControls}
        aria-label="Open performance controls"
      >
        <Sliders size={24} />
      </Button>

      {playerState.status === "idle" || !playerState.currentSong ? (
        <div className="flex flex-col gap-4 h-full p-6 relative z-20">
          <div className="text-center mt-8">
            <h1 className="text-4xl font-mono tracking-wide mb-2 text-background">
              OPEN KARAOKE STUDIO
            </h1>
            <p className="text-lg opacity-80 text-background">
              Scan the QR code to add songs to the queue
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-center mb-4 text-orange-peel">
            Up Next
          </h2>

          <div className="max-w-2xl mx-auto w-full rounded-xl overflow-hidden text-background border border-orange-peel">
            <QueueList
              items={queueState.items}
              emptyMessage="No songs in the queue"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full relative z-20">
          <div className="flex-1 flex flex-col items-center justify-center">
            {currentSong &&
              (currentSong.syncedLyrics ? (
                <SyncedLyricsDisplay
                  syncedLyrics={currentSong.syncedLyrics}
                  currentTime={currentTime}
                  className="h-full"
                />
              ) : (
                <LyricsDisplay
                  lyrics={currentSong?.lyrics ?? ""}
                  progress={progress}
                  currentTime={currentTime}
                />
              ))}
          </div>

          {/* Bottom controls */}
          <div
            className="p-4 bg-gradient-to-t from-black to-transparent"
            style={{ zIndex: 30 }}
          >
            {/* Progress bar */}
            {settings.display.showProgress && (
              <ProgressBar onChange={handleSeek} className="mb-4" />
            )}

            {/* Playback controls */}
            <div className="flex justify-center items-center gap-4">
              <button
                className="p-3 rounded-full bg-accent text-background"
                onClick={handleToggleVocals}
                aria-label={vocalsMuted ? "Unmute vocals" : "Mute vocals"}
              >
                {vocalsMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>

              <button
                className="p-4 rounded-full bg-orange-peel text-russet"
                onClick={handlePlayPause}
                aria-label={playerState.status === "playing" ? "Pause" : "Play"}
              >
                {playerState.status === "playing" ? (
                  <Pause size={32} />
                ) : (
                  <Play size={32} style={{ marginLeft: "3px" }} />
                )}
              </button>

              <button
                className="p-3 rounded-full bg-accent text-background"
                onClick={handleSkipNext}
                aria-label="Skip to next song"
              >
                <SkipForward size={24} />
              </button>

              <Button
                className="p-3 rounded-full bg-accent text-background z-100"
                onClick={handleOpenControls}
                aria-label="Open performance controls"
              >
                <Sliders size={24} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </PlayerLayout>
  );
};

export default PlayerPage;
