import type { AudioConfig, MusicTrack } from './types'

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
  musicTrackId: 'motivational-1',
  musicVolume: 0.3,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMusicTrack(trackId: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((t) => t.id === trackId)
}
