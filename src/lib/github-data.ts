import { GitHubRepoData, GitHubDataResponse } from '@/types'

const GITHUB_USERNAME = 'mrrustybutter'

export async function fetchGitHubDataStatic(): Promise<GitHubDataResponse> {
  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?` + 
      `sort=updated&direction=desc&per_page=50&page=1&type=owner`,
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
      console.warn('Failed to fetch repositories, using fallback data')
      return getFallbackData()
    }

    const repos: any[] = await reposResponse.json()
    
    // Filter and sort repos by stars and recent activity
    const filteredRepos = repos
      .filter(repo => !repo.fork && repo.stargazers_count > 0)
      .sort((a, b) => {
        // Sort by stars first, then by updated date
        if (a.stargazers_count !== b.stargazers_count) {
          return b.stargazers_count - a.stargazers_count
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
      .slice(0, 20) // Take top 20

    // Fetch detailed activity data for top repos
    const reposWithActivity = await Promise.all(
      filteredRepos.map(async (repo) => {
        try {
          const activityResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/stats/commit_activity`,
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

          if (activityResponse.ok) {
            const activity = await activityResponse.json()
            return { ...repo, commitActivity: activity }
          }
        } catch (error) {
          console.warn(`Failed to fetch activity for ${repo.name}:`, error)
        }
        
        return { ...repo, commitActivity: [] }
      })
    )

    return {
      repos: reposWithActivity,
      user: null,
      pagination: {
        page: 1,
        perPage: 30,
        totalPages: 1,
        hasMore: false
      },
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    return getFallbackData()
  }
}

function getFallbackData(): GitHubDataResponse {
  return {
    repos: [],
    user: null,
    pagination: {
      page: 1,
      perPage: 30,
      totalPages: 1,
      hasMore: false
    },
    lastUpdated: new Date().toISOString()
  }
}