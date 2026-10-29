export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      {message}
      {onDismiss && (
        <button
          type="button"
          className="btn-close"
          aria-label="Закрыть"
          onClick={onDismiss}
        />
      )}
    </div>
  )
}
