#!/usr/bin/env node

/**
 * Script to import subjects and levels data into Convex
 * 
 * Usage:
 * 1. First import subjects: npm run seed:subjects
 * 2. Then seed levels: npm run seed:levels
 * 
 * Or run both: npm run seed:all
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'subjects':
      runCommand(
        'npx convex import --table subjects ./seed_data/subjects.json',
        'Importing subjects data'
      );
      break;

    case 'levels':
      runCommand(
        'npx convex function seedData:seedLevels',
        'Seeding levels data'
      );
      break;

    case 'all':
      runCommand(
        'npx convex import --table subjects ./seed_data/subjects.json',
        'Importing subjects data'
      );
      console.log('\n⏳ Waiting 2 seconds for subjects to be fully imported...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      runCommand(
        'npx convex function seedData:seedLevels',
        'Seeding levels data'
      );
      break;

    default:
      console.log(`
Usage: node importData.mjs <command>

Commands:
  subjects  - Import subjects from JSON file
  levels    - Seed levels data (run after subjects are imported)
  all       - Import subjects and then seed levels

Examples:
  node importData.mjs subjects
  node importData.mjs levels
  node importData.mjs all
      `);
      break;
  }
}

main().catch(console.error);
