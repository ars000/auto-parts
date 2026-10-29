/** Меньше 4 символов даёт слишком широкую выдачу и быстро упирается в лимит API. */
export const MIN_ARTICLE_LENGTH = 4

/** Поиск только по артикулу: в запросе должна быть цифра. */
export function extractArticleNumber(input) {
  const trimmed = (input ?? '').trim()
  if (trimmed.length < MIN_ARTICLE_LENGTH) {
    return null
  }

  if (!/\d/.test(trimmed)) {
    return null
  }

  if (!/\s/.test(trimmed)) {
    return trimmed
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean)
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (/\d/.test(tokens[i])) {
      return tokens[i]
    }
  }

  return null
}

export function isArticleSearchQuery(input) {
  return extractArticleNumber(input) != null
}
