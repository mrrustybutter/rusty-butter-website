import { NextResponse } from 'next/server'

// GitHub public API rate limits:
// - Unauthenticated: 60 requests per hour per IP
// - We cache for 10 minutes to stay well under this limit
// - For higher limits (5000/hour), add GITHUB_TOKEN to env vars

const GITHUB_USERNAME = 'mrrustybutter'

// Cache for GitHub data
let repoDataCache: any = null
let cacheExpiry: number = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes cache

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  homepage: string | null
  private: boolean
  fork: boolean
}

interface LanguageColors {
  [key: string]: string
}

const languageColors: LanguageColors = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  React: '#61dafb',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const sort = searchParams.get('sort') || 'updated' // updated, stars, created
    const loadDetails = searchParams.get('details') === 'true'
    
    // Return cached data if still valid
    const cacheKey = `${sort}-${page}-${perPage}-${loadDetails}`
    if (repoDataCache && repoDataCache.cacheKey === cacheKey && Date.now() < cacheExpiry) {
      return NextResponse.json(repoDataCache)
    }

    // Fetch all repositories with pagination
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?` + 
      `sort=${sort}&direction=desc&per_page=${perPage}&page=${page}&type=owner`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'rusty-butter-website',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    )

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories')
    }

    const repos: GitHubRepo[] = await reposResponse.json()
    
    // Get total count from headers
    const linkHeader = reposResponse.headers.get('link')
    let totalPages = 1
    if (linkHeader) {
      const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
      if (lastMatch) {
        totalPages = parseInt(lastMatch[1])
      }
    }

    // Process repos
    const processedRepos = await Promise.all(repos.map(async (repoData) => {
      try {
        // Skip forks by default
        if (repoData.fork) {
          return null
        }

        let languages = {}
        let commitActivity = []
        
        // Only fetch additional details if requested (to reduce API calls)
        if (loadDetails) {
          // Get language statistics
          const languagesResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoData.name}/languages`,
            {
              headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'rusty-butter-website',
                ...(process.env.GITHUB_TOKEN && {
                  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                })
              }
            }
          )

          if (languagesResponse.ok) {
            languages = await languagesResponse.json()
          }

          // Get commit activity (last 52 weeks)
          const commitActivityResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoData.name}/stats/commit_activity`,
            {
              headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'rusty-butter-website',
                ...(process.env.GITHUB_TOKEN && {
                  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                })
              }
            }
          )

          if (commitActivityResponse.ok) {
            commitActivity = await commitActivityResponse.json()
          }
        }

        // Calculate primary language
        const primaryLanguage = Object.entries(languages).reduce((a, b) => 
          (languages as any)[a[0]] > (languages as any)[b[0]] ? a : b, 
          [repoData.language || 'Unknown', 0]
        )[0]

        return {
          id: repoData.id,
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description || 'No description provided',
          url: repoData.html_url,
          language: primaryLanguage,
          languageColor: languageColors[primaryLanguage] || '#858585',
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          issues: repoData.open_issues_count,
          topics: repoData.topics || [],
          homepage: repoData.homepage,
          private: repoData.private,
          lastUpdated: repoData.pushed_at,
          createdAt: repoData.created_at,
          languages,
          commitActivity
        }
      } catch (error) {
        console.error(`Error processing ${repoData.name}:`, error)
        return null
      }
    }))

    const validRepos = processedRepos.filter(repo => repo !== null)

    // Get user data
    const userResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'rusty-butter-website',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    )

    let userData = null
    if (userResponse.ok) {
      userData = await userResponse.json()
    }

    const responseData = {
      repos: validRepos,
      user: userData ? {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
      } : null,
      pagination: {
        page,
        perPage,
        totalPages,
        hasMore: page < totalPages
      },
      lastUpdated: new Date().toISOString(),
      cacheKey
    }

    // Cache the data
    repoDataCache = responseData
    cacheExpiry = Date.now() + CACHE_DURATION

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    
    // Return cached data if available, even if expired
    if (repoDataCache) {
      return NextResponse.json({
        ...repoDataCache,
        fromCache: true,
        cacheExpired: true,
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}