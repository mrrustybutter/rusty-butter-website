'use client'

import { useMemo } from 'react'
import ActivityGraph from './ActivityGraph'

interface CommitWeek {
  week: number // Unix timestamp
  days: number[] // 7 days, starting Sunday
  total: number
}

interface Props {
  theme: 'dark' | 'weirdo'
  commitActivity: CommitWeek[]
  repoName: string
}

export default function RepoActivityGraph({ theme, commitActivity }: Props) {
  const activityData = useMemo(() => {
    const data: Array<{date: Date, intensity: number, data: {commits: number}}> = []
    
    commitActivity.forEach(week => {
      const weekStart = new Date(week.week * 1000)
      
      week.days.forEach((commits, dayIndex) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + dayIndex)
        
        if (commits > 0) {
          data.push({
            date,
            intensity: Math.min(commits / 10, 1), // Normalize based on 10 commits max
            data: { commits }
          })
        }
      })
    })
    
    return data
  }, [commitActivity])

  const totalCommits = commitActivity.reduce((total, week) => total + week.total, 0)

  const tooltipContent = (data: unknown, date: Date) => {
    const commitData = data as {commits: number}
    return (
      <div>
        {commitData.commits} commits on {date.toLocaleDateString()}
      </div>
    )
  }

  return (
    <ActivityGraph
      theme={theme}
      data={activityData}
      showTooltip={true}
      tooltipContent={tooltipContent}
      title="Activity"
      subtitle={`${totalCommits} commits in the last year`}
    />
  )
}