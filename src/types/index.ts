// GitHub types
export interface GitHubRepoData {
  id: number
  name: string
  fullName: string
  description: string
  url: string
  language: string
  languageColor: string
  stars: number
  forks: number
  issues: number
  topics: string[]
  homepage: string | null
  private: boolean
  lastUpdated: string
  createdAt: string
  languages: Record<string, number>
  commitActivity: CommitWeek[]
}

export interface CommitWeek {
  week: number
  days: number[]
  total: number
}

export interface GitHubUser {
  login: string
  name: string
  avatarUrl: string
  bio: string
  publicRepos: number
  followers: number
  following: number
}

export interface GitHubDataResponse {
  repos: GitHubRepoData[]
  user: GitHubUser | null
  pagination: {
    page: number
    perPage: number
    totalPages: number
    hasMore: boolean
  }
  lastUpdated: string
  fromCache?: boolean
  cacheExpired?: boolean
  cacheKey?: string
}

// Twitch types
export interface TwitchStream {
  id: string
  title: string
  date: Date
  duration: number
  viewCount: number
  url: string
  thumbnail: string
  type: 'vod' | 'live'
}

export interface TwitchChannel {
  id: string
  login: string
  displayName: string
  profileImageUrl: string
  description: string
}

export interface TwitchCurrentStream {
  id: string
  title: string
  viewerCount: number
  startedAt: string
  gameName: string
  thumbnailUrl: string
}

export interface TwitchDataResponse {
  isLive: boolean
  currentStream: TwitchCurrentStream | null
  channel: TwitchChannel | null
  streamingActivity: TwitchStream[]
  totalStreams: number
  lastUpdated: string
  fromCache?: boolean
  cacheExpired?: boolean
}

// Activity graph types
export interface ActivityData {
  date: Date
  intensity: number
  data?: unknown
}