'use client'

import { useMemo } from 'react'
import ActivityGraph from './ActivityGraph'
import { TwitchDataResponse, TwitchStream } from '@/types'

interface StreamClickData {
  id: string
  title: string
  date: string
  duration: number
  viewers: number
  url: string
  thumbnail: string
  type: 'vod' | 'live'
}

interface Props {
  theme: 'dark' | 'weirdo'
  twitchData: TwitchDataResponse | null
  onStreamClick: (stream: StreamClickData) => void
}

export default function StreamingActivityGraph({ theme, twitchData, onStreamClick }: Props) {
  const activityData = useMemo(() => {
    if (!twitchData?.streamingActivity) return []
    
    return twitchData.streamingActivity.map(stream => ({
      date: stream.date,
      intensity: Math.min(stream.duration / 8, 1), // Normalize to 0-1 based on 8 hour max
      data: stream
    }))
  }, [twitchData])

  const handleDotClick = (stream: TwitchStream) => {
    onStreamClick({
      ...stream,
      date: stream.date.toLocaleDateString(),
      duration: Math.round(stream.duration),
      viewers: stream.viewCount
    })
  }

  const tooltipContent = (stream: TwitchStream, date: Date) => (
    <>
      <div className="font-semibold">{stream.title}</div>
      <div className={theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}>
        {date.toLocaleDateString()} • {Math.round(stream.duration)}h • {stream.viewCount} views
      </div>
      {stream.type === 'live' && (
        <div className="text-red-500 text-xs mt-1">● LIVE NOW</div>
      )}
    </>
  )

  return (
    <ActivityGraph
      theme={theme}
      data={activityData}
      onDotClick={handleDotClick}
      showTooltip={true}
      tooltipContent={tooltipContent}
      title="Streaming Activity"
      subtitle={`${twitchData?.totalStreams || 0} streams`}
    />
  )
}