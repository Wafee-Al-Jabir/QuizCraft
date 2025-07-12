"use client"

import { useEffect, useRef } from 'react'

// Sound effect types
export type SoundType = 
  | 'correct' 
  | 'incorrect' 
  | 'achievement' 
  | 'levelUp' 
  | 'click' 
  | 'whoosh' 
  | 'pop' 
  | 'celebration'
  | 'streak'
  | 'powerUp'

// Sound URLs (using Web Audio API compatible sounds)
const SOUND_URLS: Record<SoundType, string> = {
  correct: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  incorrect: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  achievement: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  levelUp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  whoosh: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  pop: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  celebration: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  streak: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
  powerUp: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private enabled: boolean = true
  private volume: number = 0.3

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext()
    }
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await this.loadSounds()
    } catch (error) {
      console.warn('Audio context initialization failed:', error)
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return

    for (const [soundType, url] of Object.entries(SOUND_URLS)) {
      try {
        // For demo purposes, we'll create simple tones instead of loading actual files
        const buffer = this.createToneBuffer(soundType as SoundType)
        this.sounds.set(soundType as SoundType, buffer)
      } catch (error) {
        console.warn(`Failed to load sound ${soundType}:`, error)
      }
    }
  }

  private createToneBuffer(soundType: SoundType): AudioBuffer {
    if (!this.audioContext) throw new Error('No audio context')

    const sampleRate = this.audioContext.sampleRate
    const duration = this.getDuration(soundType)
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    const { frequency, type } = this.getSoundConfig(soundType)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 3) // Exponential decay
      
      switch (type) {
        case 'sine':
          data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope
          break
        case 'square':
          data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * envelope
          break
        case 'noise':
          data[i] = (Math.random() * 2 - 1) * envelope
          break
        default:
          data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope
      }
    }

    return buffer
  }

  private getDuration(soundType: SoundType): number {
    const durations: Record<SoundType, number> = {
      correct: 0.3,
      incorrect: 0.5,
      achievement: 0.8,
      levelUp: 1.0,
      click: 0.1,
      whoosh: 0.4,
      pop: 0.2,
      celebration: 1.5,
      streak: 0.4,
      powerUp: 0.6
    }
    return durations[soundType] || 0.3
  }

  private getSoundConfig(soundType: SoundType): { frequency: number; type: 'sine' | 'square' | 'noise' } {
    const configs: Record<SoundType, { frequency: number; type: 'sine' | 'square' | 'noise' }> = {
      correct: { frequency: 800, type: 'sine' },
      incorrect: { frequency: 200, type: 'square' },
      achievement: { frequency: 600, type: 'sine' },
      levelUp: { frequency: 1000, type: 'sine' },
      click: { frequency: 1200, type: 'sine' },
      whoosh: { frequency: 400, type: 'noise' },
      pop: { frequency: 800, type: 'square' },
      celebration: { frequency: 700, type: 'sine' },
      streak: { frequency: 900, type: 'sine' },
      powerUp: { frequency: 1100, type: 'sine' }
    }
    return configs[soundType] || { frequency: 440, type: 'sine' }
  }

  async play(soundType: SoundType, volume?: number) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundType)) {
      return
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const buffer = this.sounds.get(soundType)!
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = (volume ?? this.volume) * 0.5

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      source.start()
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error)
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

// Global sound manager instance
let soundManager: SoundManager | null = null

if (typeof window !== 'undefined') {
  soundManager = new SoundManager()
}

// Hook for using sound effects
export function useSoundEffects() {
  const playSound = (soundType: SoundType, volume?: number) => {
    soundManager?.play(soundType, volume)
  }

  const setEnabled = (enabled: boolean) => {
    soundManager?.setEnabled(enabled)
  }

  const setVolume = (volume: number) => {
    soundManager?.setVolume(volume)
  }

  const isEnabled = () => {
    return soundManager?.isEnabled() ?? false
  }

  return {
    playSound,
    setEnabled,
    setVolume,
    isEnabled
  }
}

// Component for sound settings
export function SoundSettings() {
  const { isEnabled, setEnabled, setVolume } = useSoundEffects()
  const volumeRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Sound Settings</h3>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sound-enabled"
          checked={isEnabled()}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="sound-enabled" className="text-sm">
          Enable sound effects
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="volume" className="text-sm font-medium">
          Volume
        </label>
        <input
          ref={volumeRef}
          type="range"
          id="volume"
          min="0"
          max="1"
          step="0.1"
          defaultValue="0.3"
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}