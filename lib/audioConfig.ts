import type { AudioConfig, MusicTrack, VoiceStyle } from './types'

// ─── Voice Styles ─────────────────────────────────────────────────────────────

export const VOICE_STYLES: { id: VoiceStyle; label: string; desc: string }[] = [
  { id: 'confident',  label: 'Confident',  desc: 'Clear and authoritative' },
  { id: 'casual',     label: 'Casual',     desc: 'Friendly and relaxed' },
  { id: 'cinematic',  label: 'Cinematic',  desc: 'Dramatic and epic' },
  { id: 'energetic',  label: 'Energetic',  desc: 'High energy, fast-paced' },
]

// ─── Curated Music Tracks ─────────────────────────────────────────────────────

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'motivational-1',
    label: 'Motivational',
    url: 'https://img-org-bucket-2025.s3.ap-south-1.amazonaws.com/remotion-audios/Motivational.wav',
  },
  {
    id: 'motivational-2',
    label: 'Motivational II',
    url: 'https://img-org-bucket-2025.s3.ap-south-1.amazonaws.com/remotion-audios/Motivational-2.wav',
  },
  {
    id: 'none',
    label: 'No Music',
    url: '',
  },
]

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  voiceStyle: 'confident',
  musicTrackId: 'motivational-1',
  voiceVolume: 1.0,
  musicVolume: 0.3,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMusicTrack(trackId: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((t) => t.id === trackId)
}
