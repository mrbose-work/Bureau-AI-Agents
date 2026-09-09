const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

function getHeaders() {
  return {
    "Authorization": `token ${GITHUB_TOKEN}`,
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "Bureau-AI-Agents"
  };
}

/**
 * Reads a file from a GitHub repository and returns its content and SHA.
 */
export async function fetchGitHubFile(repo: string, path: string, branch: string = "main") {
  if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN environment variable.");
  
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.statusText} (${response.status})`);
  }
  
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return {
    sha: data.sha,
    content: content
  };
}

/**
 * Commits (writes/updates) a file in a GitHub repository.
 */
export async function commitGitHubFile(repo: string, path: string, content: string, message: string, branch: string = "main") {
  if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN environment variable.");
  
  let sha: string | undefined;
  try {
    const existing = await fetchGitHubFile(repo, path, branch);
    sha = existing.sha;
  } catch (e) {
    // File might not exist yet, which is fine
    console.log(`File ${path} does not exist yet. Creating new file.`);
  }
  
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const body = {
    message: message,
    content: Buffer.from(content).toString('base64'),
    sha: sha,
    branch: branch
  };
  
  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`GitHub commit failed: ${JSON.stringify(err)}`);
  }
  
  return await response.json();
}
