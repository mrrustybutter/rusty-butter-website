const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'mrrustybutter';

async function fetchCommitActivity(owner, repo) {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'rusty-butter-website',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) {
      console.warn(`Failed to fetch commit activity for ${repo}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Error fetching commit activity for ${repo}:`, error.message);
    return null;
  }
}

async function fetchGitHubData() {
  try {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=50&page=1&type=owner`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'rusty-butter-website',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();
    
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

    // Fetch real commit activity data for the first few repos
    const reposWithActivity = [];
    
    for (let i = 0; i < filteredRepos.length; i++) {
      const repo = filteredRepos[i];
      
      if (i < 3) { // Add activity to first 3 repos
        console.log(`Fetching commit activity for ${repo.name}...`);
        const commitActivity = await fetchCommitActivity(GITHUB_USERNAME, repo.name);
        
        if (commitActivity && Array.isArray(commitActivity)) {
          // Transform GitHub API format to our format
          const transformedActivity = commitActivity.map(week => ({
            week: week.week,
            days: week.days || [0, 0, 0, 0, 0, 0, 0],
            total: week.total || 0
          }));
          
          reposWithActivity.push({ ...repo, commitActivity: transformedActivity });
        } else {
          // Fallback to a minimal mock if API fails
          console.log(`Using fallback data for ${repo.name}`);
          const commitActivity = [
            { week: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), days: [1, 2, 0, 1, 3, 0, 1], total: 8 },
            { week: Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60), days: [0, 1, 1, 2, 1, 0, 0], total: 5 }
          ];
          reposWithActivity.push({ ...repo, commitActivity });
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        reposWithActivity.push(repo);
      }
    }

    const data = {
      repos: reposWithActivity,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        totalRepos: reposWithActivity.length
      },
      lastUpdated: new Date().toISOString()
    };

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(dataDir, 'github-repos.json'), JSON.stringify(data, null, 2));
    console.log('GitHub data saved successfully!');
    console.log(`Found ${filteredRepos.length} repositories`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fetchGitHubData();