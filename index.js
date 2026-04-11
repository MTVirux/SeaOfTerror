const fs = require("fs");
const https = require("https");

const extraTag = "Sea Of Terror";
const reposMeta = JSON.parse(fs.readFileSync("./meta.json", "utf8"));
const final = [];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'user-agent': 'SeaOfTerror/1.0.0',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchGitHubApi(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'user-agent': 'SeaOfTerror/1.0.0',
      'Accept': 'application/vnd.github+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const linkHeader = res.headers['link'] || '';
          resolve({ json, linkHeader });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function parseNextLink(linkHeader) {
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

function parseGitHubOwnerRepo(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function fetchDownloadCount(owner, repo) {
  try {
    let total = 0;
    let url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=100`;

    while (url) {
      const { json, linkHeader } = await fetchGitHubApi(url);

      if (!Array.isArray(json)) {
        console.warn(`!!! Unexpected response from GitHub API for ${owner}/${repo}`);
        return 0;
      }

      for (const release of json) {
        for (const asset of (release.assets || [])) {
          if (asset.name && asset.name.endsWith('.zip')) {
            total += asset.download_count || 0;
          }
        }
      }

      url = parseNextLink(linkHeader);
    }

    console.log(`Download count for ${owner}/${repo}: ${total}`);
    return total;
  } catch (e) {
    console.warn(`!!! Failed to fetch download count for ${owner}/${repo}: ${e.message}`);
    return 0;
  }
}

async function recoverPlugin(internalName) {
  if (!fs.existsSync("./repo.json")) {
    console.error("!!! Tried to recover plugin when repo isn't generated");
    process.exit(1);
  }

  const oldRepo = JSON.parse(fs.readFileSync("./repo.json", "utf8"));
  const plugin = oldRepo.find((x) => x.InternalName === internalName);
  if (!plugin) {
    console.error(`!!! ${internalName} not found in old repo`);
    process.exit(1);
  }

  final.push(plugin);
  console.log(`Recovered ${internalName} from last manifest`);
}

async function doRepo(url, plugins) {
  console.log(`Fetching ${url}...`);
  const repo = await fetchJson(url);

  for (const internalName of plugins) {
    const plugin = repo.find((x) => x.InternalName === internalName);
    if (!plugin) {
      console.warn(`!!! ${internalName} not found in ${url}`);
      recoverPlugin(internalName);
      continue;
    }

    // Inject our custom tag
    const tags = plugin.Tags || [];
    tags.push(extraTag);
    plugin.Tags = tags;

    // Fetch download count from GitHub Releases API (skip non-owned plugins)
    if (internalName !== "IINACT" && plugin.RepoUrl) {
      const parsed = parseGitHubOwnerRepo(plugin.RepoUrl);
      if (parsed) {
        const count = await fetchDownloadCount(parsed.owner, parsed.repo);
        plugin.DownloadCount = count;
      }
    }

    final.push(plugin);
  }
}

async function main() {
  for (const meta of reposMeta) {
    try {
      await doRepo(meta.repo, meta.plugins);
    } catch (e) {
      console.error(`!!! Failed to fetch ${meta.repo}`);
      console.error(e);
      for (const plugin of meta.plugins) {
        recoverPlugin(plugin);
      }
    }
  }

  fs.writeFileSync("./repo.json", JSON.stringify(final, null, 2));
  console.log(`Wrote ${final.length} plugins to repo.json.`);
}

main();
