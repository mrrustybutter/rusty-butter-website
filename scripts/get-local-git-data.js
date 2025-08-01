const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function getLocalCommitActivity(repoPath, repoName) {
  try {
    // Get commit count for the repository
    const { stdout: commitCount } = await execPromise(`git -C "${repoPath}" rev-list --count HEAD`);
    const totalCommits = parseInt(commitCount.trim());
    
    console.log(`${repoName}: ${totalCommits} total commits`);
    
    // Get commits per week for the last 52 weeks
    const activity = [];
    const now = new Date();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (let week = 51; week >= 0; week--) {
      const weekStart = new Date(now.getTime() - (week * oneWeekMs));
      const weekEnd = new Date(weekStart.getTime() + oneWeekMs);
      
      const weekTimestamp = Math.floor(weekStart.getTime() / 1000);
      
      try {
        // Get commits for this week
        const { stdout: weekCommits } = await execPromise(
          `git -C "${repoPath}" rev-list --count HEAD --since="${weekStart.toISOString()}" --until="${weekEnd.toISOString()}"`
        );
        
        // Get commits per day for this week
        const days = [];
        let weekTotal = 0;
        
        for (let day = 0; day < 7; day++) {
          const dayStart = new Date(weekStart.getTime() + (day * 24 * 60 * 60 * 1000));
          const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
          
          try {
            const { stdout: dayCommits } = await execPromise(
              `git -C "${repoPath}" rev-list --count HEAD --since="${dayStart.toISOString()}" --until="${dayEnd.toISOString()}"`
            );
            const dayCount = parseInt(dayCommits.trim()) || 0;
            days.push(dayCount);
            weekTotal += dayCount;
          } catch (error) {
            days.push(0);
          }
        }
        
        activity.unshift({
          week: weekTimestamp,
          days: days,
          total: weekTotal
        });
        
      } catch (error) {
        // If no commits in this timeframe, add empty week
        activity.unshift({
          week: weekTimestamp,
          days: [0, 0, 0, 0, 0, 0, 0],
          total: 0
        });
      }
    }
    
    return { activity, totalCommits };
    
  } catch (error) {
    console.warn(`Could not get git data for ${repoName}:`, error.message);
    return null;
  }
}

async function updateWithLocalGitData() {
  try {
    // Read existing data
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'github-repos.json');
    const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Repository paths (adjust these to your actual repo locations)
    const repoPaths = {
      'rusty-butter-website': path.join(__dirname, '..'),
      'rusty-butter': path.join(__dirname, '..', '..', '..'),
      'semantic-memory': path.join(__dirname, '..', '..', '..', 'semantic-memory')
    };
    
    const updatedRepos = [];
    
    for (let i = 0; i < existingData.repos.length; i++) {
      const repo = existingData.repos[i];
      
      if (i < 3 && repoPaths[repo.name]) {
        console.log(`Getting real git data for ${repo.name}...`);
        const gitData = await getLocalCommitActivity(repoPaths[repo.name], repo.name);
        
        if (gitData) {
          updatedRepos.push({
            ...repo,
            commitActivity: gitData.activity
          });
          console.log(`✅ ${repo.name}: ${gitData.totalCommits} commits with real activity data`);
        } else {
          updatedRepos.push(repo);
          console.log(`⚠️ ${repo.name}: Using existing data (git repo not found)`);
        }
      } else {
        updatedRepos.push(repo);
      }
    }
    
    const updatedData = {
      ...existingData,
      repos: updatedRepos,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
    console.log('\n✅ GitHub data updated with REAL local git commit activity!');
    
  } catch (error) {
    console.error('Error updating with local git data:', error);
    process.exit(1);
  }
}

updateWithLocalGitData();