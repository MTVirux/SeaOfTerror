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
