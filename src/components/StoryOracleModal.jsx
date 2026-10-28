import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Star, 
  Compass, 
  Moon, 
  Flame, 
  Sun, 
  Heart 
} from 'lucide-react'
import { ORACLE_EXCERPTS, STORIES_DATA, MOOD_STORY_MAPPINGS } from '../data/stories'
import { soundEngine } from '../utils/sound'

const MOOD_DIRECTIONS = {
  'Soothing Rest': {
    displayTitle: 'A Little Calm',
    descriptor: 'Lavender flowers, crescent moon & soft mist',
    image: '/oracle/calm.jpg',
    theme: 'calm',
    accentColor: '#B9A0FF',
    accentBorder: 'rgba(185, 160, 255, 0.35)',
    surfaceBg: '#211A35',
    tag: 'Calm Sanctuary',
    icon: Moon
  },
  'Gentle Courage': {
    displayTitle: 'A Little Courage',
    descriptor: 'Glowing lantern, warm golden light & botanical greenery',
    image: '/oracle/courage.jpg',
    theme: 'courage',
    accentColor: '#D6C9FF',
    accentBorder: 'rgba(214, 201, 255, 0.35)',
    surfaceBg: '#211A35',
    tag: 'Inner Strength',
    icon: Flame
  },
  'Wanderlust': {
    displayTitle: 'A Little Wonder',
    descriptor: 'Starry sky, tiny sailing boat & dreamy blue horizon',
    image: '/oracle/wonder.jpg',
    theme: 'wonder',
    accentColor: '#A78BFA',
    accentBorder: 'rgba(167, 139, 250, 0.35)',
    surfaceBg: '#211A35',
    tag: 'Celestial Journey',
    icon: Compass
  },
  'Inner Peace': {
    displayTitle: 'A Little Hope',
    descriptor: 'Blooming wildflowers, soft sunrise & warm muted gold',
    image: '/oracle/hope.jpg',
    theme: 'hope',
    accentColor: '#8876B5',
    accentBorder: 'rgba(136, 118, 181, 0.35)',
    surfaceBg: '#211A35',
    tag: 'Gentle Dawn',
    icon: Sun
  }
}

export default function StoryOracleModal({ onClose, onSelectStory }) {
  const [selectedMood, setSelectedMood] = useState(ORACLE_EXCERPTS[0].mood)
  const [activeStoryId, setActiveStoryId] = useState(ORACLE_EXCERPTS[0].storyId)
  const [isRevealing, setIsRevealing] = useState(false)
  const modalRef = useRef(null)
  const cardsContainerRef = useRef(null)

  const activeExcerpt = ORACLE_EXCERPTS.find((e) => e.mood === selectedMood) || ORACLE_EXCERPTS[0]
  const currentStoryId = activeStoryId || activeExcerpt.storyId
  const recommendedStory = STORIES_DATA.find((s) => s.id === currentStoryId) || STORIES_DATA[0]
  const activeMoodMeta = MOOD_DIRECTIONS[selectedMood] || {
    displayTitle: selectedMood,
    descriptor: 'A calming tale attuned to your feelings',
    image: recommendedStory?.coverImage || '/oracle/calm.jpg',
    accentColor: '#B9A0FF',
    accentBorder: 'rgba(185, 160, 255, 0.35)',
    surfaceBg: '#211A35',
    tag: 'Heart Whisper',
    icon: Heart
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSelectMood = (mood) => {
    if (mood === selectedMood && !isRevealing) return
    soundEngine.playChime(660)
    setIsRevealing(true)
    setSelectedMood(mood)
    const primaryId = ORACLE_EXCERPTS.find((e) => e.mood === mood)?.storyId || MOOD_STORY_MAPPINGS?.[mood]?.[0]
    setActiveStoryId(primaryId)
    setTimeout(() => setIsRevealing(false), 380)
  }

  const handleRandomDraw = () => {
    soundEngine.playChime(528)
    setIsRevealing(true)
    const pool = MOOD_STORY_MAPPINGS?.[selectedMood] || []
    const otherStoriesInMood = pool.filter((id) => id !== currentStoryId)

    if (otherStoriesInMood.length > 0 && Math.random() > 0.45) {
      const nextStoryId = otherStoriesInMood[Math.floor(Math.random() * otherStoriesInMood.length)]
      setActiveStoryId(nextStoryId)
    } else {
      const otherMoods = ORACLE_EXCERPTS.filter((e) => e.mood !== selectedMood)
      const random = otherMoods[Math.floor(Math.random() * otherMoods.length)]
      setSelectedMood(random.mood)
      const moodPool = MOOD_STORY_MAPPINGS?.[random.mood] || [random.storyId]
      const nextStoryId = moodPool[Math.floor(Math.random() * moodPool.length)]
      setActiveStoryId(nextStoryId)
    }
    setTimeout(() => setIsRevealing(false), 380)
  }

  const handleChooseAnotherMood = () => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      const firstBtn = cardsContainerRef.current.querySelector('button')
      if (firstBtn) firstBtn.focus()
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        className="oracle-backdrop"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="oracle-main-heading"
        aria-describedby="oracle-supporting-text"
      >
        <motion.div 
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="oracle-card oracle-storybook-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Corner ornaments */}
          <div className="oracle-corner-ornament top-left" aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path d="M2 40C2 19 19 2 40 2" stroke="var(--color-amber)" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
              <path d="M7 40C7 21.8 21.8 7 40 7" stroke="var(--color-amber)" strokeWidth="0.8" strokeOpacity="0.25" />
              <circle cx="2" cy="40" r="1.5" fill="var(--color-amber)" opacity="0.6" />
              <circle cx="40" cy="2" r="1.5" fill="var(--color-amber)" opacity="0.6" />
              <path d="M12 12C16 8 20 8 24 12C28 16 28 20 24 24C20 28 16 28 12 24C8 20 8 16 12 12Z" fill="var(--color-amber)" opacity="0.08" />
            </svg>
          </div>
          <div className="oracle-corner-ornament top-right" aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path d="M40 40C40 19 23 2 2 2" stroke="var(--color-amber)" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="2 3" />
              <path d="M35 40C35 21.8 20.2 7 2 7" stroke="var(--color-amber)" strokeWidth="0.8" strokeOpacity="0.25" />
              <circle cx="40" cy="40" r="1.5" fill="var(--color-amber)" opacity="0.6" />
              <circle cx="2" cy="2" r="1.5" fill="var(--color-amber)" opacity="0.6" />
            </svg>
          </div>

          {/* Close button */}
          <button 
            onClick={onClose} 
            className="oracle-close-btn" 
            aria-label="Close Story Oracle"
            title="Return to the Library (Esc)"
          >
            <X size={18} />
          </button>

          {/* Intro header */}
          <div className="oracle-intro-header">
            <div className="oracle-eyebrow">
              <span className="eyebrow-sparkle">✦</span>
              <span className="eyebrow-text">A MOMENT JUST FOR YOU</span>
              <span className="eyebrow-sparkle">✦</span>
            </div>

            <div className="oracle-heading-cluster">
              <div className="oracle-heading-flourish left" aria-hidden="true">
                <svg width="48" height="18" viewBox="0 0 48 18" fill="none">
                  <path d="M48 9C34 9 26 2 12 2C6 2 2 6 2 9C2 12 6 16 12 16C26 16 34 9 48 9Z" stroke="var(--color-amber)" strokeWidth="1" strokeOpacity="0.38" />
                  <circle cx="4" cy="9" r="2" fill="var(--color-amber)" opacity="0.6" />
                </svg>
              </div>

              <h2 id="oracle-main-heading" className="oracle-heading">
                Let the story find you
              </h2>

              <div className="oracle-heading-flourish right" aria-hidden="true">
                <svg width="48" height="18" viewBox="0 0 48 18" fill="none">
                  <path d="M0 9C14 9 22 2 36 2C42 2 46 6 46 9C46 12 42 16 36 16C22 16 14 9 0 9Z" stroke="var(--color-amber)" strokeWidth="1" strokeOpacity="0.38" />
                  <circle cx="44" cy="9" r="2" fill="var(--color-amber)" opacity="0.6" />
                </svg>
              </div>
            </div>

            <p id="oracle-supporting-text" className="oracle-supporting-text">
              Every feeling has a story waiting for it.
            </p>
          </div>

          {/* Prompt */}
          <div className="oracle-mood-prompt">
            <div className="prompt-ribbon">
              <Sparkles size={14} className="prompt-icon" />
              <span className="prompt-question">What does your heart need today?</span>
              <Sparkles size={14} className="prompt-icon" />
            </div>
          </div>

          {/* Mood selection cards */}
          <div 
            ref={cardsContainerRef}
            className="oracle-mood-cards-grid"
            role="radiogroup"
            aria-label="Choose what your heart needs today"
          >
            {ORACLE_EXCERPTS.map((item) => {
              const meta = MOOD_DIRECTIONS[item.mood] || {
                displayTitle: item.mood,
                descriptor: item.text,
                image: '/oracle/calm.jpg',
                theme: 'calm',
                accentColor: '#B27B2B',
                surfaceBg: 'var(--color-amber-surface)',
                icon: Heart
              }
              const isSelected = selectedMood === item.mood
              const MoodIcon = meta.icon || Sparkles

              return (
                <button
                  key={item.mood}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${meta.displayTitle} (${item.mood}): ${meta.descriptor}`}
                  onClick={() => handleSelectMood(item.mood)}
                  className={`oracle-mood-card mood-${meta.theme} ${isSelected ? 'selected' : ''}`}
                  style={{
                    '--card-accent': meta.accentColor,
                    '--card-surface': meta.surfaceBg
                  }}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="oracle-active-star"
                      className="mood-card-selected-badge"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Star size={11} fill="currentColor" />
                      <span>Chosen</span>
                    </motion.div>
                  )}

                  <div className="mood-card-artwork">
                    <img 
                      src={meta.image} 
                      alt="" 
                      aria-hidden="true" 
                      className="mood-card-img" 
                      loading="lazy"
                    />
                    <div className="mood-card-glow-overlay" />
                    <div className="mood-card-icon-pill">
                      <MoodIcon size={13} />
                    </div>
                  </div>

                  <div className="mood-card-body">
                    <div className="mood-card-header-row">
                      <h3 className="mood-card-title">{meta.displayTitle}</h3>
                      <span className="mood-card-original-tag">{item.mood}</span>
                    </div>
                    <p className="mood-card-description">{meta.descriptor}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Reveal animation */}
          <AnimatePresence mode="wait">
            {isRevealing && (
              <motion.div 
                className="oracle-reveal-stardust"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              >
                <span className="stardust-sparkle s1">✦</span>
                <span className="stardust-sparkle s2">✧</span>
                <span className="stardust-sparkle s3">✦</span>
                <span className="stardust-sparkle s4">✧</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommended story reveal panel */}
          <motion.div 
            key={selectedMood}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className={`oracle-reveal-paper-panel panel-${activeMoodMeta.theme}`}
          >
            <div className="reveal-panel-header">
              <div className="reveal-panel-eyebrow">
                <span className="reveal-gold-star">✦</span>
                <span className="reveal-eyebrow-text">YOUR STORY AWAITS</span>
                <span className="reveal-gold-star">✦</span>
              </div>
              <div className="reveal-resonance-badge">
                <Sparkles size={12} />
                <span>Resonating with {activeMoodMeta.displayTitle}</span>
              </div>
            </div>

            <div className="reveal-content-split">
              <div className="reveal-cover-frame">
                <div className="reveal-image-wrapper">
                  <img 
                    src={recommendedStory.coverImage} 
                    alt={`Book cover of ${recommendedStory.title}`}
                    className="reveal-cover-img"
                  />
                  <div className="reveal-cover-sheen" />
                  <span className="reveal-theme-tag">
                    {recommendedStory.accentTag || activeExcerpt.tag}
                  </span>
                </div>
              </div>

              <div className="reveal-story-details">
                <div className="reveal-meta-row">
                  <span className="reveal-meta-pill">
                    <Clock size={12} />
                    <span>{recommendedStory.readTime}</span>
                  </span>
                  <span className="reveal-meta-pill category">
                    <span>{recommendedStory.category}</span>
                  </span>
                  <span className="reveal-meta-pill mood-theme">
                    <span>{recommendedStory.mood}</span>
                  </span>
                </div>

                <h3 className="reveal-story-title">
                  {recommendedStory.title}
                </h3>

                <span className="reveal-story-subtitle">
                  {recommendedStory.subtitle}
                </span>

                <blockquote className="reveal-oracle-quote">
                  <span className="quote-mark open">“</span>
                  {recommendedStory.quote || activeExcerpt.text}
                  <span className="quote-mark close">”</span>
                </blockquote>

                {recommendedStory.excerpt && (
                  <p className="reveal-story-excerpt">
                    {recommendedStory.excerpt}
                  </p>
                )}

                <div className="reveal-actions-group">
                  <button 
                    onClick={() => {
                      soundEngine.playChime(784)
                      onSelectStory(recommendedStory.id)
                      onClose()
                    }} 
                    className="oracle-action-btn primary"
                    aria-label={`Open recommended story: ${recommendedStory.title}`}
                  >
                    <BookOpen size={16} />
                    <span>Open This Story</span>
                    <ArrowRight size={14} className="action-arrow" />
                  </button>

                  <button 
                    onClick={handleChooseAnotherMood} 
                    className="oracle-action-btn secondary"
                    aria-label="Choose another mood from the cards above"
                  >
                    <Sparkles size={14} />
                    <span>Choose Another Mood</span>
                  </button>

                  <button 
                    onClick={handleRandomDraw} 
                    className="oracle-action-btn tertiary"
                    title="Let destiny whisper a surprise tale"
                    aria-label="Whisper another tale at random"
                  >
                    <RefreshCw size={13} />
                    <span>Whisper Another</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
