#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import { spawn } from 'child_process';

const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

const ENDPOINTS = {
  top: `${API_BASE_URL}/topstories.json`,
  new: `${API_BASE_URL}/newstories.json`,
  best: `${API_BASE_URL}/beststories.json`,
  ask: `${API_BASE_URL}/askstories.json`,
  show: `${API_BASE_URL}/showstories.json`,
  job: `${API_BASE_URL}/jobstories.json`,
  item: `${API_BASE_URL}/item`
};

async function testEndpoint(name, url) {
  try {
    console.log(`Testing ${name} endpoint...`);
    const response = await axios.get(url, { timeout: 5000 });

    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(chalk.green(`✓ ${name}: OK (${response.data.length} items)`));
      return true;
    } else {
      console.log(chalk.red(`✗ ${name}: Empty response`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`✗ ${name}: ${error.message}`));
    return false;
  }
}

async function testItemEndpoint() {
  try {
    console.log('Testing item endpoint...');
    // Test with a known item ID
    const response = await axios.get(`${ENDPOINTS.item}/1.json`, { timeout: 5000 });

    if (response.data && response.data.id) {
      console.log(chalk.green(`✓ item: OK (item ${response.data.id})`));
      return true;
    } else {
      console.log(chalk.red(`✗ item: Invalid response`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`✗ item: ${error.message}`));
    return false;
  }
}

async function testFunctionality() {
  console.log(chalk.blue.bold('\n🧪 Testing Hacker News API Endpoints\n'));

  const results = [];

  // Test all story endpoints
  for (const [name, url] of Object.entries(ENDPOINTS)) {
    if (name !== 'item') {
      const result = await testEndpoint(name, url);
      results.push(result);
    }
  }

  // Test item endpoint separately
  const itemResult = await testItemEndpoint();
  results.push(itemResult);

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n' + chalk.blue.bold('📊 Test Summary'));
  console.log(`Passed: ${chalk.green(passed)}/${total}`);

  if (passed === total) {
    console.log(chalk.green.bold('\n🎉 All endpoints are working correctly!'));
    console.log(chalk.blue('\nYou can now use:'));
    console.log('  node index.js           # Interactive mode');
    console.log('  node index.js top 10    # Legacy CLI mode');
  } else {
    console.log(chalk.red.bold('\n❌ Some endpoints are not working properly.'));
    process.exit(1);
  }
}

async function testCLI() {
  console.log(chalk.blue.bold('\n🖥️  Testing CLI Functionality\n'));

  // Test help command
  const helpTest = spawn('node', ['index.js', '--help'], { stdio: 'pipe' });

  helpTest.stdout.on('data', (data) => {
    if (data.toString().includes('Hacker News CLI Browser')) {
      console.log(chalk.green('✓ Help command working'));
    }
  });

  // Test version command
  const versionTest = spawn('node', ['index.js', '--version'], { stdio: 'pipe' });

  versionTest.stdout.on('data', (data) => {
    if (data.toString().includes('hn-now v')) {
      console.log(chalk.green('✓ Version command working'));
    }
  });

  setTimeout(() => {
    console.log(chalk.green('✓ CLI tests completed'));
  }, 1000);
}

// Main execution
async function main() {
  try {
    await testFunctionality();
    await testCLI();

    console.log(chalk.blue.bold('\n📖 Usage Examples:'));
    console.log('');
    console.log(chalk.yellow('Interactive Mode:'));
    console.log('  node index.js');
    console.log('');
    console.log(chalk.yellow('Legacy CLI Mode:'));
    console.log('  node index.js top 20     # Top 20 stories');
    console.log('  node index.js ask        # Ask HN stories');
    console.log('  node index.js show 5     # Show HN stories');
    console.log('  node index.js job        # Job postings');
    console.log('');
    console.log(chalk.green('🚀 Ready to browse Hacker News!'));

  } catch (error) {
    console.error(chalk.red('Test failed:'), error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testEndpoint, testItemEndpoint };
