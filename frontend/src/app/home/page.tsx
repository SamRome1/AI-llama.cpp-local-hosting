'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/../lib/supabase/auth-provider'

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
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const handleStartChat = () => {
    if (selectedModel) {
      router.push(`/chat?model=${selectedModel}`)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-gray-400">Loading...</div>
      </main>
    )
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
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
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Select a Model</h2>
            <p className="text-gray-400">Choose a model to start chatting</p>
          </div>

          {/* Models Grid */}
          <div className="grid gap-4 mb-8">
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                  selectedModel === model.id
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-700 bg-zinc-900/40 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{model.name}</h3>
                    <p className="text-sm text-gray-400">{model.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedModel === model.id
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-600'
                      }`}
                    >
                      {selectedModel === model.id && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Parameters:</span>
                    <span className="ml-2 text-gray-300">{model.parameters}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Context:</span>
                    <span className="ml-2 text-gray-300">{model.contextLength}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartChat}
            disabled={!selectedModel}
            className="w-full py-3 rounded-lg bg-emerald-600 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition"
          >
            Start Chat
          </button>
        </div>
      </div>
    </main>
  )
}
