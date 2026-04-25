'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AgentLog } from './AgentLog'
import { Check } from 'lucide-react'

interface ProgressStep {
  id: number
  label: string
  subLabel: string
  completeTime: number
}

const STEPS: ProgressStep[] = [
  {
    id: 1,
    label: 'Reading your repo',
    subLabel: 'Pulling README, file structure, tech stack, and logo...',
    completeTime: 3000,
  },
  {
    id: 2,
    label: 'Researching the market',
    subLabel: 'Finding similar tools and what makes yours different...',
    completeTime: 6000,
  },
  {
    id: 3,
    label: 'Writing your script',
    subLabel: 'Crafting hook, problem, solution, unique angle, and CTA...',
    completeTime: 9000,
  },
  {
    id: 4,
    label: 'Rendering your video',
    subLabel: 'Building your video scene by scene...',
    completeTime: 12000,
  },
]

interface ProgressScreenProps {
  repoName: string
  onComplete: () => void
  onBack: () => void
}

export function ProgressScreen({
  repoName,
  onComplete,
  onBack,
}: ProgressScreenProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    // Set first step as active immediately
    setActiveStep(1)

    // Mark steps complete at their respective times
    STEPS.forEach((step) => {
      const timeout = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id])
        if (step.id < STEPS.length) {
          setActiveStep(step.id + 1)
        }
      }, step.completeTime)
      timeouts.push(timeout)
    })

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 12000)
    timeouts.push(completeTimeout)

    return () => {
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [onComplete])

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-gradient-to-b from-background to-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/5"
        >
          ← Back
        </Button>
        <div className="text-xs font-mono text-white/50">{repoName}</div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
        {/* Left column - Timeline */}
        <div className="flex flex-col gap-6">
          {STEPS.map((step) => {
            const isComplete = completedSteps.includes(step.id)
            const isActive = activeStep === step.id

            return (
              <div key={step.id} className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {isComplete ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-600 animate-pulse"></div>
                      <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-indigo-600/30 animate-ping"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/20"></div>
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`text-sm font-semibold uppercase tracking-tight ${
                      isComplete
                        ? 'text-white/60'
                        : isActive
                          ? 'text-white'
                          : 'text-white/40'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isActive && (
                    <div className="text-xs text-white/50 font-mono">
                      {step.subLabel}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right column - Agent log */}
        <AgentLog repoName={repoName} onComplete={onComplete} />
      </div>
    </div>
  )
}
