import { useEffect, useState } from 'react'
import {
  type AuthActionResult,
  type User,
  getCurrentUserProfile,
  login as signInUser,
  logout as signOutUser,
  signUp as registerUser,
  subscribeToAuthChanges,
} from '../supabaseClient'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const user = await getCurrentUserProfile()
        if (isMounted) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error loading authenticated user:', error)
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    initializeAuth()

    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!isMounted) {
        return
      }

      setCurrentUser(user)
      setIsAuthLoading(false)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const user = await signInUser(email, password)
    setCurrentUser(user)
    return user
  }

  const signUp = async (email: string, name: string, password: string): Promise<AuthActionResult> => {
    const result = await registerUser(email, name, password)

    if (result.user) {
      setCurrentUser(result.user)
    }

    return result
  }

  const logout = async () => {
    await signOutUser()
    setCurrentUser(null)
  }

  return {
    currentUser,
    isAuthLoading,
    login,
    signUp,
    logout,
    setCurrentUser,
  }
}
