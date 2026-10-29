export default function AppSpinner({
  size = 'md',
  variant = 'accent',
  label,
  className = '',
}) {
  const classes = [
    'app-spinner',
    `app-spinner--${size}`,
    `app-spinner--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      role="status"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
