const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');
    
    for (const line of envLines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    }
  }
}

// Load environment variables at startup
loadEnvFile();

const GITHUB_USERNAME = 'mrrustybutter';

async function fetchWithAuth(url) {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.warn('⚠️ No GitHub token found. Using unauthenticated requests (60/hour limit)');
  }
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'rusty-butter-website',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchCommitActivity(owner, repo) {
  try {
    console.log(`📊 Fetching commit activity for ${repo}...`);
    
    // GitHub's commit activity endpoint gives us 52 weeks of data
    const data = await fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`⚠️ No commit activity data for ${repo}`);
      return null;
    }
    
    // Transform GitHub API format to our format
    const transformedActivity = data.map(week => ({
      week: week.week,
      days: week.days || [0, 0, 0, 0, 0, 0, 0],
      total: week.total || 0
    }));
    
    const totalCommits = transformedActivity.reduce((sum, week) => sum + week.total, 0);
    console.log(`✅ ${repo}: ${totalCommits} commits in the last year`);
    
    return transformedActivity;
    
  } catch (error) {
    console.warn(`⚠️ Error fetching commit activity for ${repo}:`, error.message);
    return null;
  }
}

async function fetchRepositoryInfo(owner, repo) {
  try {
    console.log(`📁 Fetching repository info for ${repo}...`);
    
    const data = await fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}`);
    
    return {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      stargazers_count: data.stargazers_count,
      watchers_count: data.watchers_count,
      forks_count: data.forks_count,
      language: data.language,
      created_at: data.created_at,
      updated_at: data.updated_at,
      pushed_at: data.pushed_at,
      size: data.size,
      topics: data.topics || []
    };
    
  } catch (error) {
    console.warn(`⚠️ Error fetching repository info for ${repo}:`, error.message);
    return null;
  }
}

async function fetchAllRepositories() {
  try {
    console.log(`🔍 Fetching all repositories for ${GITHUB_USERNAME}...`);
    
    const repos = await fetchWithAuth(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=50&page=1&type=owner`);
    
    // Filter and sort repos
    const filteredRepos = repos
      .filter(repo => !repo.fork && repo.stargazers_count >= 0)
      .sort((a, b) => {
        if (a.stargazers_count !== b.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, 20);
    
    console.log(`📚 Found ${filteredRepos.length} public repositories`);
    return filteredRepos;
    
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    throw error;
  }
}

async function updateGitHubDataWithLiveAPI() {
  try {
    console.log('🚀 Starting live GitHub data fetch...\n');
    
    // Check rate limit first
    try {
      const rateLimit = await fetchWithAuth('https://api.github.com/rate_limit');
      const remaining = rateLimit.rate.remaining;
      const resetTime = new Date(rateLimit.rate.reset * 1000);
      
      console.log(`📊 GitHub API Rate Limit: ${remaining}/${rateLimit.rate.limit} remaining`);
      console.log(`🔄 Resets at: ${resetTime.toLocaleString()}\n`);
      
      if (remaining < 10) {
        console.warn('⚠️ Low rate limit remaining. Consider waiting or using cached data.\n');
      }
    } catch (error) {
      console.warn('Could not check rate limit, continuing...\n');
    }
    
    // Fetch all repositories
    const allRepos = await fetchAllRepositories();
    
    // Process the top repositories with commit activity
    const reposWithActivity = [];
    
    for (let i = 0; i < Math.min(allRepos.length, 6); i++) {
      const repo = allRepos[i];
      
      // Get detailed repo info
      const repoInfo = await fetchRepositoryInfo(GITHUB_USERNAME, repo.name);
      
      // Get commit activity for first 3 repos
      let commitActivity = null;
      if (i < 3) {
        commitActivity = await fetchCommitActivity(GITHUB_USERNAME, repo.name);
        
        // Add a small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const processedRepo = {
        ...(repoInfo || repo),
        ...(commitActivity && { commitActivity })
      };
      
      reposWithActivity.push(processedRepo);
    }
    
    const updatedData = {
      repos: reposWithActivity,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        totalRepos: reposWithActivity.length
      },
      lastUpdated: new Date().toISOString(),
      source: 'github-api-live'
    };

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dataPath = path.join(dataDir, 'github-repos.json');
    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
    
    console.log('\n✅ GitHub data updated with live API data!');
    console.log(`📝 Data saved to: ${dataPath}`);
    console.log(`🕒 Last updated: ${updatedData.lastUpdated}`);
    
    // Summary
    console.log('\n📊 Summary:');
    reposWithActivity.forEach((repo, i) => {
      const commits = repo.commitActivity ? 
        repo.commitActivity.reduce((sum, week) => sum + week.total, 0) : 
        'N/A';
      console.log(`   ${i + 1}. ${repo.name}: ${commits} commits (⭐ ${repo.stargazers_count})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating GitHub data:', error);
    
    // Fallback: check if we have existing data
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'github-repos.json');
    if (fs.existsSync(dataPath)) {
      console.log('📁 Using existing cached data as fallback');
      const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log(`🕒 Cached data from: ${existingData.lastUpdated}`);
    } else {
      console.error('❌ No fallback data available');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  updateGitHubDataWithLiveAPI();
}

module.exports = { updateGitHubDataWithLiveAPI };