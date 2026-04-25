'use client'

import { useState } from 'react'
import { Scene } from '@/lib/types'

interface SceneCardProps {
  scene: Scene
  onTextChange: (text: string) => void
}

export function SceneCard({ scene, onTextChange }: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(scene.text)

  const handleTextChange = (newText: string) => {
    if (newText.length <= scene.maxChars) {
      setText(newText)
      onTextChange(newText)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const charCount = text.length
  const isNearLimit = charCount > scene.maxChars - 20
  const isAtLimit = charCount === scene.maxChars

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
      {/* Frozen header - Zone 1 */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="text-xs font-mono text-white/50 uppercase tracking-wide">
          Scene {scene.id} · {scene.label}
        </div>
      </div>

      {/* Editable text body - Zone 2 */}
      <div className="px-4 py-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/40 font-sans text-sm resize-none focus:outline-none focus:border-indigo-600/50 focus:bg-white/10"
              style={{ height: `${Math.min(4, Math.ceil(text.length / 60)) * 24 + 12}px` }}
            />
            <div className="flex justify-end">
              <span
                className={`text-xs font-mono ${
                  isAtLimit
                    ? 'text-red-400'
                    : isNearLimit
                      ? 'text-indigo-400'
                      : 'text-white/40'
                }`}
              >
                {charCount} / {scene.maxChars}
              </span>
            </div>
          </div>
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="text-white text-sm leading-relaxed cursor-text hover:bg-white/5 rounded px-2 py-1 transition-colors"
          >
            {text}
          </p>
        )}
      </div>
    </div>
  )
}
