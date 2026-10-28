import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Feather, 
  Search, 
  Volume2, 
  VolumeX, 
  Clock, 
  Leaf, 
  Wand2, 
  ArrowRight 
} from 'lucide-react'
import { STORIES_DATA } from './data/stories'
import { soundEngine } from './utils/sound'
import FireflyCanvas from './components/FireflyCanvas'
import BookReaderModal from './components/BookReaderModal'
import StoryOracleModal from './components/StoryOracleModal'
import BookmarkDrawer from './components/BookmarkDrawer'
import './App.css'

const CATEGORIES = ['All', 'Wonder', 'Calm', 'Fantasy', 'Courage', 'Adventure', 'Hope']

export default function App() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('storybloom_bookmarks')
      return saved ? JSON.parse(saved) : ['whispering-willow']
    } catch {
      return ['whispering-willow']
    }
  })

  const [isAudioOn, setIsAudioOn] = useState(false)
  const [showFireflies, setShowFireflies] = useState(true)
  const [activeStoryId, setActiveStoryId] = useState(null)
  const [isOracleOpen, setIsOracleOpen] = useState(false)
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    try {
      localStorage.setItem('storybloom_bookmarks', JSON.stringify(bookmarks))
    } catch {}
  }, [bookmarks])

  const toggleBookmark = (id) => {
    soundEngine.playChime(660)
    setBookmarks((prev) => 
      prev.includes(id) ? prev.filter((storyId) => storyId !== id) : [...prev, id]
    )
  }

  const handleToggleAudio = () => {
    if (activeStoryId) {
      setIsAudioOn((prev) => !prev)
    } else {
      const isPlaying = soundEngine.toggleAtmosphere()
      setIsAudioOn(isPlaying)
    }
  }

  const handleOpenReader = (id) => {
    soundEngine.playChime(528)
    if (isAudioOn) {
      soundEngine.stopAtmosphere()
    }
    setActiveStoryId(id)
  }

  const handleCloseReader = () => {
    soundEngine.stopStoryMusic()
    setActiveStoryId(null)
    if (isAudioOn) {
      soundEngine.startAtmosphere()
    }
  }

  const filteredStories = STORIES_DATA.filter((story) => {
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = 
      !q ||
      story.title.toLowerCase().includes(q) ||
      story.excerpt.toLowerCase().includes(q) ||
      story.accentTag.toLowerCase().includes(q) ||
      story.category.toLowerCase().includes(q) ||
      story.mood.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  const activeStory = STORIES_DATA.find((s) => s.id === activeStoryId)

  return (
    <div className="storybook-root site-wrapper">
      <div className="storybook-watermark" aria-hidden="true" />
      <FireflyCanvas active={showFireflies} count={28} />

      {/* Navigation header */}
      <header className="storybook-header">
        <div className="container header-inner">
          <div className="brand-wrapper" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="brand-title">Storybloom</span>
            <span className="brand-tagline-badge">Where Every Story Blooms Into Magic</span>
          </div>

          <div className="header-actions-right">
            <button 
              onClick={handleToggleAudio}
              className={`header-tool-btn ${isAudioOn ? 'active' : ''}`}
              title={isAudioOn ? 'Mute background ambience' : 'Play soothing wind chimes'}
              aria-label={isAudioOn ? 'Mute ambience' : 'Play ambience'}
            >
              {isAudioOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hide-on-mobile">{isAudioOn ? 'Chimes' : 'Muted'}</span>
            </button>

            <button 
              onClick={() => setShowFireflies((prev) => !prev)}
              className={`header-tool-btn ${showFireflies ? 'active' : ''}`}
              title="Toggle glowing fireflies"
              aria-label="Toggle fireflies"
            >
              <Sparkles size={14} />
              <span className="hide-on-mobile">Stardust</span>
            </button>

            <button 
              onClick={() => setIsOracleOpen(true)}
              className="header-tool-btn"
              title="Consult the Magic Quill"
            >
              <Feather size={14} />
              <span className="hide-on-mobile">Oracle</span>
            </button>

            <button 
              onClick={() => setIsBookmarksOpen(true)}
              className="header-tool-btn"
              title="Open Saved Story Ribbons"
            >
              <Bookmark size={14} />
              <span className="hide-on-mobile">Ribbons</span>
              <span className="header-bookmark-badge">{bookmarks.length}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="site-main">
        {/* Hero section */}
        <section className="container hero-prologue">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="prologue-ornament">
              <Leaf size={14} className="ornament-leaf" />
              <span>An Enchanted Sanctuary of Tales</span>
              <Leaf size={14} className="ornament-leaf" />
            </div>

            <h1 className="hero-heading">
              Where Gentle Words & <span className="hero-heading-emphasis">Illustrated Wonder</span> Bloom
            </h1>

            <p className="hero-description">
              Unfold calming stories adorned with warm watercolor paintings, tactile paper textures, 
              and comforting prose written to lull the busy mind into tranquil sleep.
            </p>

            <div className="hero-cta-group">
              <button 
                onClick={() => handleOpenReader('whispering-willow')}
                className="btn-storybook btn-primary"
              >
                <BookOpen size={16} />
                <span>Begin Reading Chapter I</span>
              </button>

              <button 
                onClick={() => setIsOracleOpen(true)}
                className="btn-storybook btn-secondary"
              >
                <Wand2 size={16} />
                <span>Draw a Tale for Tonight</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Section divider */}
        <div className="container">
          <div className="storybook-divider" role="presentation">
            <Sparkles size={15} style={{ color: 'var(--color-amber)' }} />
          </div>
        </div>

        {/* Search and filters */}
        <section className="container">
          <div className="filter-search-container">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input 
                type="text"
                placeholder="Search stories, lore, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="story-search-input"
                aria-label="Search stories"
              />
            </div>

            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Story library grid */}
        <section className="container" aria-label="Curated Story Collection">
          <div className="section-header">
            <div>
              <span className="section-label">Illustrated Tales</span>
              <h2 className="section-title">The Storybloom Library</h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Showing {filteredStories.length} {filteredStories.length === 1 ? 'tale' : 'tales'}
            </span>
          </div>

          <div className="story-grid">
            {filteredStories.map((story, index) => {
              const isBookmarked = bookmarks.includes(story.id)
              const tagClass = `tag-${story.theme || 'lavender'}`

              return (
                <motion.article 
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="story-card-illustrated"
                >
                  <div 
                    className="story-cover-wrapper" 
                    onClick={() => handleOpenReader(story.id)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      className="story-cover-img"
                      loading="lazy"
                    />
                    <div className="cover-tag-overlay">
                      <span className={`story-tag ${tagClass}`}>
                        {story.accentTag}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(story.id)
                      }}
                      className={`cover-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                      title={isBookmarked ? 'Remove ribbon' : 'Tuck bookmark ribbon'}
                      aria-label="Bookmark story"
                    >
                      {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <div className="story-body">
                    <h3 
                      className="story-title" 
                      onClick={() => handleOpenReader(story.id)} 
                      style={{ cursor: 'pointer' }}
                    >
                      {story.title}
                    </h3>
                    <span className="story-subtitle">{story.subtitle}</span>
                    <p className="story-excerpt">
                      "{story.excerpt}"
                    </p>

                    <div className="story-footer-meta">
                      <div className="meta-info-left">
                        <span className="meta-pill">
                          <Clock size={13} />
                          <span>{story.readTime}</span>
                        </span>
                        <span className="meta-pill">
                          <Leaf size={13} style={{ color: 'var(--color-sage)' }} />
                          <span>{story.mood.split('&')[0]}</span>
                        </span>
                      </div>

                      <button 
                        onClick={() => handleOpenReader(story.id)}
                        className="btn-read-chapter"
                      >
                        <span>Read Book</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="storybook-footer">
        <div className="container footer-inner">
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
            <Sparkles size={16} style={{ color: 'var(--color-amber)' }} />
            <span>Storybloom — Where Every Story Blooms Into Magic</span>
          </div>
          <p style={{ margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
            A soothing, illuminated digital sanctuary for bedtime readers and dreamers. 
            Crafted with gentle watercolor illustrations, tactile vellum aesthetics, and comforting ambient chimes.
          </p>
        </div>
      </footer>

      {/* Reader modal */}
      {activeStory && (
        <BookReaderModal 
          key={activeStory.id}
          story={activeStory}
          allStories={STORIES_DATA}
          onSelectStory={handleOpenReader}
          onClose={handleCloseReader}
          isBookmarked={bookmarks.includes(activeStory.id)}
          onToggleBookmark={() => toggleBookmark(activeStory.id)}
          isAudioOn={isAudioOn}
          onToggleAudio={handleToggleAudio}
        />
      )}

      {/* Oracle modal */}
      {isOracleOpen && (
        <StoryOracleModal 
          onClose={() => setIsOracleOpen(false)}
          onSelectStory={(id) => handleOpenReader(id)}
        />
      )}

      {/* Bookmarks drawer */}
      <BookmarkDrawer 
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedIds={bookmarks}
        onRemoveBookmark={(id) => toggleBookmark(id)}
        onOpenStory={(id) => handleOpenReader(id)}
      />
    </div>
  )
}
