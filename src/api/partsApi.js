const API_PATH = '/api/hsprice/'

function getApiKey() {
  const key = import.meta.env.VITE_FAVORIT_API_KEY
  if (!key) {
    throw new Error(
      'Не задан ключ API. Скопируйте .env.example в .env и укажите VITE_FAVORIT_API_KEY.',
    )
  }
  return key
}

function buildUrl(params) {
  const search = new URLSearchParams({ key: getApiKey(), ...params })
  return `${API_PATH}?${search.toString()}`
}

async function request(params, signal) {
  let response
  try {
    response = await fetch(buildUrl(params), { signal })
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err
    }
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к сети.')
  }

  let data
  const rawBody = await response.text()

  try {
    data = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    if (!response.ok) {
      throw new Error(`Ошибка сервера (${response.status})`)
    }
    throw new Error('Некорректный ответ сервера')
  }

  if (!response.ok) {
    const apiError = typeof data?.error === 'string' ? data.error : ''
    if (response.status === 403 && /quota exceeded/i.test(apiError)) {
      throw new Error(
        'Превышен лимит запросов к API. Подождите минуту или укажите свой ключ VITE_FAVORIT_API_KEY в .env.',
      )
    }
    throw new Error(apiError || `Ошибка сервера (${response.status})`)
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}

export function isEmptyGood(item) {
  if (!item || typeof item !== 'object') return true
  return !item.brand && !item.goodsID && !item.name
}

export function getDisplayPrice(item) {
  const warehouses = item?.warehouses
  if (!warehouses?.length) {
    return null
  }

  const prices = warehouses
    .filter((w) => w.stock > 0 && typeof w.price === 'number')
    .map((w) => w.price)

  if (prices.length) {
    return Math.min(...prices)
  }

  const anyPrices = warehouses
    .filter((w) => typeof w.price === 'number' && w.price > 0)
    .map((w) => w.price)

  return anyPrices.length ? Math.min(...anyPrices) : null
}

export function formatPrice(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)
}

/** Этап 1: производители по артикулу */
export async function searchByNumber(number, signal) {
  const trimmed = number.trim()
  if (!trimmed) {
    throw new Error('Введите номер детали')
  }

  const data = await request({ number: trimmed }, signal)
  const goods = (data.goods || []).filter((item) => !isEmptyGood(item))

  if (!goods.length) {
    return []
  }

  return goods
}

/** Этап 2: основная позиция и аналоги */
export async function searchAnalogues(number, brand, signal) {
  const trimmedNumber = number.trim()
  const trimmedBrand = brand.trim()

  if (!trimmedNumber || !trimmedBrand) {
    throw new Error('Не указаны номер или производитель')
  }

  const data = await request(
    {
      number: trimmedNumber,
      brand: trimmedBrand,
      analogues: 'on',
    },
    signal,
  )

  const goods = (data.goods || []).filter((item) => !isEmptyGood(item))
  if (!goods.length) {
    return []
  }

  const rows = []

  for (const item of goods) {
    rows.push({ ...item, isAnalogue: false })
    for (const analogue of item.analogues || []) {
      if (!isEmptyGood(analogue)) {
        rows.push({ ...analogue, isAnalogue: true })
      }
    }
  }

  return rows
}
