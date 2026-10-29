export default function OffersEmptyState({ step1Done }) {
  return (
    <div className="offers-empty">
      <div className="offers-empty__watermark" aria-hidden="true">
        <img src="/favorit-logo.png" alt="" />
      </div>
      <div className="offers-empty__content">
        <h3 className="offers-empty__title">
          {step1Done ? 'Выберите позицию из подсказок' : 'Начните с поиска по артикулу'}
        </h3>
        <p className="offers-empty__text">
          {step1Done
            ? 'Нажмите на нужный бренд в выпадающем списке над таблицей — здесь появятся предложения и аналоги.'
            : 'Введите номер детали в поле поиска. Мы покажем производителей, после выбора — цены и остатки.'}
        </p>
      </div>
    </div>
  )
}
