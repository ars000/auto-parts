export default function SiteBrand({ variant = 'hero' }) {
  const isHero = variant === 'hero'

  return (
    <a
      className={`site-brand${isHero ? ' site-brand--hero' : ''}`}
      href="https://favorit-parts.ru/"
      target="_blank"
      rel="noreferrer"
    >
      <img
        className={`site-brand__logo${isHero ? ' site-brand__logo--light' : ''}`}
        src="/favorit-logo.png"
        alt="FAVORIT"
        width={160}
        height={48}
      />
      {isHero ? (
        <span className="site-brand__slogan site-brand__slogan--hero">
          Международный оптовый гипермаркет автозапчастей
        </span>
      ) : (
        <span className="site-brand__slogan">
          Ваш фаворит в выборе автозапчастей
        </span>
      )}
    </a>
  )
}
