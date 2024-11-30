import { createSupabaseServerClient } from './server'

export const checkDatabaseConnection = async () => {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      throw error
    }
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}
