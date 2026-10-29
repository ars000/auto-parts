import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatPrice, getDisplayPrice } from '../api/partsApi'
import ErrorAlert from './ErrorAlert'
import Loader from './Loader'

const SORT_KEYS = {
  name: 'name',
  brand: 'brand',
  number: 'number',
  price: 'price',
  count: 'count',
  type: 'type',
}

function isInStock(item) {
  return (item.count ?? 0) > 0
}

function compareOffers(a, b, key, dir) {
  const mul = dir === 'asc' ? 1 : -1

  const getValue = (item) => {
    switch (key) {
      case SORT_KEYS.name:
        return (item.name || '').toLowerCase()
      case SORT_KEYS.brand:
        return (item.brand || '').toLowerCase()
      case SORT_KEYS.number:
        return (item.number || '').toLowerCase()
      case SORT_KEYS.price: {
        const price = getDisplayPrice(item)
        return price == null ? Number.POSITIVE_INFINITY : price
      }
      case SORT_KEYS.count:
        return item.count ?? 0
      case SORT_KEYS.type:
        return item.isAnalogue ? 1 : 0
      default:
        return ''
    }
  }

  const va = getValue(a)
  const vb = getValue(b)

  if (typeof va === 'number' && typeof vb === 'number') {
    if (va === vb) return 0
    return va < vb ? -1 * mul : 1 * mul
  }

  if (va < vb) return -1 * mul
  if (va > vb) return 1 * mul
  return 0
}

function SortableTh({ label, sortKey, activeKey, direction, onSort, className = '' }) {
  const isActive = activeKey === sortKey
  const indicator = !isActive ? '↕' : direction === 'asc' ? '↑' : '↓'

  return (
    <th className={className} aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="offers-table__sort-btn"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span className="offers-table__sort-icon" aria-hidden="true">
          {indicator}
        </span>
      </button>
    </th>
  )
}

function SectionRow({ label, variant = 'default' }) {
  return (
    <tr className={`offers-table__section offers-table__section--${variant}`}>
      <td colSpan={6}>{label}</td>
    </tr>
  )
}

function OfferRow({ item, outOfStock = false }) {
  const rowClass = [
    !item.isAnalogue && 'offers-table__row--primary',
    outOfStock && 'offers-table__row--out',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className={rowClass || undefined}>
      <td className="offers-table__name">{item.name || '—'}</td>
      <td className="text-nowrap">
        <span className="offers-table__brand">{item.brand || '—'}</span>
      </td>
      <td className="text-nowrap">
        <span className="offers-table__article">{item.number || '—'}</span>
      </td>
      <td className="text-end text-nowrap offers-table__price">
        {formatPrice(getDisplayPrice(item))}
      </td>
      <td className="text-end text-nowrap">
        <span
          className={`offers-table__stock${outOfStock ? ' offers-table__stock--out' : ''}`}
        >
          {item.count ?? 0} шт.
        </span>
      </td>
      <td>
        {item.isAnalogue ? (
          <span className="tag tag--muted">Аналог</span>
        ) : (
          <span className="tag tag--accent">Искомый</span>
        )}
      </td>
    </tr>
  )
}

export default function OffersTable() {
  const offers = useSelector((state) => state.parts.offers)
  const offersStatus = useSelector((state) => state.parts.offersStatus)
  const offersError = useSelector((state) => state.parts.offersError)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)
  const tableWrapRef = useRef(null)
  const prevStatus = useRef(offersStatus)
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  useEffect(() => {
    setSort({ key: null, dir: 'asc' })
  }, [selectedBrand, offers])

  useEffect(() => {
    const justLoaded =
      prevStatus.current !== 'succeeded' && offersStatus === 'succeeded'
    prevStatus.current = offersStatus

    if (justLoaded && tableWrapRef.current) {
      tableWrapRef.current.scrollTop = 0
    }
  }, [offersStatus])

  const { selectedRows, analogueInStock, analogueOutOfStock } = useMemo(() => {
    const selected = []
    const analogues = []

    for (const item of offers) {
      if (item.isAnalogue) {
        analogues.push(item)
      } else {
        selected.push(item)
      }
    }

    const sortList = (list) => {
      if (!sort.key) return list
      return [...list].sort((a, b) => compareOffers(a, b, sort.key, sort.dir))
    }

    const inStock = []
    const outOfStock = []

    for (const item of analogues) {
      if (isInStock(item)) {
        inStock.push(item)
      } else {
        outOfStock.push(item)
      }
    }

    return {
      selectedRows: sortList(selected),
      analogueInStock: sortList(inStock),
      analogueOutOfStock: sortList(outOfStock),
    }
  }, [offers, sort])

  const handleSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      return { key, dir: 'asc' }
    })
  }

  const hasAnalogues = analogueInStock.length > 0 || analogueOutOfStock.length > 0

  if (offersStatus === 'loading') {
    return (
      <div className="offers-table-host">
        <Loader message="Загрузка аналогов…" layout="panel" />
      </div>
    )
  }

  if (offersStatus === 'failed') {
    return (
      <div className="offers-table-host">
        <ErrorAlert message={offersError} />
      </div>
    )
  }

  if (offersStatus === 'succeeded' && offers.length === 0) {
    return (
      <div className="offers-table-host">
        <div className="alert alert-warning mb-0 py-2 border-0" role="alert">
          Предложения не найдены.
        </div>
      </div>
    )
  }

  if (offersStatus !== 'succeeded') {
    return null
  }

  return (
    <div className="offers-table-host">
      <div className="offers-table-wrap" ref={tableWrapRef}>
        <table className="table table-sm align-middle mb-0 offers-table">
          <thead>
            <tr>
              <SortableTh
                label="Наименование"
                sortKey={SORT_KEYS.name}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
              />
              <SortableTh
                label="Бренд"
                sortKey={SORT_KEYS.brand}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
              />
              <SortableTh
                label="Артикул"
                sortKey={SORT_KEYS.number}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
              />
              <SortableTh
                label="Цена"
                sortKey={SORT_KEYS.price}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
                className="text-end text-nowrap"
              />
              <SortableTh
                label="Наличие"
                sortKey={SORT_KEYS.count}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
                className="text-end text-nowrap"
              />
              <SortableTh
                label="Тип"
                sortKey={SORT_KEYS.type}
                activeKey={sort.key}
                direction={sort.dir}
                onSort={handleSort}
                className="text-nowrap"
              />
            </tr>
          </thead>
          <tbody>
            {selectedRows.length > 0 && (
              <SectionRow label="Искомый товар" variant="primary" />
            )}
            {selectedRows.map((item) => (
              <OfferRow
                key={item.goodsID || `${item.brand}-${item.number}-sel`}
                item={item}
              />
            ))}

            {hasAnalogues && (
              <SectionRow label="Возможные замены" variant="replacements" />
            )}

            {analogueInStock.length > 0 && (
              <SectionRow label="В наличии" variant="in-stock" />
            )}
            {analogueInStock.map((item) => (
              <OfferRow
                key={item.goodsID || `${item.brand}-${item.number}-in`}
                item={item}
              />
            ))}

            {analogueOutOfStock.length > 0 && (
              <SectionRow label="Нет в наличии" variant="out-stock" />
            )}
            {analogueOutOfStock.map((item) => (
              <OfferRow
                key={item.goodsID || `${item.brand}-${item.number}-out`}
                item={item}
                outOfStock
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
