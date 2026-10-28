import { motion, AnimatePresence } from 'framer-motion'
import { X, Bookmark, Clock, Trash2, ArrowRight } from 'lucide-react'
import { STORIES_DATA } from '../data/stories'

export default function BookmarkDrawer({ 
  isOpen, 
  onClose, 
  bookmarkedIds, 
  onRemoveBookmark, 
  onOpenStory 
}) {
  const bookmarkedStories = STORIES_DATA.filter((story) => bookmarkedIds.includes(story.id))

  const totalReadingTime = bookmarkedStories.reduce((acc, story) => {
    const mins = parseInt(story.readTime, 10) || 5
    return acc + mins
  }, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drawer-backdrop"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="bookmark-drawer"
            aria-label="Saved Bookmarks Drawer"
          >
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-title-group">
                <Bookmark className="drawer-icon" size={18} />
                <h3>Saved Story Ribbons</h3>
                <span className="drawer-count-badge">{bookmarkedStories.length}</span>
              </div>
              <button onClick={onClose} className="drawer-close-btn" aria-label="Close bookmarks shelf">
                <X size={18} />
              </button>
            </div>

            {/* Reading stats */}
            {bookmarkedStories.length > 0 && (
              <div className="drawer-stats-bar">
                <div className="stat-unit">
                  <span className="stat-label">Bookmarked Tales</span>
                  <span className="stat-val">{bookmarkedStories.length}</span>
                </div>
                <div className="stat-separator" />
                <div className="stat-unit">
                  <span className="stat-label">Reading Journey</span>
                  <span className="stat-val">{totalReadingTime} mins</span>
                </div>
              </div>
            )}

            {/* Story cards list or empty state */}
            <div className="drawer-content">
              {bookmarkedStories.length === 0 ? (
                <div className="drawer-empty-state">
                  <div className="empty-icon-wrap">
                    <Bookmark size={28} />
                  </div>
                  <h4>No Ribbons Tucked Away</h4>
                  <p>
                    Whenever a fairy-tale speaks to your heart, tap the bookmark ribbon to save it here for a tranquil evening read.
                  </p>
                </div>
              ) : (
                <div className="drawer-cards-list">
                  {bookmarkedStories.map((story) => (
                    <div key={story.id} className="drawer-story-card">
                      <div className="drawer-card-thumb">
                        <img src={story.coverImage} alt={story.title} />
                      </div>
                      <div className="drawer-card-details">
                        <span className="drawer-card-tag">{story.accentTag}</span>
                        <h4 className="drawer-card-title">{story.title}</h4>
                        <span className="drawer-card-time">
                          <Clock size={12} /> {story.readTime}
                        </span>

                        <div className="drawer-card-actions">
                          <button 
                            onClick={() => {
                              onOpenStory(story.id)
                              onClose()
                            }}
                            className="drawer-read-btn"
                          >
                            <span>Read</span>
                            <ArrowRight size={13} />
                          </button>
                          <button 
                            onClick={() => onRemoveBookmark(story.id)}
                            className="drawer-remove-btn"
                            title="Remove from bookmarks"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <p>Stored safely in your browser’s local garden.</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
