import { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Music
} from 'lucide-react'

export default function StoryMusicController({
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
  trackInfo
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showTrackDetails, setShowTrackDetails] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowVolumeSlider(false)
        setShowTrackDetails(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const volumePercent = Math.round((isMuted ? 0 : volume) * 100)

  return (
    <div className="story-music-controller" ref={containerRef}>
      {/* Play / Pause toggle */}
      <button
        onClick={onTogglePlay}
        className={`music-ctrl-btn ${isPlaying ? 'is-playing' : ''}`}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        title={isPlaying ? 'Pause background music' : 'Play background music'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        
        {/* Animated equalizer bars */}
        <div className={`music-eq-bars ${isPlaying && !isMuted ? 'animating' : ''}`} aria-hidden="true">
          <span className="eq-bar bar-1" />
          <span className="eq-bar bar-2" />
          <span className="eq-bar bar-3" />
        </div>
      </button>

      {/* Track indicator pill */}
      <button
        onClick={() => setShowTrackDetails((prev) => !prev)}
        className="music-track-indicator"
        title="Click to view soundscape details"
        aria-label={`Current music: ${trackInfo?.title || 'Story Soundscape'}`}
      >
        <Music size={12} className="music-note-icon" />
        <span className="track-title-text">
          {trackInfo?.title || 'Story Soundscape'}
        </span>
      </button>

      {/* Volume / mute controls */}
      <div className="music-volume-wrapper">
        <button
          onClick={onToggleMute}
          onMouseEnter={() => setShowVolumeSlider(true)}
          className={`music-ctrl-btn ${isMuted ? 'is-muted' : ''}`}
          aria-label={isMuted ? 'Unmute story music' : 'Mute story music'}
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={14} />
          ) : volume < 0.5 ? (
            <Volume1 size={14} />
          ) : (
            <Volume2 size={14} />
          )}
        </button>

        {showVolumeSlider && (
          <div 
            className="volume-slider-popover"
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <div className="slider-label-row">
              <span className="slider-label">Volume</span>
              <span className="slider-percent">{volumePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="story-volume-range"
              aria-label="Adjust story music volume"
            />
          </div>
        )}
      </div>

      {/* Track details popover */}
      {showTrackDetails && (
        <div className="track-details-popover">
          <div className="track-details-header">
            <span className="track-badge-mood">{trackInfo?.mood || 'Soothing'}</span>
            <button 
              onClick={() => setShowTrackDetails(false)} 
              className="track-close-btn"
              aria-label="Close track details"
            >
              ×
            </button>
          </div>
          <h4 className="track-modal-title">{trackInfo?.title}</h4>
          <p className="track-modal-desc">{trackInfo?.description}</p>
        </div>
      )}
    </div>
  )
}
