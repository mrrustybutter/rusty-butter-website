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
    // Add cache control
    next: { revalidate: 300 } // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchCommitActivity(owner: string, repo: string) {
  try {
    console.log(`[API] Fetching commit activity for ${repo}...`)
    
    const data = await fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`)
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`[API] No commit activity data for ${repo}`)
      return null
    }
    
    const transformedActivity = data.map(week => ({
      week: week.week,
      days: week.days || [0, 0, 0, 0, 0, 0, 0],
      total: week.total || 0
    }))
    
    const totalCommits = transformedActivity.reduce((sum, week) => sum + week.total, 0)
    console.log(`[API] ${repo}: ${totalCommits} commits in the last year`)
    
    return transformedActivity
    
  } catch (error) {
    console.warn(`[API] Error fetching commit activity for ${repo}:`, error)
    return null
  }
}

export async function GET() {
  try {
    console.log('[API] 🚀 Starting live GitHub data fetch...')
    
    // Check rate limit first
    try {
      const rateLimit = await fetchWithAuth('https://api.github.com/rate_limit')
      const remaining = rateLimit.rate.remaining
      
      console.log(`[API] 📊 GitHub API Rate Limit: ${remaining}/${rateLimit.rate.limit} remaining`)
      
      if (remaining < 10) {
        return NextResponse.json(
          { error: 'Rate limit too low', remaining },
          { status: 429 }
        )
      }
    } catch (error) {
      console.warn('[API] Could not check rate limit, continuing...')
    }
    
    // Fetch all repositories
    console.log(`[API] 🔍 Fetching all repositories for ${GITHUB_USERNAME}...`)
    const repos = await fetchWithAuth(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=50&page=1&type=owner`)
    
    // Filter and sort repos
    const filteredRepos = repos
      .filter((repo: any) => !repo.fork && repo.stargazers_count >= 0)
      .sort((a: any, b: any) => {
        if (a.stargazers_count !== b.stargazers_count) {
          return b.stargazers_count - a.stargazers_count
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
      .slice(0, 6)
    
    console.log(`[API] 📚 Found ${filteredRepos.length} public repositories`)
    
    // Process the repositories with commit activity for the first 3
    const reposWithActivity = []
    
    for (let i = 0; i < filteredRepos.length; i++) {
      const repo = filteredRepos[i]
      
      let commitActivity = null
      if (i < 3) {
        commitActivity = await fetchCommitActivity(GITHUB_USERNAME, repo.name)
        // Add a small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const processedRepo = {
        ...repo,
        ...(commitActivity && { commitActivity })
      }
      
      reposWithActivity.push(processedRepo)
    }
    
    const responseData = {
      repos: reposWithActivity,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        totalRepos: reposWithActivity.length
      },
      lastUpdated: new Date().toISOString(),
      source: 'github-api-live'
    }

    console.log('[API] ✅ GitHub data fetched successfully!')
    console.log(`[API] 📊 Summary:`)
    reposWithActivity.forEach((repo: any, i) => {
      const commits = repo.commitActivity ? 
        repo.commitActivity.reduce((sum: number, week: any) => sum + week.total, 0) : 
        'N/A'
      console.log(`[API]    ${i + 1}. ${repo.name}: ${commits} commits (⭐ ${repo.stargazers_count})`)
    })
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('[API] ❌ Error fetching GitHub data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data', message: (error as Error).message },
      { status: 500 }
    )
  }
}