import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Activity {
  id?: string
  date: string
  performer: string
  problem: string
  action: string
  comments: string
  created_at?: string
}

export async function getActivities() {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

export async function createActivity(activity: Activity) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error creating activity:', error)
    throw error
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update(activity)
      .eq('id', id)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error updating activity:', error)
    throw error
  }
}

export async function deleteActivity(id: string) {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw error
  }
}
