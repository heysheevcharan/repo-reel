import { RepoData } from './types'

export const bufferMockData: RepoData = {
  repoId: 'samirpatil2000/Buffer',
  name: 'Buffer',
  description: 'A lightweight, privacy-focused clipboard manager for macOS',
  logoUrl: null,
  screenshotUrls: [],
  techStack: ['Swift', 'SwiftUI', 'AppKit', 'Shell'],
  competitors: [
    { name: 'Paste' },
    { name: 'Maccy' },
    { name: 'CopyClip' },
    { name: 'Clipboard Manager' },
  ],
  uniqueAngle:
    'Privacy-first clipboard with Vision OCR. Everything stays on device. No cloud, no account, no sync.',
  scenes: [
    {
      id: '1',
      type: 'hook',
      label: 'Hook',
      text: 'Your clipboard is a graveyard. You copy something, copy something else, and the first thing is gone forever.',
      maxChars: 140,
      durationSeconds: 8,
    },
    {
      id: '2',
      type: 'problem',
      label: 'Problem',
      text: 'macOS gives you one clipboard slot. Every time you copy, you lose what came before. For developers and power users, that\'s not a workflow — that\'s a tax.',
      maxChars: 200,
      durationSeconds: 10,
    },
    {
      id: '3',
      type: 'solution',
      label: 'Solution',
      text: 'Buffer is a lightweight macOS clipboard manager that lives in your menu bar. Press ⇧⌘V and every text and image you\'ve copied is right there, searchable, ready to paste.',
      maxChars: 200,
      durationSeconds: 12,
    },
    {
      id: '4',
      type: 'unique-angle',
      label: 'Unique Angle',
      text: 'Unlike cloud clipboard tools, Buffer never leaves your Mac. No account, no sync, no server. Version 1.4 adds Vision OCR — search clipboard history by the text inside images.',
      maxChars: 200,
      durationSeconds: 12,
    },
    {
      id: '5',
      type: 'social-proof',
      label: 'Social Proof',
      text: 'Open source. Native Swift. macOS 13+. Available now on GitHub with a one-click DMG download.',
      maxChars: 160,
      durationSeconds: 8,
    },
    {
      id: '6',
      type: 'cta',
      label: 'CTA',
      text: 'Star it on GitHub. Download the DMG. Your clipboard history starts the moment you launch it.',
      maxChars: 120,
      durationSeconds: 8,
    },
  ],
  totalDurationSeconds: 58,
}
