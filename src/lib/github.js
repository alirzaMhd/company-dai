const { Octokit } = require('@octokit/rest')
const storage = require('./storage')

class GitHubService {
  constructor() {
    this.octokit = null
  }

  async initialize(token) {
    this.octokit = new Octokit({ auth: token })
    return this.octokit
  }

  async getRepositories(username) {
    if (!this.octokit) throw new Error('GitHub not initialized')
    
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      type: 'owner',
      sort: 'updated',
      per_page: 100,
    })
    
    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      issuesCount: repo.open_issues_count,
      language: repo.language,
      updatedAt: repo.updated_at,
    }))
  }

  async getRepoIssues(owner, repo) {
    if (!this.octokit) throw new Error('GitHub not initialized')
    
    const { data } = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100,
    })
    
    return data
      .filter(issue => !issue.pull_request)
      .map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map(l => l.name),
        assignees: issue.assignees.map(a => a.login),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        htmlUrl: issue.html_url,
      }))
  }

  async syncProject(projectId) {
    const projects = await storage.readData('projects.json')
    const project = projects.find(p => p.id === projectId)
    
    if (!project || project.type !== 'github') {
      throw new Error('Invalid GitHub project')
    }
    
    const [owner, repo] = project.repo.split('/')
    const issues = await this.getRepoIssues(owner, repo)
    
    // Update project with issues
    project.issues = issues
    project.lastSynced = new Date().toISOString()
    
    await storage.writeData('projects.json', projects)
    
    return project
  }
}

module.exports = new GitHubService()
