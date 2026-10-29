import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearSearch,
  clearSearchResults,
  fetchBrands,
  setPartNumber,
} from '../store/partsSlice'
import {
  MIN_ARTICLE_LENGTH,
  extractArticleNumber,
  isArticleSearchQuery,
} from '../utils/articleQuery'
import AppSpinner from './AppSpinner'
import SearchSuggestions from './SearchSuggestions'

const DEBOUNCE_MS = 700

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 16l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function PartNumberSearch({ compact = false }) {
  const dispatch = useDispatch()
  const partNumber = useSelector((state) => state.parts.partNumber)
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const timerRef = useRef(null)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const [suggestOpen, setSuggestOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setSuggestOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const runSearch = (value) => {
    const article = extractArticleNumber(value)
    if (!article) {
      dispatch(clearSearchResults())
      setSuggestOpen(false)
      return
    }
    setSuggestOpen(true)
    dispatch(fetchBrands(article))
  }

  const scheduleSearch = (value) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const article = extractArticleNumber(value)
    if (!article) {
      dispatch(clearSearchResults())
      setSuggestOpen(false)
      return
    }

    setSuggestOpen(true)
    timerRef.current = setTimeout(() => {
      dispatch(fetchBrands(article))
    }, DEBOUNCE_MS)
  }

  const handleChange = (event) => {
    const value = event.target.value
    dispatch(setPartNumber(value))
    scheduleSearch(value)
  }

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    dispatch(clearSearch())
    setSuggestOpen(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    runSearch(partNumber)
  }

  const handleFocus = () => {
    if (isArticleSearchQuery(partNumber)) {
      setSuggestOpen(true)
    }
  }

  const showClear = partNumber.length > 0
  const isLoading = brandsStatus === 'loading'
  const showSuggestions = suggestOpen && isArticleSearchQuery(partNumber)

  const fieldClass = compact
    ? 'search-bar__field'
    : 'search-bar__field search-bar__field--lg'

  return (
    <div
      className={`search-bar-wrap${compact ? '' : ' mb-0'}`}
      ref={wrapRef}
    >
      {!compact && (
        <label htmlFor="partNumber" className="form-label fw-semibold">
          Артикул (номер детали)
        </label>
      )}

      <form
        className={`search-bar${compact ? ' w-100' : ''}`}
        onSubmit={handleSubmit}
      >
        <label htmlFor="partNumber" className="visually-hidden">
          Поиск по артикулу
        </label>
        <div className={fieldClass}>
          <input
            ref={inputRef}
            id="partNumber"
            type="text"
            className="search-bar__input"
            placeholder={compact ? 'Артикул детали' : 'Например, 01089'}
            value={partNumber}
            onChange={handleChange}
            onFocus={handleFocus}
            autoComplete="off"
            spellCheck={false}
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
          />
          {showClear && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={handleClear}
              aria-label="Очистить"
              title="Очистить"
            >
              ×
            </button>
          )}
          <button
            type="submit"
            className="search-bar__submit"
            aria-label="Найти по артикулу"
            disabled={isLoading}
          >
            {isLoading ? (
              <AppSpinner size="sm" variant="light" label="Поиск" />
            ) : compact ? (
              <SearchIcon />
            ) : (
              'Найти'
            )}
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div id="search-suggestions">
          <SearchSuggestions
            query={partNumber}
            onSelect={() => setSuggestOpen(false)}
          />
        </div>
      )}

      {!compact && (
        <div className="form-text">
          Поиск только по артикулу (от {MIN_ARTICLE_LENGTH} символов, с цифрой).
        </div>
      )}
    </div>
  )
}
