const { exec } = require('child_process');
const { getDataPath } = require('./storage');

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout);
    });
  });
}

async function runOpenCode(args) {
  return execAsync(`opencode ${args}`);
}

async function parseAgentList(output) {
  const agents = [];
  const lines = output.trim().split('\n');
  let currentAgent = null;
  let permissions = [];
  let readingPermissions = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('█') || trimmed.startsWith('┌')) {
      readingPermissions = false;
      continue;
    }
    
    if (!trimmed) {
      if (currentAgent && permissions.length > 0) {
        agents.push({ name: currentAgent.name, mode: currentAgent.mode, permissions });
        currentAgent = null;
        permissions = [];
      }
      readingPermissions = false;
      continue;
    }
    
    if (trimmed.includes('(') && trimmed.includes(')')) {
      const match = trimmed.match(/^(\w+)\s+\((\w+)\)/);
      if (match) {
        if (currentAgent && permissions.length > 0) {
          agents.push({ name: currentAgent.name, mode: currentAgent.mode, permissions });
        }
        currentAgent = { name: match[1], mode: match[2] };
        permissions = [];
        readingPermissions = false;
      }
    } else if (currentAgent && trimmed.startsWith('{')) {
      readingPermissions = true;
    } else if (readingPermissions && trimmed.startsWith('}')) {
      readingPermissions = false;
    } else if (readingPermissions && (trimmed.startsWith('"permission"') || trimmed.startsWith('"action"') || trimmed.startsWith('"pattern"'))) {
      const match = trimmed.match(/"(\w+)":\s*"?([^"]+)"?/);
      if (match) {
        const key = match[1];
        let value = match[2].replace(/,$/, '');
        
        if (key === 'permission' && value !== '*') {
          if (permissions.length === 0 || permissions[permissions.length - 1].permission) {
            permissions.push({ permission: value });
          } else {
            permissions[permissions.length - 1].permission = value;
          }
        } else if (key === 'action') {
          if (permissions.length > 0) {
            permissions[permissions.length - 1].action = value;
          }
        } else if (key === 'pattern') {
          if (permissions.length > 0) {
            permissions[permissions.length - 1].pattern = value;
          }
        }
      }
    }
  }
  
  if (currentAgent && permissions.length > 0) {
    agents.push({ name: currentAgent.name, mode: currentAgent.mode, permissions });
  }
  
  return agents;
}

async function getAgents() {
  try {
    const output = await runOpenCode('agent list');
    return await parseAgentList(output);
  } catch (e) {
    console.error('Error getting agents:', e.message);
    return [];
  }
}

async function createAgent(options) {
  const args = ['agent create'];
  if (options.path) args.push(`--path ${options.path}`);
  if (options.description) args.push(`--description "${options.description}"`);
  if (options.mode) args.push(`--mode ${options.mode}`);
  if (options.tools) args.push(`--tools ${options.tools}`);
  if (options.model) args.push(`--model ${options.model}`);
  
  return runOpenCode(args.join(' '));
}

async function getMCPServers() {
  try {
    const output = await runOpenCode('mcp list');
    return output;
  } catch (e) {
    return 'No MCP servers';
  }
}

async function addMCPServer(name, type, command) {
  return runOpenCode(`mcp add ${name} ${type} ${command}`);
}

async function removeMCPServer(name) {
  const configPath = await findOpencodeConfig();
  if (!configPath) return 'No config found';
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  delete config.mcp?.[name];
  
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  return `Removed MCP server: ${name}`;
}

async function getSkills() {
  try {
    const configPath = await findOpencodeConfig();
    if (!configPath) return [];
    
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    return config.skills || [];
  } catch (e) {
    return [];
  }
}

async function addSkill(skill) {
  const configPath = await findOpencodeConfig();
  if (!configPath) return 'No config found';
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  if (!config.skills) config.skills = [];
  config.skills.push(skill);
  
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  return `Added skill: ${skill.name || skill}`;
}

async function removeSkill(skillName) {
  const configPath = await findOpencodeConfig();
  if (!configPath) return 'No config found';
  
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  config.skills = (config.skills || []).filter(s => 
    (typeof s === 'string' ? s : s.name) !== skillName
  );
  
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  return `Removed skill: ${skillName}`;
}

async function getPlugins() {
  try {
    const output = await runOpenCode('plugin');
    return output;
  } catch (e) {
    return 'No plugins info';
  }
}

async function addPlugin(moduleName, global = false) {
  const flag = global ? '-g' : '';
  return runOpenCode(`plugin ${flag} ${moduleName}`);
}

async function removePlugin(moduleName) {
  return `Note: Remove plugin manually by removing from config`;
}

async function getSessions() {
  try {
    const output = await runOpenCode('session list');
    return output;
  } catch (e) {
    return 'No sessions';
  }
}

async function exportSession(sessionId) {
  return runOpenCode(`export ${sessionId}`);
}

async function getProviders() {
  try {
    const output = await runOpenCode('providers list');
    return output;
  } catch (e) {
    return 'No providers';
  }
}

async function getDatabase() {
  return runOpenCode('db path');
}

async function getOpencodeConfig() {
  const configPath = await findOpencodeConfig();
  if (!configPath) return null;
  return JSON.parse(await fs.readFile(configPath, 'utf-8'));
}

async function findOpencodeConfig() {
  const { execSync } = require('child_process');
  try {
    const result = execSync('opencode which --config 2>/dev/null || echo ""', { encoding: 'utf-8' });
    const configPath = result.trim();
    if (configPath && require('fs').existsSync(configPath)) {
      return configPath;
    }
  } catch {}
  
  const possiblePaths = [
    './opencode.config.json',
    process.cwd() + '/opencode.config.json',
    path.join(process.env.HOME || '', '.opencode', 'config.json')
  ];
  
  for (const p of possiblePaths) {
    try {
      await require('fs').promises.access(p);
      return p;
    } catch {}
  }
  
  return null;
}

const fs = require('fs').promises;
const path = require('path');

module.exports = {
  getAgents, createAgent,
  getMCPServers, addMCPServer, removeMCPServer,
  getSkills, addSkill, removeSkill,
  getPlugins, addPlugin, removePlugin,
  getSessions, exportSession,
  getProviders, getDatabase, getOpencodeConfig
};