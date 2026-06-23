import { createClient, type User } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured ? createClient(url as string, key as string) : null

export interface ListSnapshot {
  items: unknown[]
  themes: unknown[]
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function loadList(): Promise<ListSnapshot | null> {
  if (!supabase) return null
  const user = await getCurrentUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('items, themes')
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { items: data.items ?? [], themes: data.themes ?? [] }
}

export async function saveList(snapshot: ListSnapshot): Promise<void> {
  if (!supabase) throw new Error('Supabase er ikke konfigureret')
  const user = await getCurrentUser()
  if (!user) throw new Error('Du skal være logget ind')
  const { error } = await supabase.from('shopping_lists').upsert({
    id: user.id,
    items: snapshot.items,
    themes: snapshot.themes,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
