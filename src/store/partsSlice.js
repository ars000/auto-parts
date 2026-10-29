import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { searchAnalogues, searchByNumber } from '../api/partsApi'
import { extractArticleNumber } from '../utils/articleQuery'

export const fetchBrands = createAsyncThunk(
  'parts/fetchBrands',
  async (rawQuery, { rejectWithValue, signal }) => {
    const number = extractArticleNumber(rawQuery)
    if (!number) {
      return rejectWithValue('Укажите артикул детали (номер с цифрами)')
    }

    try {
      return await searchByNumber(number, signal)
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw err
      }
      return rejectWithValue(err.message || 'Ошибка загрузки производителей')
    }
  },
  {
    condition: (rawQuery, { getState }) => {
      const number = extractArticleNumber(rawQuery) ?? String(rawQuery ?? '').trim()
      if (!number) {
        return false
      }

      const { brandsStatus, brandsLoadedFor } = getState().parts
      if (brandsStatus === 'loading') {
        return true
      }
      if (brandsStatus === 'succeeded' && brandsLoadedFor === number) {
        return false
      }
      return true
    },
  },
)

export const fetchOffers = createAsyncThunk(
  'parts/fetchOffers',
  async ({ number, brand }, { rejectWithValue, signal }) => {
    try {
      return await searchAnalogues(number, brand, signal)
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw err
      }
      return rejectWithValue(err.message || 'Ошибка загрузки предложений')
    }
  },
)

const initialState = {
  partNumber: '',
  articleNumber: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  brandsLoadedFor: null,
  selectedBrand: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
}

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setPartNumber(state, action) {
      const nextArticle = extractArticleNumber(action.payload) || ''
      const articleChanged = nextArticle !== state.articleNumber

      state.partNumber = action.payload
      state.articleNumber = nextArticle
      state.selectedBrand = null
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null

      if (articleChanged) {
        state.brands = []
        state.brandsStatus = 'idle'
        state.brandsError = null
        state.brandsLoadedFor = null
      }
    },
    clearSearchResults(state) {
      state.brands = []
      state.brandsStatus = 'idle'
      state.brandsError = null
      state.brandsLoadedFor = null
      state.selectedBrand = null
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null
    },
    clearSearch(state) {
      state.partNumber = ''
      state.articleNumber = ''
      state.brands = []
      state.brandsStatus = 'idle'
      state.brandsError = null
      state.brandsLoadedFor = null
      state.selectedBrand = null
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null
    },
    selectManufacturer(state, action) {
      const { brand, number } = action.payload
      const article = (number || '').trim()
      state.selectedBrand = brand
      state.articleNumber = article
      state.partNumber = article ? `${brand} ${article}` : brand
      state.offers = []
      state.offersStatus = 'idle'
      state.offersError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.brandsStatus = 'loading'
        state.brandsError = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded'
        state.brands = action.payload
        state.brandsLoadedFor =
          extractArticleNumber(action.meta.arg) ?? String(action.meta.arg ?? '').trim()
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.aborted) {
          return
        }
        state.brandsStatus = 'failed'
        state.brandsError = action.payload
        state.brands = []
      })
      .addCase(fetchOffers.pending, (state) => {
        state.offersStatus = 'loading'
        state.offersError = null
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offersStatus = 'succeeded'
        state.offers = action.payload
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (action.meta.aborted) {
          return
        }
        state.offersStatus = 'failed'
        state.offersError = action.payload
        state.offers = []
      })
  },
})

export const {
  setPartNumber,
  clearSearchResults,
  clearSearch,
  selectManufacturer,
} = partsSlice.actions
export default partsSlice.reducer
