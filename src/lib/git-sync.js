const simpleGit = require('simple-git');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const { getDataPath } = require('./storage');

let git;
let watcher;
let isInitialized = false;
let config = {
  enabled: false,
  remote: null,
  autoPush: true,
  autoPull: true,
  autoCommit: true
};

async function initGitSync() {
  const dataPath = getDataPath();
  git = simpleGit(dataPath);
  
  const configPath = path.join(dataPath, 'sync-config.json');
  try {
    const cfg = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    config = { ...config, ...cfg };
  } catch {}
  
  if (!config.enabled) {
    console.log('Git sync disabled. Run /api/sync/init to enable.');
    return;
  }
  
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      console.log('Initialized new git repository');
    }
  } catch (e) {
    console.error('Git init error:', e.message);
    return;
  }
  
  if (config.remote) {
    try {
      await git.addRemote('origin', config.remote);
    } catch {}
  }
  
  startWatcher();
  isInitialized = true;
  
  if (config.autoPull) {
    await pullChanges();
  }
}

async function syncNow() {
  if (!isInitialized) return { error: 'Git sync not initialized' };
  
  try {
    await git.add('.');
    const status = await git.status();
    
    if (status.files.length > 0) {
      const timestamp = new Date().toISOString();
      await git.commit(`Sync: ${timestamp}`);
      
      if (config.autoPush && config.remote) {
        await git.push('origin', 'main', { '--set-upstream': null });
      }
    }
    
    return { success: true, status: status.current };
  } catch (e) {
    return { error: e.message };
  }
}

async function pullChanges() {
  if (!isInitialized || !config.remote) return { error: 'Not configured' };
  
  try {
    await git.pull('origin', 'main');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

async function pushChanges() {
  if (!isInitialized || !config.remote) return { error: 'Not configured' };
  
  try {
    await git.push('origin', 'main');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

async function setRemote(url) {
  config.remote = url;
  await saveConfig();
  
  try {
    await git.addRemote('origin', url);
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

async function enable(remoteUrl = null) {
  config.enabled = true;
  if (remoteUrl) config.remote = remoteUrl;
  await saveConfig();
  
  if (!config.remote) {
    return { message: 'Enabled. Use /api/sync/remote to set remote URL' };
  }
  
  await initGitSync();
  return { success: true };
}

async function disable() {
  config.enabled = false;
  await saveConfig();
  if (watcher) await watcher.close();
  isInitialized = false;
  return { success: true };
}

async function saveConfig() {
  const configPath = path.join(getDataPath(), 'sync-config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

function startWatcher() {
  watcher = chokidar.watch(getDataPath(), {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../,
    persistent: true,
    delay: 2000
  });
  
  watcher.on('change', async (filePath) => {
    console.log('File changed:', filePath);
    if (config.autoCommit) {
      await syncNow();
    }
  });
  
  watcher.on('add', async (filePath) => {
    console.log('File added:', filePath);
    if (config.autoCommit) {
      await syncNow();
    }
  });
}

async function getStatus() {
  if (!isInitialized) return { initialized: false, enabled: config.enabled };
  
  try {
    const status = await git.status();
    return {
      initialized: true,
      enabled: config.enabled,
      remote: config.remote,
      branch: status.current,
      files: status.files,
      tracking: status.tracking
    };
  } catch (e) {
    return { initialized: true, error: e.message };
  }
}

module.exports = { initGitSync, syncNow, pullChanges, pushChanges, setRemote, enable, disable, getStatus };