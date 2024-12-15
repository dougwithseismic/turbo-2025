import { createSupabaseServerClient } from './server'

export const checkDatabaseConnection = async () => {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      throw error
    }
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}
