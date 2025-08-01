'use client'

import { useEffect, useRef } from 'react'

interface TwitchPlayerProps {
  videoId?: string
  channel?: string
  width?: number
  height?: number
  autoplay?: boolean
  muted?: boolean
}

declare global {
  interface Window {
    Twitch: {
      Player: new (elementId: string, options: any) => {
        setVolume: (volume: number) => void
        addEventListener: (event: string, callback: () => void) => void
        pause: () => void
        play: () => void
        destroy: () => void
      }
    }
  }
}

export default function TwitchPlayer({ 
  videoId, 
  channel, 
  width = 640, 
  height = 360, 
  autoplay = false,
  muted = true 
}: TwitchPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const twitchPlayerRef = useRef<any>(null)
  const playerIdRef = useRef(`twitch-player-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    const loadTwitchPlayer = () => {
      if (!playerRef.current) return

      // Clean up existing player
      if (twitchPlayerRef.current) {
        try {
          twitchPlayerRef.current.destroy()
        } catch (e) {
          console.warn('Error destroying Twitch player:', e)
        }
      }

      const options: any = {
        width: '100%',
        height: '100%',
        autoplay,
        muted,
        parent: [window.location.hostname, 'localhost']
      }

      if (videoId) {
        options.video = videoId
      } else if (channel) {
        options.channel = channel
      }

      try {
        twitchPlayerRef.current = new window.Twitch.Player(playerIdRef.current, options)
        
        twitchPlayerRef.current.addEventListener('ready', () => {
          console.log('Twitch player ready')
        })
      } catch (error) {
        console.error('Failed to create Twitch player:', error)
      }
    }

    const loadScript = () => {
      if (window.Twitch) {
        loadTwitchPlayer()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://player.twitch.tv/js/embed/v1.js'
      script.onload = loadTwitchPlayer
      script.onerror = () => console.error('Failed to load Twitch embed script')
      document.head.appendChild(script)
    }

    loadScript()

    return () => {
      if (twitchPlayerRef.current) {
        try {
          twitchPlayerRef.current.destroy()
        } catch (e) {
          console.warn('Error destroying Twitch player on cleanup:', e)
        }
      }
    }
  }, [videoId, channel, width, height, autoplay, muted])

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div 
        ref={playerRef}
        id={playerIdRef.current}
        className="absolute top-0 left-0 w-full h-full rounded overflow-hidden"
      />
    </div>
  )
}