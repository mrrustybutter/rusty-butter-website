import { GitHubRepoData, GitHubDataResponse } from '@/types'

export function mapRawRepoToGitHubRepoData(rawRepo: any): GitHubRepoData {
  return {
    id: rawRepo.id || 0,
    name: rawRepo.name,
    fullName: rawRepo.full_name,
    description: rawRepo.description || '',
    url: rawRepo.html_url,
    language: rawRepo.language || 'Unknown',
    languageColor: getLanguageColor(rawRepo.language),
    stars: rawRepo.stargazers_count || 0,
    forks: rawRepo.forks_count || 0,
    issues: rawRepo.open_issues_count || 0,
    topics: rawRepo.topics || [],
    homepage: rawRepo.homepage || null,
    private: rawRepo.private || false,
    lastUpdated: rawRepo.updated_at,
    createdAt: rawRepo.created_at,
    languages: {},
    commitActivity: rawRepo.commitActivity || []
  }
}

export function mapStaticDataToGitHubResponse(staticData: any): GitHubDataResponse {
  return {
    repos: staticData.repos.map(mapRawRepoToGitHubRepoData),
    user: null,
    pagination: staticData.pagination || {
      page: 1,
      perPage: 30,
      totalPages: 1,
      hasMore: false
    },
    lastUpdated: staticData.lastUpdated || new Date().toISOString(),
    fromCache: true
  }
}

function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#FA7343',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Unknown: '#6e7681'
  }
  
  return colors[language || 'Unknown'] || colors.Unknown
}