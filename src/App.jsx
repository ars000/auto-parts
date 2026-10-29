import { useSelector } from 'react-redux'
import OffersEmptyState from './components/OffersEmptyState'
import OffersTable from './components/OffersTable'
import PartNumberSearch from './components/PartNumberSearch'
import SiteHeaderTop from './components/SiteHeaderTop'
import ToolbarStatus from './components/ToolbarStatus'

export default function App() {
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const brands = useSelector((state) => state.parts.brands)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)

  const step1Done = brandsStatus === 'succeeded' && brands.length > 0

  return (
    <div className="app-shell">
      <header className="site-header">
        <SiteHeaderTop />

        <div className="site-header__search-panel">
          <div className="app-container site-header__search-inner">
            <PartNumberSearch compact />
          </div>
        </div>

        <ToolbarStatus />
      </header>

      <main className="app-main">
        <div className="app-container app-main__content">
          <div className="result-panel result-panel--offers h-100" id="offers-panel">
            <div className="result-panel__head">
              <h2 className="result-panel__title">
                {selectedBrand
                  ? `Результаты — ${selectedBrand}`
                  : 'Аналоги и предложения'}
              </h2>
            </div>
            <div
              className={`result-panel__body${
                selectedBrand
                  ? ' result-panel__body--scroll result-panel__body--table'
                  : ' result-panel__body--empty'
              }`}
            >
              {!selectedBrand ? (
                <OffersEmptyState step1Done={step1Done} />
              ) : (
                <OffersTable />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
