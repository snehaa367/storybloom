import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck,
  Sparkles,
  BookOpen,
  Clock,
  Type
} from 'lucide-react'
import { soundEngine } from '../utils/sound'
import StoryAtmosphereCanvas from './StoryAtmosphereCanvas'
import StoryMusicController from './StoryMusicController'

export default function BookReaderModal({ 
  story, 
  allStories = [],
  onSelectStory,
  onClose, 
  isBookmarked, 
  onToggleBookmark,
  isAudioOn,
  onToggleAudio 
}) {
  const totalPages = story.pages.length

  // Restore saved reading progress if available
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(`storybloom_progress_${story.id}`)
      const parsed = saved ? parseInt(saved, 10) : 0
      return Number.isFinite(parsed) && parsed >= 0 && parsed < totalPages ? parsed : 0
    } catch {
      return 0
    }
  })

  const [fontSize, setFontSize] = useState(1.05)

  // Story-to-story navigation
  const storyIndex = allStories ? allStories.findIndex((s) => s.id === story.id) : -1
  const hasPrevStory = storyIndex > 0
  const hasNextStory = allStories && storyIndex >= 0 && storyIndex < allStories.length - 1
  const prevStory = hasPrevStory ? allStories[storyIndex - 1] : null
  const nextStory = hasNextStory ? allStories[storyIndex + 1] : null

  const handlePrevStory = useCallback(() => {
    if (hasPrevStory && onSelectStory && prevStory) {
      onSelectStory(prevStory.id)
    }
  }, [hasPrevStory, onSelectStory, prevStory])

  const handleNextStory = useCallback(() => {
    if (hasNextStory && onSelectStory && nextStory) {
      onSelectStory(nextStory.id)
    }
  }, [hasNextStory, onSelectStory, nextStory])

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(isAudioOn)
  const [volume, setVolume] = useState(() => soundEngine.getVolume())
  const [isMuted, setIsMuted] = useState(() => soundEngine.getIsMuted())

  const trackInfo = soundEngine.getStoryConfig(story.id)

  useEffect(() => {
    if (isAudioOn) {
      soundEngine.playStoryMusic(story.id)
    }
    return () => {
      soundEngine.stopStoryMusic()
    }
  }, [story.id, isAudioOn])

  const handleTogglePlayMusic = useCallback(() => {
    if (isMusicPlaying) {
      soundEngine.pauseStoryMusic()
      setIsMusicPlaying(false)
    } else {
      soundEngine.playStoryMusic(story.id)
      setIsMusicPlaying(true)
      if (!isAudioOn && onToggleAudio) {
        onToggleAudio()
      }
    }
  }, [isMusicPlaying, story.id, isAudioOn, onToggleAudio])

  const handleChangeVolume = useCallback((newVol) => {
    setVolume(newVol)
    soundEngine.setVolume(newVol)
    if (isMuted && newVol > 0) {
      setIsMuted(false)
      soundEngine.setMuted(false)
    }
  }, [isMuted])

  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted
    setIsMuted(nextMute)
    soundEngine.setMuted(nextMute)
  }, [isMuted])

  // Persist reading progress
  useEffect(() => {
    try {
      localStorage.setItem(`storybloom_progress_${story.id}`, currentPageIndex.toString())
    } catch {}
  }, [story.id, currentPageIndex])

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      soundEngine.playPageTurn()
      setCurrentPageIndex((prev) => prev + 1)
    }
  }, [currentPageIndex, totalPages])

  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      soundEngine.playPageTurn()
      setCurrentPageIndex((prev) => prev - 1)
    }
  }, [currentPageIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPage, goToPrevPage, onClose])

  const currentPage = story.pages[currentPageIndex] || story.pages[0]

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="reader-backdrop"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="reader-modal tone-night"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Story particle canvas */}
          <StoryAtmosphereCanvas storyId={story.id} />

          {/* Reader toolbar */}
          <div className="reader-toolbar">
            <div className="toolbar-left">
              <span className="reader-story-title">
                <BookOpen size={16} className="reader-icon" />
                <span>{story.title}</span>
              </span>
              <span className="reader-chapter-badge">{story.accentTag}</span>

              {allStories && allStories.length > 0 && (
                <div className="story-nav-buttons-group">
                  <button 
                    onClick={handlePrevStory}
                    disabled={!hasPrevStory}
                    className="story-nav-btn prev-story-btn"
                    title={hasPrevStory ? `Read previous story: ${prevStory.title}` : 'First story in library'}
                    aria-label="Previous Story"
                  >
                    <ChevronLeft size={14} />
                    <span className="story-nav-label">Previous Story</span>
                  </button>

                  <button 
                    onClick={handleNextStory}
                    disabled={!hasNextStory}
                    className="story-nav-btn next-story-btn"
                    title={hasNextStory ? `Read next story: ${nextStory.title}` : 'Last story in library'}
                    aria-label="Next Story"
                  >
                    <span className="story-nav-label">Next Story</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="toolbar-center">
              <StoryMusicController
                isPlaying={isMusicPlaying}
                onTogglePlay={handleTogglePlayMusic}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                volume={volume}
                onChangeVolume={handleChangeVolume}
                trackInfo={trackInfo}
              />
            </div>

            <div className="toolbar-right">
              <div className="font-size-group" title="Adjust text size">
                <button 
                  onClick={() => setFontSize((f) => Math.max(0.9, f - 0.1))} 
                  className="toolbar-btn"
                  aria-label="Decrease font size"
                >
                  <Type size={13} /> -
                </button>
                <span className="font-size-label">{Math.round(fontSize * 100)}%</span>
                <button 
                  onClick={() => setFontSize((f) => Math.min(1.35, f + 0.1))} 
                  className="toolbar-btn"
                  aria-label="Increase font size"
                >
                  <Type size={16} /> +
                </button>
              </div>

              <button 
                onClick={onToggleBookmark}
                className={`toolbar-btn ${isBookmarked ? 'bookmarked-active' : ''}`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                <span className="hide-on-mobile">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button 
                onClick={onClose}
                className="toolbar-close-btn"
                aria-label="Close storybook"
                title="Close book (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Book spread */}
          <div className="book-spread-container">
            <div className="book-spine-crease" aria-hidden="true" />

            {/* Left page: Illustration & quote */}
            <div className="book-page book-page-left">
              <div className="page-header">
                <span className="page-folio">Chapter {currentPageIndex + 1}</span>
                <span className="page-story-subtitle">{story.subtitle}</span>
              </div>

              {story.coverImage && (
                <div className="reader-illustration-frame">
                  <img 
                    src={story.coverImage} 
                    alt={story.title} 
                    className="reader-illustration-img"
                  />
                  <div className="illustration-caption">
                    <Sparkles size={12} />
                    <span>Watercolor illustration from the archives of Elderglen</span>
                  </div>
                </div>
              )}

              <blockquote className="reader-page-quote">
                "{story.quote}"
              </blockquote>

              <div className="page-footer">
                <span className="story-collection-badge">
                  {storyIndex >= 0 ? `Story ${storyIndex + 1} of ${allStories.length}` : 'Storybloom Tales'}
                </span>
                <span className="reading-time-est">
                  <Clock size={12} /> {story.readTime}
                </span>
              </div>
            </div>

            {/* Right page: Prose & navigation */}
            <div className="book-page book-page-right">
              <div className="page-header">
                <span className="page-section-heading">{currentPage.heading}</span>
                <span className="page-number-display">{currentPageIndex + 1} of {totalPages}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${story.id}-${currentPageIndex}`}
                  initial={{ opacity: 0, x: 18, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -18, filter: 'blur(2px)' }}
                  transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
                  className="prose-content"
                  style={{ fontSize: `${fontSize}rem` }}
                >
                  {currentPage.paragraphs.map((paragraph, idx) => {
                    const isFirst = idx === 0 && currentPageIndex === 0
                    return (
                      <p 
                        key={idx} 
                        className={`reader-paragraph ${isFirst ? 'has-drop-cap' : ''}`}
                      >
                        {paragraph}
                      </p>
                    )
                  })}
                </motion.div>
              </AnimatePresence>

              <div className="page-footer right-footer">
                <div className="page-progress-bar">
                  <div 
                    className="page-progress-fill" 
                    style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
                  />
                </div>

                <div className="reader-nav-actions">
                  <button 
                    onClick={goToPrevPage}
                    disabled={currentPageIndex === 0}
                    className="page-turn-btn"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span className="page-indicator">
                    {currentPageIndex + 1} / {totalPages}
                  </span>

                  {currentPageIndex === totalPages - 1 && hasNextStory ? (
                    <button 
                      onClick={handleNextStory}
                      className="page-turn-btn next-story-turn-btn"
                      aria-label={`Begin Next Story: ${nextStory.title}`}
                      title={`Begin Next Story: ${nextStory.title}`}
                    >
                      <span>Next Story</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={goToNextPage}
                      disabled={currentPageIndex === totalPages - 1}
                      className="page-turn-btn next-btn"
                      aria-label="Next page"
                    >
                      <span>{currentPageIndex === totalPages - 1 ? 'End of Chapter' : 'Next'}</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
