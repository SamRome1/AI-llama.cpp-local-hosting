import { createClient } from './server'

export async function getUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getUserSession() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
