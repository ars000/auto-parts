import AppSpinner from './AppSpinner'

export default function Loader({ message = 'Загрузка…', layout = 'inline' }) {
  if (layout === 'panel') {
    return (
      <div className="app-loader app-loader--panel">
        <div className="app-loader__card">
          <AppSpinner size="lg" label={message} />
          <p className="app-loader__message">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-loader app-loader--inline">
      <AppSpinner size="md" label={message} />
      <span className="app-loader__message">{message}</span>
    </div>
  )
}
