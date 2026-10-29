import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOffers,
  selectManufacturer,
} from '../store/partsSlice'
import AppSpinner from './AppSpinner'
import { extractArticleNumber } from '../utils/articleQuery'

function HighlightQuery({ text, query }) {
  const source = text || ''
  const trimmed = query.trim()
  if (!trimmed) {
    return source
  }

  const lowerSource = source.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  const parts = []
  let start = 0
  let index = lowerSource.indexOf(lowerQuery, start)

  while (index !== -1) {
    if (index > start) {
      parts.push(source.slice(start, index))
    }
    parts.push(
      <strong key={`${index}-${trimmed}`}>{source.slice(index, index + trimmed.length)}</strong>,
    )
    start = index + trimmed.length
    index = lowerSource.indexOf(lowerQuery, start)
  }

  if (start < source.length) {
    parts.push(source.slice(start))
  }

  return parts.length ? parts : source
}

function PartThumbnail() {
  return (
    <span className="search-suggest__thumb" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7.5 6 4h12l2 3.5v9H4v-9Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M4 11h16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  )
}

export default function SearchSuggestions({ query, onSelect }) {
  const dispatch = useDispatch()
  const articleNumber = useSelector((state) => state.parts.articleNumber)
  const brands = useSelector((state) => state.parts.brands)
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const brandsError = useSelector((state) => state.parts.brandsError)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)

  const trimmedQuery = query.trim()
  const searchArticle = extractArticleNumber(query)
  const highlightQuery = articleNumber || searchArticle || trimmedQuery

  if (!searchArticle) {
    return null
  }

  const handlePick = (item) => {
    const number = (item.number || articleNumber || searchArticle).trim()
    const brand = item.brand

    dispatch(selectManufacturer({ brand, number }))
    dispatch(
      fetchOffers({
        number,
        brand,
      }),
    )
    onSelect?.()

    requestAnimationFrame(() => {
      document.getElementById('offers-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }

  if (brandsStatus === 'loading') {
    return (
      <div className="search-suggest" role="listbox" aria-label="Подсказки поиска">
        <div className="search-suggest__state search-suggest__state--loading">
          <AppSpinner size="sm" label="Поиск по артикулу" />
          <span>Поиск по артикулу…</span>
        </div>
      </div>
    )
  }

  if (brandsStatus === 'failed') {
    return (
      <div className="search-suggest" role="listbox" aria-label="Подсказки поиска">
        <div className="search-suggest__state search-suggest__state--error">
          {brandsError}
        </div>
      </div>
    )
  }

  if (brandsStatus === 'succeeded' && brands.length === 0) {
    return (
      <div className="search-suggest" role="listbox" aria-label="Подсказки поиска">
        <div className="search-suggest__state">
          По артикулу «{searchArticle}» ничего не найдено
        </div>
      </div>
    )
  }

  if (brandsStatus !== 'succeeded') {
    return null
  }

  return (
    <div className="search-suggest" role="listbox" aria-label="Подсказки поиска">
      <ul className="search-suggest__list list-unstyled mb-0">
        {brands.map((item) => {
          const active = selectedBrand === item.brand
          const title = item.name
            ? `${item.name}`
            : `${item.brand} ${item.number || highlightQuery}`

          return (
            <li key={item.goodsID || `${item.brand}-${item.number}`}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`search-suggest__item${active ? ' search-suggest__item--active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handlePick(item)}
              >
                <PartThumbnail />
                <span className="search-suggest__content">
                  <span className="search-suggest__title">
                    <HighlightQuery text={title} query={highlightQuery} />
                  </span>
                  <span className="search-suggest__meta">
                    {item.brand}
                    {item.number ? ` • ${item.number}` : ''}
                    {(item.count ?? 0) > 0 && ` • ${item.count} шт.`}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
