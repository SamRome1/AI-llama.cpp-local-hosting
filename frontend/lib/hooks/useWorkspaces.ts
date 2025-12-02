'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/../lib/supabase/client'

export type Workspace = {
  id: string
  name: string
  modelId: string
  modelName: string
  createdAt: string
  lastUsed?: string
  userId?: string
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load workspaces from Supabase on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoaded(true)
          return
        }

        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('user_id', user.id)
          .order('last_used', { ascending: false, nullsFirst: false })

        if (error) {
          console.error('Failed to load workspaces:', error.message || JSON.stringify(error))
          setError(error.message || 'Failed to load workspaces')
        } else {
          setWorkspaces(
            (data || []).map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              modelId: ws.model_id,
              modelName: ws.model_name,
              createdAt: ws.created_at,
              lastUsed: ws.last_used,
              userId: ws.user_id,
            }))
          )
        }
      } catch (err) {
        console.error('Error loading workspaces:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoaded(true)
      }
    }

    loadWorkspaces()
  }, [supabase])

  const createWorkspace = async (
    name: string,
    modelId: string,
    modelName: string
  ): Promise<Workspace | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not authenticated')
        return null
      }

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          user_id: user.id,
          name,
          model_id: modelId,
          model_name: modelName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create workspace:', error.message || JSON.stringify(error))
        setError(error.message || 'Unknown error creating workspace')
        return null
      }

      const workspace: Workspace = {
        id: data.id,
        name: data.name,
        modelId: data.model_id,
        modelName: data.model_name,
        createdAt: data.created_at,
        userId: data.user_id,
      }

      setWorkspaces([workspace, ...workspaces])
      return workspace
    } catch (err) {
      console.error('Error creating workspace:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  const updateLastUsed = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ last_used: new Date().toISOString() })
        .eq('id', workspaceId)

      if (error) {
        console.error('Failed to update last used:', error.message || JSON.stringify(error))
        setError(error.message || 'Failed to update last used')
      } else {
        setWorkspaces(
          workspaces.map((ws) =>
            ws.id === workspaceId
              ? { ...ws, lastUsed: new Date().toISOString() }
              : ws
          )
        )
      }
    } catch (err) {
      console.error('Error updating last used:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)

      if (error) {
        console.error('Failed to delete workspace:', error.message || JSON.stringify(error))
        setError(error.message || 'Failed to delete workspace')
      } else {
        setWorkspaces(workspaces.filter((ws) => ws.id !== workspaceId))
      }
    } catch (err) {
      console.error('Error deleting workspace:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return {
    workspaces,
    isLoaded,
    error,
    createWorkspace,
    updateLastUsed,
    deleteWorkspace,
  }
}
