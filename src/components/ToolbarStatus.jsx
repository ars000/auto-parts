import { useSelector } from 'react-redux'
import AppSpinner from './AppSpinner'

export default function ToolbarStatus() {
  const partNumber = useSelector((state) => state.parts.partNumber)
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)
  const offersStatus = useSelector((state) => state.parts.offersStatus)
  const offers = useSelector((state) => state.parts.offers)

  const query = partNumber.trim()

  return (
    <div className="site-subheader">
      <div className="app-container">
        <div className="site-subheader__inner">
          <nav className="site-breadcrumb" aria-label="Статус поиска">
            <span className="site-breadcrumb__item">Поиск</span>
            {query && (
              <>
                <span className="site-breadcrumb__sep">/</span>
                <span className="site-breadcrumb__item site-breadcrumb__item--active">
                  {query}
                </span>
              </>
            )}
            {selectedBrand && (
              <>
                <span className="site-breadcrumb__sep">/</span>
                <span className="site-breadcrumb__item site-breadcrumb__item--active">
                  {selectedBrand}
                </span>
              </>
            )}
          </nav>

          <div className="site-subheader__meta">
            {query && brandsStatus === 'loading' && (
              <span className="site-subheader__hint site-subheader__hint--loading">
                <AppSpinner size="xs" label="Поиск производителей" />
                Поиск производителей…
              </span>
            )}

            {selectedBrand && offersStatus === 'loading' && (
              <span className="site-subheader__hint site-subheader__hint--loading">
                <AppSpinner size="xs" label="Загрузка предложений" />
                Загрузка предложений…
              </span>
            )}

            {selectedBrand && offersStatus === 'succeeded' && (
              <span className="site-subheader__stat">
                Позиций в выдаче: <strong>{offers.length}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
