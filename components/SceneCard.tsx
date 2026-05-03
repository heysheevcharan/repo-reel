'use client'

import { useState } from 'react'
import { ScriptScene } from '@/lib/types'

interface SceneCardProps {
  scene: ScriptScene
  assignedTemplateId?: string
  onTextChange: (text: string) => void
}

const MAX_CHARS = 200

export function SceneCard({ scene, assignedTemplateId, onTextChange }: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(scene.narrative)

  const handleTextChange = (newText: string) => {
    if (newText.length <= MAX_CHARS) {
      setText(newText)
      onTextChange(newText)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const charCount = text.length
  const isNearLimit = charCount > MAX_CHARS - 20
  const isAtLimit = charCount === MAX_CHARS

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
      {/* Frozen header */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-white/50 uppercase tracking-wide">
              {scene.title}
            </div>
            {assignedTemplateId && (
              <div className="px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                {assignedTemplateId}
              </div>
            )}
          </div>
          <div className="text-xs font-mono text-white/40">
            {scene.duration}s
          </div>
        </div>
      </div>

      {/* Editable narrative text */}
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
                {charCount} / {MAX_CHARS}
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

      {/* Visuals metadata */}
      <div className="px-4 py-3 border-t border-white/5 bg-white/2">
        <div className="text-xs text-white/40 font-mono">
          Visuals: {scene.visuals}
        </div>
      </div>
    </div>
  )
}
