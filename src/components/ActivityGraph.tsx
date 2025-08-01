'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { ActivityData } from '@/types'

interface Props {
  theme: 'dark' | 'weirdo'
  data: ActivityData[]
  onDotClick?: (data: unknown) => void
  showTooltip?: boolean
  tooltipContent?: (data: unknown, date: Date) => React.ReactNode
  title?: string
  subtitle?: string
  compact?: boolean
}

export default function ActivityGraph({ 
  theme, 
  data, 
  onDotClick, 
  showTooltip = false, 
  tooltipContent,
  title = 'Activity',
  subtitle = '52 weeks',
  compact = false
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [weekCount, setWeekCount] = useState(52)
  
  useEffect(() => {
    const updateWeekCount = () => {
      if (!containerRef.current) return
      
      const containerWidth = containerRef.current.offsetWidth
      const minDotSize = 9
      const minGap = 3
      const dayLabelWidth = 24
      const padding = 20
      
      const availableWidth = containerWidth - dayLabelWidth - padding
      const dotAndGapWidth = minDotSize + minGap
      
      // Calculate max weeks that fit
      const maxWeeks = Math.floor(availableWidth / dotAndGapWidth)
      
      // Set week count based on container width with responsive breakpoints
      if (compact || containerWidth < 400) {
        setWeekCount(Math.min(12, maxWeeks)) // 3 months for very small screens
      } else if (containerWidth < 600) {
        setWeekCount(Math.min(26, maxWeeks)) // 6 months for small screens
      } else if (containerWidth < 800) {
        setWeekCount(Math.min(39, maxWeeks)) // 9 months for medium screens
      } else {
        setWeekCount(Math.min(52, maxWeeks)) // Full year for large screens
      }
    }
    
    updateWeekCount()
    
    const resizeObserver = new ResizeObserver(updateWeekCount)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [compact])
  
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date()
    const weeks = []
    const months = new Map()
    
    // Map data by date
    const dataByDate = new Map()
    data.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0]
      dataByDate.set(dateKey, item)
    })
    
    // Start from weekCount weeks ago, on a Sunday
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (weekCount * 7) - today.getDay())
    
    // Generate exactly weekCount weeks
    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      const week = []
      
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + (weekIndex * 7) + dayIndex)
        
        const dateKey = currentDate.toISOString().split('T')[0]
        const dayData = dataByDate.get(dateKey)
        
        // Track month positions - only add if it's a new month
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 7)
        const prevMonthKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`
        
        if (!months.has(monthKey) && monthKey !== prevMonthKey && currentDate <= today) {
          months.set(monthKey, { 
            month: currentDate.getMonth(), 
            weekIndex 
          })
        }
        
        week.push({
          date: currentDate,
          intensity: dayData?.intensity || 0,
          data: dayData?.data || null,
          isInFuture: currentDate > today
        })
      }
      
      weeks.push(week)
    }
    
    // Generate month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthLabelArray = Array.from(months.values()).map(({ month, weekIndex }) => ({
      label: monthNames[month],
      weekIndex
    }))
    
    return { weeks, monthLabels: monthLabelArray }
  }, [data, weekCount])
  
  const weekDays = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className={`mt-3 pt-3 border-t ${
      theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs ${
          theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
        }`}>{title}</span>
        <span className={`text-xs ${
          theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
        }`}>{subtitle}</span>
      </div>
      
      <div className="relative">
        <div className="w-full overflow-x-auto activity-graph-scroll">
          <div className="inline-block min-w-max">
            {/* Month labels */}
            <div className="relative h-4 mb-1 ml-9" style={{ width: `${52 * 9 + (52 - 1) * 3}px` }}>
              {monthLabels.map((label, i) => (
                <div
                  key={i}
                  className={`text-xs absolute ${
                    theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                  }`}
                  style={{ 
                    left: `${label.weekIndex * 9 + label.weekIndex * 3}px`
                  }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={`text-[10px] h-[9px] flex items-center justify-end pr-1 ${
                    theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                  }`}
                  style={{ width: '24px' }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Activity grid */}
            <div className="grid grid-cols-52 gap-[3px]" style={{ width: 'max-content' }}>
              {weeks.map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const { date, intensity, data, isInFuture } = day
                  
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`} 
                      className="relative group"
                      style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }}
                    >
                      <div
                        className={`rounded-sm transition-all h-[9px] w-[9px] ${
                          isInFuture ? 'opacity-0' :
                          data && onDotClick ? 'cursor-pointer' : ''
                        } ${
                          theme === 'dark'
                            ? intensity > 0.75 ? 'bg-green-400 hover:ring-2 hover:ring-green-400' 
                              : intensity > 0.5 ? 'bg-green-500 hover:ring-2 hover:ring-green-500'
                              : intensity > 0.25 ? 'bg-green-600 hover:ring-2 hover:ring-green-600'
                              : intensity > 0 ? 'bg-green-800 hover:ring-2 hover:ring-green-800'
                              : 'bg-[#161b22]'
                            : intensity > 0.75 ? 'bg-green-500 hover:ring-2 hover:ring-green-500' 
                              : intensity > 0.5 ? 'bg-green-400 hover:ring-2 hover:ring-green-400'
                              : intensity > 0.25 ? 'bg-green-300 hover:ring-2 hover:ring-green-300'
                              : intensity > 0 ? 'bg-green-200 hover:ring-2 hover:ring-green-200'
                              : 'bg-gray-100'
                        }`}
                        onClick={() => data && onDotClick && onDotClick(data)}
                      />
                      
                      {/* Tooltip */}
                      {showTooltip && data && tooltipContent && !isInFuture && (
                        <div className={`absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                          px-3 py-2 rounded-md text-xs whitespace-nowrap ${
                          theme === 'dark' 
                            ? 'bg-[#161b22] border border-[#30363d] text-[#c9d1d9]' 
                            : 'bg-white border border-gray-200 shadow-lg'
                        }`}>
                          {tooltipContent(data, date)}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                            border-l-4 border-r-4 border-t-4 ${
                            theme === 'dark' ? 'border-t-[#161b22]' : 'border-t-white'
                          } border-l-transparent border-r-transparent`} />
                        </div>
                      )}
                    </div>
                  )
                })
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}