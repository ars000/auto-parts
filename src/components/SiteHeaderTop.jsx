import { useCallback, useEffect, useId, useState } from 'react'
import SiteBrand from './SiteBrand'

function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M10 12h10m0 0-3-3m3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LangSwitch() {
  return (
    <div className="lang-switch" role="group" aria-label="Язык интерфейса">
      <button type="button" className="lang-switch__btn lang-switch__btn--active">
        Ру
      </button>
      <button type="button" className="lang-switch__btn" disabled title="Скоро">
        En
      </button>
    </div>
  )
}

function HeaderActionsDesktop() {
  return (
    <div className="site-header__actions site-header__actions--desktop">
      <div className="site-header__links">
        <a
          className="site-header__link"
          href="https://favorit-parts.ru/company/sotrudnichestvo/"
          target="_blank"
          rel="noreferrer"
        >
          Стать поставщиком
        </a>
        <a
          className="site-header__link"
          href="https://favorit-parts.ru/"
          target="_blank"
          rel="noreferrer"
        >
          Стать клиентом
        </a>
      </div>

      <div className="site-header__divider" aria-hidden="true" />

      <LangSwitch />

      <a
        className="site-header__login"
        href="https://lk.favorit-parts.ru/"
        target="_blank"
        rel="noreferrer"
      >
        <LoginIcon />
        Вход
      </a>
    </div>
  )
}

function MobileBurgerMenu({ id, open, onClose }) {
  const handleLinkClick = () => {
    onClose()
  }

  return (
    <div
      id={id}
      className="burger-menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="burger-menu__container">
        <button
          type="button"
          className="burger-menu__close"
          aria-label="Закрыть меню"
          onClick={onClose}
        />

        <nav className="burger-menu-list" aria-label="Меню">
          <ul className="burger-menu-list__list">
            <li className="burger-menu-list__item">
              <div className="burger-menu-list__link-wrap">
                <a
                  className="burger-menu-list__link"
                  href="https://favorit-parts.ru/company/sotrudnichestvo/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                >
                  Стать поставщиком
                </a>
              </div>
            </li>
            <li className="burger-menu-list__item">
              <div className="burger-menu-list__link-wrap">
                <a
                  className="burger-menu-list__link"
                  href="https://favorit-parts.ru/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                >
                  Стать клиентом
                </a>
              </div>
            </li>
          </ul>
        </nav>

        <div className="burger-menu__actions">
          <LangSwitch />
          <a
            className="burger-menu__login"
            href="https://lk.favorit-parts.ru/"
            target="_blank"
            rel="noreferrer"
            onClick={handleLinkClick}
          >
            <LoginIcon />
            Вход
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SiteHeaderTop() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), [])

  useEffect(() => {
    if (!menuOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

  useEffect(() => {
    document.body.classList.toggle('burger-menu-is-open', menuOpen)
    return () => document.body.classList.remove('burger-menu-is-open')
  }, [menuOpen])

  return (
    <div className="site-header__hero">
      <div className="app-container site-header__hero-inner">
        <SiteBrand variant="hero" />

        <button
          type="button"
          className="site-header__burger"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={toggleMenu}
        />

        <HeaderActionsDesktop />
      </div>

      <MobileBurgerMenu id={menuId} open={menuOpen} onClose={closeMenu} />
    </div>
  )
}
