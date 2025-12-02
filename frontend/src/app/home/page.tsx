'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/../lib/supabase/auth-provider'
import { useWorkspaces, type Workspace } from '@/../lib/hooks/useWorkspaces'

type Model = {
  id: string
  name: string
  description: string
  parameters: string
  contextLength: string
}

const AVAILABLE_MODELS: Model[] = [
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B',
    description: 'A 20 billion parameter open-source language model running locally on your machine',
    parameters: '20B',
    contextLength: '4096 tokens',
  },
]

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { workspaces, isLoaded, createWorkspace, updateLastUsed, deleteWorkspace } = useWorkspaces()
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const handleStartChat = (workspace?: Workspace) => {
    if (workspace) {
      updateLastUsed(workspace.id)
      router.push(`/chat?workspace=${workspace.id}&model=${workspace.modelId}`)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!selectedModel || !workspaceName.trim()) return

    setCreating(true)
    const model = AVAILABLE_MODELS.find((m) => m.id === selectedModel)
    if (model) {
      const workspace = await createWorkspace(workspaceName.trim(), selectedModel, model.name)
      if (workspace) {
        setWorkspaceName('')
        setSelectedModel(null)
        setShowCreateForm(false)
        
        // Start chat with new workspace
        handleStartChat(workspace)
      }
    }
    setCreating(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-gray-400">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GPT-OSS Local Chat</h1>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg bg-red-600/20 border border-red-700 text-red-400 hover:bg-red-600/30 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Continue Chatting Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Continue Chatting</h2>
              <p className="text-gray-400">Resume your existing conversations</p>
            </div>

            {isLoaded && workspaces.length > 0 ? (
              <div className="space-y-3">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => handleStartChat(workspace)}
                    className="p-4 rounded-lg border border-gray-700 bg-zinc-900/40 hover:bg-zinc-900/60 cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-400">{workspace.modelName}</p>
                        {workspace.lastUsed && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last used: {new Date(workspace.lastUsed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWorkspace(workspace.id)
                        }}
                        className="text-gray-400 hover:text-red-400 transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : isLoaded ? (
              <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center">
                <p className="text-gray-400">No workspaces yet</p>
                <p className="text-sm text-gray-500 mt-1">Create a new workspace to get started</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400">Loading...</p>
              </div>
            )}
          </div>

          {/* Create New Workspace Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Create New Workspace</h2>
              <p className="text-gray-400">Start a fresh conversation with a new name</p>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-8 border-2 border-dashed border-emerald-600/50 rounded-lg hover:border-emerald-500 hover:bg-emerald-900/10 transition group"
              >
                <svg className="w-12 h-12 mx-auto mb-3 text-emerald-600 group-hover:text-emerald-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="font-semibold text-emerald-600 group-hover:text-emerald-500">Create Workspace</p>
              </button>
            ) : (
              <div className="border border-gray-700 rounded-lg bg-zinc-900/40 p-6">
                <h3 className="font-semibold mb-4">New Workspace</h3>

                {/* Workspace Name Input */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Workspace Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g., Daily Chat, Coding Model, Research"
                    className="w-full px-3 py-2 bg-black/70 border border-gray-700 rounded-lg text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Model Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Select Model</label>
                  <div className="space-y-2">
                    {AVAILABLE_MODELS.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          selectedModel === model.id
                            ? 'border-emerald-500 bg-emerald-900/20'
                            : 'border-gray-700 bg-black/40 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                              selectedModel === model.id
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-gray-600'
                            }`}
                          >
                            {selectedModel === model.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setWorkspaceName('')
                      setSelectedModel(null)
                    }}
                    className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-900/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkspace}
                    disabled={!selectedModel || !workspaceName.trim() || creating}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 font-medium disabled:opacity-50 hover:bg-emerald-700 transition"
                  >
                    {creating ? 'Creating...' : 'Create & Chat'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
