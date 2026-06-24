<template>
  <div class='relative min-h-screen text-ink'>
    <div v-if='cloudConfigured && !userEmail' class='flex min-h-screen items-center justify-center px-4'>
      <div class='w-full max-w-sm border-2 border-ink bg-paper shadow-[8px_8px_0_0_var(--color-ink)]'>
        <div class='flex items-center gap-3 border-b-2 border-ink bg-ink px-5 py-4 text-paper'>
          <span class='h-4 w-4 bg-signal'></span>
          <span class='text-sm font-bold uppercase tracking-wide'>Digital shoppingliste</span>
        </div>
        <div v-if='!authReady' class='px-5 py-12 text-center font-mono text-sm text-muted'>Tjekker login…</div>
        <form v-else class='space-y-4 px-5 py-6' @submit.prevent='submitAuth'>
          <p class='mono-label text-muted'>Log ind for at fortsætte</p>
          <label class='block'>
            <span class='mono-label text-muted'>E-mail</span>
            <input type='email' v-model='authEmail' autocomplete='email' required class='mt-2 w-full border border-ink bg-paper px-3 py-2 font-mono text-sm text-ink' />
          </label>
          <label class='block'>
            <span class='mono-label text-muted'>Adgangskode</span>
            <input type='password' v-model='authPassword' autocomplete='current-password' required class='mt-2 w-full border border-ink bg-paper px-3 py-2 font-mono text-sm text-ink' />
          </label>
          <p v-if='authError' class='font-mono text-xs leading-5 text-signal'>{{ authError }}</p>
          <button type='submit' :disabled='authBusy' class='w-full bg-ink px-5 py-3 mono-label text-paper transition hover:bg-signal disabled:opacity-50'>{{ authBusy ? 'Vent…' : 'Log ind' }}</button>
        </form>
      </div>
    </div>

    <template v-else>
    <nav class='sticky top-0 z-30'>
      <div class='mx-auto max-w-[1600px] px-5 pt-5 sm:px-8 lg:px-12'>
       <div class='border-2 border-ink bg-paper shadow-[7px_7px_0_0_var(--color-ink)]'>
        <div class='flex flex-col sm:flex-row sm:items-stretch sm:justify-between'>
          <div class='flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-5 py-4 text-paper sm:flex-1 sm:border-b-0 sm:border-r-2'>
            <div class='flex min-w-0 items-center gap-3'>
              <span class='h-4 w-4 shrink-0 bg-signal'></span>
              <span class='truncate text-sm font-bold uppercase tracking-wide'>Digital shoppingliste</span>
              <span v-if='cloudConfigured && userEmail' class='hidden truncate mono-label opacity-60 lg:inline'>· {{ userEmail }}</span>
            </div>
            <button type='button' class='shrink-0 mono-label text-paper sm:hidden' @click='menuOpen = !menuOpen'>{{ menuOpen ? '✕ Luk' : '☰ Menu' }}</button>
          </div>
          <div class='hidden items-stretch sm:flex sm:flex-nowrap'>
            <label class='flex cursor-pointer items-center gap-2 border-l border-ink bg-paper px-5 py-4 mono-label transition hover:bg-ink hover:text-paper'>
              <span aria-hidden='true'>↑</span>
              <span>{{ items.length ? 'Importér igen' : 'Importér CSV' }}</span>
              <input type='file' accept='.csv' @change='onFileChange' class='sr-only' />
            </label>
            <button :disabled='!hasActiveFilters' class='border-l border-ink bg-paper px-5 py-4 mono-label transition hover:bg-ink hover:text-paper disabled:bg-paper disabled:text-muted disabled:opacity-50 disabled:hover:bg-paper disabled:hover:text-muted' @click='resetFilters'>Ryd filtre</button>
            <button v-if='cloudConfigured && userEmail' class='border-l border-ink bg-paper px-5 py-4 mono-label transition hover:bg-ink hover:text-paper' @click='logout'>Log ud</button>
            <button type='button' :title="isDark ? 'Skift til lys' : 'Skift til mørk'" :aria-label="isDark ? 'Skift til lys' : 'Skift til mørk'" class='flex items-center justify-center border-l border-ink bg-paper px-4 py-4 text-sm leading-none transition hover:bg-ink hover:text-paper' @click='toggleDark'>{{ isDark ? '☀' : '☾' }}</button>
          </div>
        </div>

        <div class='hidden border-t-2 border-ink sm:flex sm:flex-col lg:flex-row lg:items-stretch'>
          <div class='flex flex-1 items-center gap-3 px-5 py-4 lg:py-2.5'>
            <span aria-hidden='true' class='text-muted'>⌕</span>
            <span class='mono-label text-muted'>Søg</span>
            <input type='text' v-model='searchText' placeholder='Titel eller beskrivelse…' class='w-full bg-transparent font-mono text-sm text-ink placeholder:text-muted' />
            <button v-if='searchText' type='button' class='shrink-0 mono-label text-muted transition hover:text-signal' title='Ryd søgning' @click="searchText = ''">✕</button>
            <span class='shrink-0 mono-label text-muted'>{{ filteredItems.length }} / {{ items.length }}</span>
          </div>
          <div :class="['flex items-center justify-between gap-2 border-t border-ink px-5 py-4 lg:w-36 lg:justify-start lg:border-l lg:border-t-0 lg:py-2.5', filterMin !== null ? 'bg-signal/10' : '']">
            <span :class="['mono-label', filterMin !== null ? 'text-signal' : 'text-muted']">Min</span>
            <input type='number' v-model.number='filterMin' placeholder='—' class='w-20 bg-transparent text-right font-mono text-sm tabular-nums text-ink placeholder:text-muted lg:text-left' />
          </div>
          <div :class="['flex items-center justify-between gap-2 border-t border-ink px-5 py-4 lg:w-36 lg:justify-start lg:border-l lg:border-t-0 lg:py-2.5', filterMax !== null ? 'bg-signal/10' : '']">
            <span :class="['mono-label', filterMax !== null ? 'text-signal' : 'text-muted']">Max</span>
            <input type='number' v-model.number='filterMax' placeholder='—' class='w-20 bg-transparent text-right font-mono text-sm tabular-nums text-ink placeholder:text-muted lg:text-left' />
          </div>
          <div class='flex items-stretch border-t border-ink lg:border-l lg:border-t-0'>
            <button type='button' :class="['flex-1 px-4 py-4 mono-label transition lg:flex-none lg:py-2.5', currency === 'DKK' ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink hover:text-paper']" @click="currency = 'DKK'">DK/DKK</button>
            <button type='button' :class="['flex-1 border-l border-ink px-4 py-4 mono-label transition lg:flex-none lg:py-2.5', currency === 'EUR' ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink hover:text-paper']" @click="currency = 'EUR'">EN/EUR</button>
          </div>
        </div>

        <div class='flex items-center gap-3 border-t-2 border-ink px-5 py-4 sm:hidden'>
          <span aria-hidden='true' class='text-muted'>⌕</span>
          <input type='text' v-model='searchText' placeholder='Søg titel eller beskrivelse…' class='w-full bg-transparent font-mono text-base text-ink placeholder:text-muted' />
          <button v-if='searchText' type='button' class='shrink-0 mono-label text-muted' title='Ryd' @click="searchText = ''">✕</button>
          <span class='shrink-0 mono-label text-muted'>{{ filteredItems.length }} / {{ items.length }}</span>
        </div>

        <div v-show='menuOpen' class='sm:hidden'>
          <div class='grid grid-cols-2 gap-px border-t-2 border-ink bg-ink'>
            <label :class="['flex items-center justify-between gap-2 px-5 py-4', filterMin !== null ? 'bg-signal/10' : 'bg-paper']">
              <span :class="['mono-label', filterMin !== null ? 'text-signal' : 'text-muted']">Min pris</span>
              <input type='number' v-model.number='filterMin' placeholder='—' class='w-20 bg-transparent text-right font-mono text-base tabular-nums text-ink placeholder:text-muted' />
            </label>
            <label :class="['flex items-center justify-between gap-2 px-5 py-4', filterMax !== null ? 'bg-signal/10' : 'bg-paper']">
              <span :class="['mono-label', filterMax !== null ? 'text-signal' : 'text-muted']">Max pris</span>
              <input type='number' v-model.number='filterMax' placeholder='—' class='w-20 bg-transparent text-right font-mono text-base tabular-nums text-ink placeholder:text-muted' />
            </label>
          </div>
          <div class='grid grid-cols-2 gap-px border-t border-ink bg-ink'>
            <button type='button' :class="['px-4 py-4 mono-label transition', currency === 'DKK' ? 'bg-ink text-paper' : 'bg-paper active:bg-ink active:text-paper']" @click="currency = 'DKK'">DK / DKK</button>
            <button type='button' :class="['px-4 py-4 mono-label transition', currency === 'EUR' ? 'bg-ink text-paper' : 'bg-paper active:bg-ink active:text-paper']" @click="currency = 'EUR'">EN / EUR</button>
          </div>
          <label class='flex cursor-pointer items-center gap-3 border-t-2 border-ink bg-paper px-5 py-4 mono-label active:bg-ink active:text-paper'>
            <span aria-hidden='true'>↑</span>
            <span>{{ items.length ? 'Importér igen' : 'Importér CSV' }}</span>
            <input type='file' accept='.csv' @change='onFileChange' class='sr-only' />
          </label>
          <button type='button' :disabled='!hasActiveFilters' class='block w-full border-t border-ink bg-paper px-5 py-4 text-left mono-label active:bg-ink active:text-paper disabled:text-muted disabled:opacity-50' @click='resetFilters'>Ryd filtre</button>
          <button type='button' class='block w-full border-t border-ink bg-paper px-5 py-4 text-left mono-label active:bg-ink active:text-paper' @click='toggleDark'>{{ isDark ? '☀ Lys tilstand' : '☾ Mørk tilstand' }}</button>
          <button v-if='cloudConfigured && userEmail' type='button' class='block w-full border-t border-ink bg-paper px-5 py-4 text-left mono-label active:bg-ink active:text-paper' @click='logout'>Log ud</button>
        </div>
       </div>
      </div>
    </nav>

    <div class='mx-auto max-w-[1600px] px-5 pb-8 pt-6 sm:px-8 sm:pb-10 lg:px-12'>
      <div class='grid grid-cols-2 gap-px border border-ink bg-ink'>
        <div class='flex items-baseline justify-between bg-paper px-5 py-4'>
          <span class='mono-label text-muted'>Varer</span>
          <span class='font-mono text-2xl font-bold tabular-nums'>{{ items.length }}</span>
        </div>
        <div class='flex items-baseline justify-between bg-paper px-5 py-4'>
          <span class='mono-label text-muted'>Viser</span>
          <span class='font-mono text-2xl font-bold tabular-nums'>{{ filteredItems.length }}</span>
        </div>
      </div>

      <main class='mt-6'>
        <section class='card animate-riseIn'>
          <div class='flex items-center justify-between border-b border-ink px-6 py-4'>
            <div class='flex items-baseline gap-3'>
              <span class='mono-label'>[ 01 ]</span>
              <h2 class='text-lg font-bold uppercase tracking-tight'>Produkter</h2>
            </div>
            <span class='mono-label text-muted'>Side {{ currentPage }} / {{ pageCount }}</span>
          </div>

          <ul>
            <li v-if='pagedItems.length === 0' class='px-6 py-16 text-center font-mono text-sm text-muted'>Ingen varer. Importér en CSV for at begynde.</li>
            <li v-for='item in pagedItems' :key='item.id' class='border-b border-ink/15'>
              <button type='button' @click='toggleExpand(item)' :class="['flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition', expandedId === item.id ? 'bg-ink text-paper' : 'hover:bg-paper']">
                <div class='flex min-w-0 items-center gap-3'>
                  <span :class="['h-2 w-2 shrink-0', item.status === 'OK' ? (expandedId === item.id ? 'bg-paper' : 'bg-ink') : 'bg-signal']"></span>
                  <p class='truncate text-sm font-semibold uppercase tracking-tight'>{{ (currency === 'EUR' ? item.Title : (item.titleDA || item.Title)) || 'Uden titel' }}</p>
                </div>
                <div class='flex shrink-0 items-center gap-5'>
                  <span class='hidden cursor-pointer font-mono text-sm font-bold tabular-nums hover:text-signal sm:inline' title='Klik for at kopiere' @click.stop="copyText(currency === 'EUR' ? item.UnitPriceEUR : item.UnitPriceDKK)">{{ currency === 'EUR' ? item.UnitPriceEUR : item.UnitPriceDKK }}</span>
                  <span :class="['mono-label', expandedId === item.id ? 'text-paper' : 'text-muted']">{{ expandedId === item.id ? 'Luk −' : 'Læs mere +' }}</span>
                </div>
              </button>

              <div v-if='expandedId === item.id' class='border-t border-ink/15 bg-paper px-6 py-5'>
                <div class='border border-ink bg-paper px-4 py-3'>
                  <span class='mono-label text-muted'>{{ currency === 'EUR' ? ('Original — ' + (sourceLangs[item.id] ? sourceLangs[item.id].toUpperCase() : 'EN/DE')) : 'Beskrivelse — DK' }}</span>
                  <p class='mt-2 cursor-pointer font-mono text-sm leading-7 hover:text-signal' title='Klik for at kopiere' @click="copyText(currency === 'EUR' ? descText(item) : translations[item.id])">
                    <template v-if="currency === 'EUR'">{{ descText(item) }}</template>
                    <template v-else-if='translations[item.id]'>{{ translations[item.id] }}</template>
                    <span v-else-if='translationStatus[item.id] === "translating"' class='text-muted'>Oversætter…</span>
                    <span v-else-if='translationStatus[item.id] === "unavailable"' class='text-muted'>Oversættelse mislykkedes — tjek netværk og prøv igen.</span>
                    <span v-else class='text-muted'>—</span>
                  </p>
                </div>
                <div class='mt-5 grid grid-cols-2 gap-px border border-ink bg-ink sm:grid-cols-4'>
                  <div class='bg-paper px-4 py-3'>
                    <span class='mono-label text-muted'>Enhedspris</span>
                    <span class='mt-1 block cursor-pointer font-mono text-sm font-bold tabular-nums hover:text-signal' title='Klik for at kopiere' @click="copyText(currency === 'EUR' ? item.UnitPriceEUR : item.UnitPriceDKK)">{{ currency === 'EUR' ? item.UnitPriceEUR : item.UnitPriceDKK }}</span>
                  </div>
                  <div class='bg-paper px-4 py-3'>
                    <span class='mono-label text-muted'>Antal</span>
                    <span class='mt-1 block cursor-pointer font-mono text-sm font-bold tabular-nums hover:text-signal' title='Klik for at kopiere' @click="copyText((item.QuantityValue ?? item.Quantity) || '')">{{ (item.QuantityValue ?? item.Quantity) || '—' }}</span>
                  </div>
                  <div class='bg-paper px-4 py-3'>
                    <span class='mono-label text-muted'>Samlet</span>
                    <span class='mt-1 block cursor-pointer font-mono text-sm font-bold tabular-nums hover:text-signal' title='Klik for at kopiere' @click="copyText(currency === 'EUR' ? item.TotalPriceEUR : item.TotalPriceDKK)">{{ currency === 'EUR' ? item.TotalPriceEUR : item.TotalPriceDKK }}</span>
                  </div>
                  <div class='bg-paper px-4 py-3'>
                    <span class='mono-label text-muted'>Status</span>
                    <span class='mt-1 block font-mono text-sm font-bold'>{{ item.status }}</span>
                  </div>
                </div>
                <div class='mt-4 flex flex-wrap gap-1.5'>
                  <button class='border border-ink px-3 py-1.5 mono-label transition hover:bg-ink hover:text-paper' @click='copyLine(item)'>Kopiér</button>
                  <button class='border border-signal px-3 py-1.5 mono-label text-signal transition hover:bg-signal hover:text-paper' @click='removeItem(item.id)'>Fjern</button>
                </div>
              </div>
            </li>
          </ul>

          <div class='flex items-center justify-between border-t border-ink px-6 py-4'>
            <span class='mono-label text-muted'>{{ filteredItems.length }} resultater</span>
            <div class='flex gap-px border border-ink'>
              <button class='bg-paper px-5 py-2.5 mono-label transition hover:bg-ink hover:text-paper disabled:opacity-40' @click='prevPage' :disabled='currentPage === 1'>← Forrige</button>
              <button class='border-l border-ink bg-paper px-5 py-2.5 mono-label transition hover:bg-ink hover:text-paper disabled:opacity-40' @click='nextPage' :disabled='currentPage === pageCount'>Næste →</button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div v-if='toast' class='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border-2 border-ink bg-ink px-5 py-3 mono-label text-paper shadow-[4px_4px_0_0_var(--color-paper)]'>{{ toast }}</div>
    </template>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import Papa from 'papaparse'
import { isSupabaseConfigured, loadList, saveList, signIn, signUp, signOut, getCurrentUser, onAuthChange } from './lib/supabase'

interface Theme {
  id: string
  name: string
  description?: string
  createdAt?: string
  items: string[]
}

interface Item {
  id: string
  Category?: string
  Subcategory?: string
  Type?: string
  Title?: string
  ProductDetails?: string
  ProductCode?: string
  ShortDescription?: string
  LongDescription?: string
  Usage?: string
  Notes?: string
  PackOrQty?: string
  Countries?: string
  BenefitStatement?: string
  LinkText?: string
  UnitPrice?: string
  Quantity?: string
  TotalPrice?: string
  OtherValue?: string
  Validation?: string
  CountryCodes?: string
  DonationMessage?: string
  UnitPriceValue?: number | null
  TotalPriceValue?: number | null
  QuantityValue?: number | null
  UnitPriceDKKValue?: number | null
  UnitPriceEUR?: string
  UnitPriceDKK?: string
  TotalPriceEUR?: string
  TotalPriceDKK?: string
  status?: string
  searchText?: string
  descDA?: string
  titleDA?: string
  descLang?: string
}

function cleanNumber(value: string): number | null {
  const cleaned = value
    .replace('€', '')
    .replace(/\s+/g, '')
    .replace(/[^0-9.,-]/g, '')

  if (!cleaned.length) return null
  if (/^\d+[.,]\d+$/.test(cleaned)) {
    return Number(cleaned.replace(',', '.'))
  }
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.'))
  }
  if (/^\d+(,\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/,/g, ''))
  }
  if (/^\d+(\.\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, ''))
  }
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  if (lastComma > lastDot) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.')
    return Number(normalized)
  }
  if (lastDot > lastComma) {
    const normalized = cleaned.replace(/,/g, '')
    return Number(normalized)
  }
  return Number(cleaned)
}

function cleanQuantity(value: string): number | null {
  const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) && cleaned.length > 0 ? parsed : null
}

function formatDKK(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 2 }).format(value)
}

function formatEUR(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value)
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export default defineComponent({
  setup() {
    const items = ref<Item[]>([])
    const selectedItemId = ref<string | null>(null)
    const expandedId = ref<string | null>(null)
    const themesMenuOpen = ref(false)
    const isDark = ref(false)
    const cloudConfigured = isSupabaseConfigured
    const cloudStatus = ref('')
    const userEmail = ref<string | null>(null)
    const authEmail = ref('')
    const authPassword = ref('')
    const authMode = ref<'signin' | 'signup'>('signin')
    const authError = ref('')
    const authBusy = ref(false)
    const authReady = ref(false)
    const showLogin = ref(false)
    const translations = ref<Record<string, string>>({})
    const translationStatus = ref<Record<string, string>>({})
    const sourceLangs = ref<Record<string, string>>({})
    const themes = ref<Theme[]>([])
    const activeThemeId = ref<string | null>(null)
    const searchText = ref('')
    const filterMin = ref<number | null>(null)
    const filterMax = ref<number | null>(null)
    const currency = ref<'DKK' | 'EUR'>('DKK')
    const menuOpen = ref(false)
    const toast = ref('')
    let toastTimer: ReturnType<typeof setTimeout> | null = null
    const newThemeName = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const exchangeRate = ref(7.5)
    let saveTimer: ReturnType<typeof setTimeout> | null = null

    async function loadFromCloud() {
      if (!cloudConfigured || !userEmail.value) return
      cloudStatus.value = 'Henter…'
      try {
        const snapshot = await loadList()
        if (snapshot) {
          items.value = snapshot.items as Item[]
          themes.value = snapshot.themes as Theme[]
          void translateAll()
        }
        cloudStatus.value = 'Hentet'
      } catch (error) {
        void error
        cloudStatus.value = 'Hent fejlede'
      }
    }

    async function saveToCloud() {
      if (!cloudConfigured || !userEmail.value) return
      cloudStatus.value = 'Gemmer…'
      try {
        await saveList({ items: items.value, themes: themes.value })
        cloudStatus.value = 'Gemt'
      } catch (error) {
        void error
        cloudStatus.value = 'Gem fejlede'
      }
    }

    function persist() {
      if (!cloudConfigured || !userEmail.value) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        void saveToCloud()
      }, 800)
    }

    async function submitAuth() {
      if (!authEmail.value || !authPassword.value) return
      authBusy.value = true
      authError.value = ''
      try {
        if (authMode.value === 'signup') {
          await signUp(authEmail.value, authPassword.value)
        } else {
          await signIn(authEmail.value, authPassword.value)
        }
        authPassword.value = ''
        showLogin.value = false
      } catch (error) {
        authError.value = error instanceof Error ? error.message : 'Login mislykkedes'
      } finally {
        authBusy.value = false
      }
    }

    async function logout() {
      await signOut()
      userEmail.value = null
      cloudStatus.value = ''
    }

    function parseCSV(text: string) {
      const result = Papa.parse<string[]>(text, {
        delimiter: ';',
        quoteChar: '"',
        skipEmptyLines: true,
      })
      return result.data.map((row: string[]) => row.map((value: string) => value.trim()))
    }

    function onFileChange(event: Event) {
      const input = event.target as HTMLInputElement
      if (!input.files?.length) return
      const file = input.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        const parsed = parseCSV(text)
        const newItems: Item[] = parsed
          .filter((row: string[]) => row.some((cell: string) => cell.trim().length > 0))
          .map((row: string[]) => {
            const columns = Array.from({ length: 21 }, (_, index) => row[index] || '')
            const item: any = {
              id: generateId(),
              Category: columns[0],
              Subcategory: columns[1],
              Type: columns[2],
              Title: columns[3],
              ProductDetails: columns[4],
              ProductCode: columns[5],
              ShortDescription: columns[6],
              LongDescription: columns[7],
              Usage: columns[8],
              Notes: columns[9],
              PackOrQty: columns[10],
              Countries: columns[11],
              BenefitStatement: columns[12],
              LinkText: columns[13],
              UnitPrice: columns[14],
              Quantity: columns[15],
              TotalPrice: columns[16],
              OtherValue: columns[17],
              Validation: columns[18],
              CountryCodes: columns[19],
              DonationMessage: columns[20],
            }

            const unit = cleanNumber(item.UnitPrice)
            const total = cleanNumber(item.TotalPrice)
            const quantity = cleanQuantity(item.Quantity)
            const fallbackUnit = total !== null && quantity && quantity > 0 ? total / quantity : null
            const displayUnit = unit !== null ? unit : fallbackUnit
            const unitDKK = displayUnit !== null ? displayUnit * exchangeRate.value : null
            const totalDKK = total !== null ? total * exchangeRate.value : null

            item.UnitPriceValue = displayUnit
            item.TotalPriceValue = total
            item.QuantityValue = quantity
            item.UnitPriceDKKValue = unitDKK
            item.UnitPriceEUR = formatEUR(displayUnit)
            item.UnitPriceDKK = formatDKK(unitDKK)
            item.TotalPriceEUR = formatEUR(total)
            item.TotalPriceDKK = formatDKK(totalDKK)
            item.status = !item.Title
              ? 'Ugyldig post'
              : displayUnit !== null || total !== null
              ? 'OK'
              : 'Manglende pris'
            item.searchText = Object.values(item).join(' ').toLowerCase()
            return item as Item
          })
        items.value = newItems
        selectedItemId.value = null
        activeThemeId.value = null
        persist()
        void translateAll()
      }
      reader.readAsText(file, 'utf-8')
    }

    const filteredItems = computed(() => {
      return items.value.filter((item) => {
        const matchesSearch = searchText.value
          ? (item.searchText ?? '').includes(searchText.value.toLowerCase())
          : true
        if (!matchesSearch) return false
        const hasPriceFilter = filterMin.value !== null || filterMax.value !== null
        const unitPrice = currency.value === 'EUR' ? item.UnitPriceValue : item.UnitPriceDKKValue
        if (hasPriceFilter && (unitPrice === null || unitPrice === undefined)) return false
        const minOK = filterMin.value === null ? true : (unitPrice as number) >= filterMin.value
        const maxOK = filterMax.value === null ? true : (unitPrice as number) <= filterMax.value
        return minOK && maxOK
      })
    })

    const hasActiveFilters = computed(() => Boolean(searchText.value) || filterMin.value !== null || filterMax.value !== null)

    const pageCount = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage)))

    const pagedItems = computed(() => {
      const page = Math.min(Math.max(currentPage.value, 1), pageCount.value)
      const start = (page - 1) * itemsPerPage
      return filteredItems.value.slice(start, start + itemsPerPage)
    })

    watch(filteredItems, () => {
      if (currentPage.value > pageCount.value) {
        currentPage.value = pageCount.value
      }
    })

    function resetFilters() {
      searchText.value = ''
      filterMin.value = null
      filterMax.value = null
      currentPage.value = 1
    }

    function prevPage() {
      if (currentPage.value > 1) {
        currentPage.value -= 1
      }
    }

    function nextPage() {
      if (currentPage.value < pageCount.value) {
        currentPage.value += 1
      }
    }

    const selectedItem = computed(() => items.value.find((item) => item.id === selectedItemId.value) || null)

    function selectItem(id: string) {
      selectedItemId.value = id
    }

    function descText(item: Item) {
      return item.DonationMessage || item.ShortDescription || item.LongDescription || 'Ingen beskrivelse'
    }

    function heuristicLang(text: string) {
      const t = ' ' + text.toLowerCase() + ' '
      if (/[äöüß]/.test(t)) return 'de'
      const german = [' der ', ' die ', ' das ', ' und ', ' für ', ' mit ', ' nicht ', ' ist ', ' ein ', ' eine ', ' wir ', ' werden ', ' auch ', ' oder ', ' sind ', ' wird ', ' kinder ', ' menschen ', ' gegen ', ' jahr ']
      let score = 0
      for (const word of german) if (t.includes(word)) score++
      return score >= 2 ? 'de' : 'en'
    }

    let detectorPromise: Promise<any> | null = null
    function getDetector() {
      if (detectorPromise) return detectorPromise
      detectorPromise = (async () => {
        const api = (globalThis as any).LanguageDetector
        if (!api) return null
        try {
          const availability = await api.availability()
          if (availability === 'unavailable') return null
          return await api.create()
        } catch (error) {
          void error
          return null
        }
      })()
      return detectorPromise
    }

    async function detectSourceLang(text: string) {
      const detector = await getDetector()
      if (detector) {
        try {
          const results = await detector.detect(text)
          const top = results?.[0]?.detectedLanguage
          if (top === 'de') return 'de'
          if (top === 'en') return 'en'
        } catch (error) {
          void error
        }
      }
      return heuristicLang(text)
    }

    const translatorPromises: Record<string, Promise<any>> = {}
    function getTranslator(src: string) {
      if (translatorPromises[src]) return translatorPromises[src]
      translatorPromises[src] = (async () => {
        const api = (globalThis as any).Translator
        if (!api) return null
        try {
          const availability = await api.availability({ sourceLanguage: src, targetLanguage: 'da' })
          if (availability === 'unavailable') return null
          return await api.create({ sourceLanguage: src, targetLanguage: 'da' })
        } catch (error) {
          void error
          return null
        }
      })()
      return translatorPromises[src]
    }

    async function translateOnline(text: string, src: string) {
      const query = text.slice(0, 500)
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${src}|da`
      const response = await fetch(url)
      if (!response.ok) throw new Error('http')
      const data = await response.json()
      const result = data?.responseData?.translatedText
      if (!result) throw new Error('empty')
      return result as string
    }

    const daUnits: Record<string, number> = { en: 1, et: 1, to: 2, tre: 3, fire: 4, fem: 5, seks: 6, syv: 7, otte: 8, ni: 9 }
    const daTens: Record<string, number> = { tyve: 20, tredive: 30, fyrre: 40, halvtreds: 50, tres: 60, halvfjerds: 70, firs: 80, halvfems: 90 }
    const daSmall: Record<string, number> = {
      ...daUnits,
      ...daTens,
      nul: 0, ti: 10, elleve: 11, tolv: 12, tretten: 13, fjorten: 14, femten: 15,
      seksten: 16, sytten: 17, atten: 18, nitten: 19,
      hundrede: 100, hundred: 100, tusinde: 1000, tusind: 1000,
    }

    function daWord(token: string): number | null {
      const word = token.toLowerCase()
      if (word in daSmall) return daSmall[word]
      const compound = word.match(/^([a-zæøå]+)og([a-zæøå]+)$/)
      if (compound && compound[1] in daUnits && compound[2] in daTens) {
        return daUnits[compound[1]] + daTens[compound[2]]
      }
      return null
    }

    function formatDkkInline(value: number) {
      return new Intl.NumberFormat('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' kr.'
    }

    function convertEuros(text: string, item: Item) {
      const rate = exchangeRate.value
      const dkk = (euros: number) => {
        if (item.UnitPriceValue != null && Math.abs(euros - item.UnitPriceValue) < 1 && item.UnitPriceDKKValue != null) {
          return formatDkkInline(item.UnitPriceDKKValue)
        }
        if (item.TotalPriceValue != null && Math.abs(euros - item.TotalPriceValue) < 1) {
          return formatDkkInline(item.TotalPriceValue * rate)
        }
        return formatDkkInline(euros * rate)
      }
      let result = text.replace(/(?:€|EUR\b)\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?(?:€|euros?(?![a-zæøåA-ZÆØÅ])|EUR(?![a-zæøåA-ZÆØÅ]))/gi, (match, before, after) => {
        const value = cleanNumber(before ?? after)
        if (value === null || !Number.isFinite(value)) return match
        return dkk(value)
      })
      result = result.replace(/\b([a-zæøåA-ZÆØÅ]+)\s+(hundrede|hundred|tusinde|tusind)\s+euros?\b/gi, (match, mult, scale) => {
        const m = daWord(mult)
        const s = daWord(scale)
        if (m === null || s === null) return match
        return dkk(m * s)
      })
      result = result.replace(/\b([a-zæøåA-ZÆØÅ]+)\s+euros?\b/gi, (match, word) => {
        const value = daWord(word)
        if (value === null) return match
        return dkk(value)
      })
      return result
    }

    function applyTranslation(id: string, danish: string, item: Item) {
      const final = convertEuros(danish, item)
      item.descDA = final
      item.descLang = sourceLangs.value[id]
      translations.value = { ...translations.value, [id]: final }
      translationStatus.value = { ...translationStatus.value, [id]: 'done' }
      persist()
    }

    async function ensureTranslation(item: Item) {
      const id = item.id
      if (item.descDA && translations.value[id] === undefined) {
        if (item.descLang) sourceLangs.value = { ...sourceLangs.value, [id]: item.descLang }
        translations.value = { ...translations.value, [id]: item.descDA }
        translationStatus.value = { ...translationStatus.value, [id]: 'done' }
      }
      const descSource = item.DonationMessage || item.ShortDescription || item.LongDescription || ''
      const titleSource = item.Title || ''
      const needDesc = Boolean(descSource) && !item.descDA
      const needTitle = Boolean(titleSource) && !item.titleDA
      if (!needDesc && !needTitle) return
      if (needDesc) translationStatus.value = { ...translationStatus.value, [id]: 'translating' }
      try {
        const src = item.descLang || sourceLangs.value[id] || (await detectSourceLang(descSource || titleSource))
        sourceLangs.value = { ...sourceLangs.value, [id]: src }
        const translator = await getTranslator(src)
        if (needTitle) {
          item.titleDA = translator ? await translator.translate(titleSource) : await translateOnline(titleSource, src)
        }
        if (needDesc) {
          const danish = translator ? await translator.translate(descSource) : await translateOnline(descSource, src)
          applyTranslation(id, danish, item)
        } else {
          persist()
        }
      } catch (error) {
        void error
        try {
          const src = sourceLangs.value[id] || 'en'
          if (needTitle && !item.titleDA) item.titleDA = await translateOnline(titleSource, src)
          if (needDesc) {
            const danish = await translateOnline(descSource, src)
            applyTranslation(id, danish, item)
          } else {
            persist()
          }
        } catch (fallbackError) {
          void fallbackError
          if (needDesc) translationStatus.value = { ...translationStatus.value, [id]: 'unavailable' }
        }
      }
    }

    async function translateAll() {
      for (const item of items.value) {
        await ensureTranslation(item)
      }
    }

    function toggleExpand(item: Item) {
      const id = item.id
      expandedId.value = expandedId.value === id ? null : id
      if (expandedId.value === id) ensureTranslation(item)
    }

    function toggleThemesMenu() {
      themesMenuOpen.value = !themesMenuOpen.value
    }

    function showToast(message: string) {
      toast.value = message
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        toast.value = ''
      }, 1400)
    }

    function copyText(value: unknown) {
      const text = value == null ? '' : String(value).trim()
      if (!text) return
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('Kopieret'))
        .catch(() => showToast('Kunne ikke kopiere'))
    }

    function applyDark() {
      const root = document.documentElement
      if (isDark.value) root.classList.add('dark')
      else root.classList.remove('dark')
    }

    function toggleDark() {
      isDark.value = !isDark.value
      applyDark()
      try {
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      } catch (error) {
        void error
      }
    }

    onMounted(() => {
      try {
        const saved = localStorage.getItem('theme')
        isDark.value = saved
          ? saved === 'dark'
          : window.matchMedia('(prefers-color-scheme: dark)').matches
      } catch (error) {
        void error
      }
      applyDark()
      if (cloudConfigured) {
        void getCurrentUser()
          .then((user) => {
            userEmail.value = user?.email ?? null
            if (userEmail.value) void loadFromCloud()
          })
          .finally(() => {
            authReady.value = true
          })
        onAuthChange((user) => {
          const wasLoggedOut = !userEmail.value
          userEmail.value = user?.email ?? null
          if (user && wasLoggedOut) void loadFromCloud()
        })
      } else {
        authReady.value = true
      }
    })

    function removeItem(id: string) {
      items.value = items.value.filter((item) => item.id !== id)
      if (selectedItemId.value === id) selectedItemId.value = null
      if (expandedId.value === id) expandedId.value = null
      persist()
    }

    function copyLine(item: Item) {
      const text = `${item.Title}\n${item.DonationMessage || item.ShortDescription}\nEnhedspris: ${item.UnitPriceDKK}\nAntal: ${item.Quantity || '—'}\nTotalpris: ${item.TotalPriceDKK}`
      navigator.clipboard.writeText(text).catch(() => {
        alert('Kunne ikke kopiere. Prøv igen.')
      })
    }

    function createTheme() {
      themes.value.push({
        id: generateId(),
        name: newThemeName.value,
        description: '',
        createdAt: new Date().toISOString().split('T')[0],
        items: [],
      })
      newThemeName.value = ''
      persist()
    }

    function selectTheme(id: string) {
      activeThemeId.value = id
      themesMenuOpen.value = false
    }

    function addItemToTheme(itemId: string) {
      if (!activeThemeId.value) {
        alert('Vælg først et tema eller opret et nyt tema.')
        return
      }
      const theme = themes.value.find((theme) => theme.id === activeThemeId.value)
      if (!theme) return
      if (!theme.items.includes(itemId)) {
        theme.items.push(itemId)
        persist()
      }
    }

    function resetData() {
      if (!confirm('Er du sikker på, du vil nulstille alle data?')) return
      items.value = []
      themes.value = []
      selectedItemId.value = null
      activeThemeId.value = null
      searchText.value = ''
      filterMin.value = null
      filterMax.value = null
      newThemeName.value = ''
      persist()
    }

    function formatDate(value: string) {
      return value
    }

    return {
      items,
      themes,
      activeThemeId,
      expandedId,
      themesMenuOpen,
      isDark,
      toggleDark,
      cloudConfigured,
      cloudStatus,
      saveToCloud,
      loadFromCloud,
      userEmail,
      authEmail,
      authPassword,
      authMode,
      authError,
      authBusy,
      authReady,
      showLogin,
      submitAuth,
      logout,
      translations,
      translationStatus,
      sourceLangs,
      descText,
      copyText,
      toast,
      menuOpen,
      searchText,
      filterMin,
      filterMax,
      currency,
      newThemeName,
      currentPage,
      pageCount,
      pagedItems,
      filteredItems,
      hasActiveFilters,
      selectedItem,
      selectItem,
      toggleExpand,
      toggleThemesMenu,
      removeItem,
      copyLine,
      onFileChange,
      createTheme,
      selectTheme,
      addItemToTheme,
      resetFilters,
      prevPage,
      nextPage,
      resetData,
      formatDate,
    }
  },
})
</script>
