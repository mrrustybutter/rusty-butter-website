import { NextResponse } from 'next/server'

const GITHUB_USERNAME = 'mrrustybutter'

async function fetchWithAuth(url: string) {
  const token = process.env.GITHUB_TOKEN
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'rusty-butter-website',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    // Cache for 5 minutes
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const repoName = searchParams.get('repo')
    
    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      )
    }
    
    console.log(`[API] 📊 Fetching commit activity for ${repoName}...`)
    
    // Check rate limit first
    try {
      const rateLimit = await fetchWithAuth('https://api.github.com/rate_limit')
      const remaining = rateLimit.rate.remaining
      
      console.log(`[API] 📊 GitHub API Rate Limit: ${remaining}/${rateLimit.rate.limit} remaining`)
      
      if (remaining < 5) {
        return NextResponse.json(
          { error: 'Rate limit too low', remaining },
          { status: 429 }
        )
      }
    } catch (error) {
      console.warn('[API] Could not check rate limit, continuing...')
    }
    
    // Fetch commit activity
    const data = await fetchWithAuth(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/stats/commit_activity`)
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`[API] No commit activity data for ${repoName}`)
      return NextResponse.json({
        repoName,
        commitActivity: null,
        message: 'No commit activity data available'
      })
    }
    
    // Transform GitHub API format to our format
    const transformedActivity = data.map(week => ({
      week: week.week,
      days: week.days || [0, 0, 0, 0, 0, 0, 0],
      total: week.total || 0
    }))
    
    const totalCommits = transformedActivity.reduce((sum, week) => sum + week.total, 0)
    console.log(`[API] ✅ ${repoName}: ${totalCommits} commits in the last year`)
    
    return NextResponse.json({
      repoName,
      commitActivity: transformedActivity,
      totalCommits,
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[API] ❌ Error fetching commit activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commit activity', message: (error as Error).message },
      { status: 500 }
    )
  }
}