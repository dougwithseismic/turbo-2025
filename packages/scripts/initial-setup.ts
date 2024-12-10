import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

type DependencyCheck = {
  name: string;
  command: string;
  minVersion: string;
};

type SetupResult = {
  action: string;
  status: 'success' | 'failed';
  version?: string;
  error?: string;
  created?: number;
  skipped?: number;
};

type EnvFileResult = {
  project: string;
  path: string;
  status: 'created' | 'skipped';
};

const createFileUrl = (filePath: string): string => {
  return `file://${encodeURI(filePath.replace(/\\/g, '/'))}`;
};

const checkDependencies = (): SetupResult[] => {
  const results: SetupResult[] = [];
  const dependencies: DependencyCheck[] = [
    { name: 'node', command: 'node --version', minVersion: '18.0.0' },
    { name: 'pnpm', command: 'pnpm --version', minVersion: '8.15.0' },
    { name: 'git', command: 'git --version', minVersion: '2.0.0' },
    { name: 'docker', command: 'docker --version', minVersion: '20.0.0' },
  ];
  for (const dep of dependencies) {
    try {
      const output = execSync(dep.command, { encoding: 'utf-8' }).trim();
      const version = output.match(/\d+\.\d+\.\d+/)?.[0];
      if (!version) {
        console.error(`❌ Could not determine ${dep.name} version`);
        results.push({
          action: `Check ${dep.name}`,
          status: 'failed',
          error: 'Version not found',
        });
        process.exit(1);
      }
      if (version < dep.minVersion) {
        console.error(
          `❌ ${dep.name} version ${version} is below minimum required version ${dep.minVersion}`,
        );
        results.push({
          action: `Check ${dep.name}`,
          status: 'failed',
          error: 'Version too low',
        });
        process.exit(1);
      }
      console.log(
        `✅ ${dep.name} ${version} is installed (minimum: ${dep.minVersion})`,
      );
      results.push({ action: `Check ${dep.name}`, status: 'success', version });
    } catch (error) {
      console.error(
        `❌ ${dep.name} is not installed or not accessible. Please install version ${dep.minVersion} or higher. Error: ${error}`,
      );
      results.push({
        action: `Check ${dep.name}`,
        status: 'failed',
        error: 'Not installed',
      });
      process.exit(1);
    }
  }
  console.log(
    '✅ All required dependencies are installed with compatible versions',
  );
  return results;
};

const setupGitHooks = (): SetupResult => {
  console.log('\n# Helper: Install husky hooks');
  console.log('Installing husky hooks...');
  try {
    execSync('npx husky install', { stdio: 'inherit' });
    console.log('✅ Husky hooks installed successfully');
    return { action: 'Install Git hooks', status: 'success' };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to install husky hooks:', err);
    return {
      action: 'Install Git hooks',
      status: 'failed',
      error: err.message,
    };
  }
};

const installDependencies = (): SetupResult => {
  console.log('\n# Helper: Install dependencies');
  console.log('Installing dependencies for the root and all workspaces...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
    return { action: 'Install dependencies', status: 'success' };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to install dependencies:', err);
    return {
      action: 'Install dependencies',
      status: 'failed',
      error: err.message,
    };
  }
};

type SetupEnvConfig = {
  rootDir: string;
  foldersToScan: string[];
};

const setupEnvFiles = async ({
  rootDir,
  foldersToScan,
}: SetupEnvConfig): Promise<SetupResult> => {
  const results: EnvFileResult[] = [];
  for (const folder of foldersToScan) {
    const folderPath = join(rootDir, folder);
    const projects = await readdir(folderPath);
    for (const project of projects) {
      const projectPath = join(folderPath, project);
      const exampleEnvPath = join(projectPath, '.env.example');
      const envPath = join(projectPath, '.env');
      try {
        await access(exampleEnvPath);
        try {
          await access(envPath);
          results.push({
            project: `${folder}/${project}`,
            path: createFileUrl(envPath),
            status: 'skipped',
          });
          continue;
        } catch {
          const content = await readFile(exampleEnvPath, 'utf-8');
          await writeFile(envPath, content);
          results.push({
            project: `${folder}/${project}`,
            path: createFileUrl(envPath),
            status: 'created',
          });
        }
      } catch {
        continue;
      }
    }
  }

  console.log('\nHelper: Generate .env from .env.example');
  const created = results.filter((r) => r.status === 'created');
  const skipped = results.filter((r) => r.status === 'skipped');
  const tableResults = results.map(({ project, path, status }) => ({
    project,
    path: relative(rootDir, decodeURI(path.replace('file://', ''))),
    status,
  }));

  if (created.length > 0) {
    console.table(tableResults);
  }
  console.log(`✅ Created: ${created.length} .env files`);
  console.log(`⏭️  Skipped: ${skipped.length} (already existed)`);

  if (created.length > 0) {
    console.log('\n🔨 Next steps:');
    console.log('   1. Review and update these .env files:');
    created.forEach(({ path }) => {
      console.log(`      ${path}`);
    });
    console.log('   2. Add any required secret values');
  }

  return {
    action: 'Setup env files',
    status: 'success',
    created: created.length,
    skipped: skipped.length,
  };
};

const executeInitialSetup = async ({
  rootDir,
  foldersToScan,
}: SetupEnvConfig): Promise<void> => {
  console.log(`
██████ ▓█████▄▄▄█████▓  █    ██  ██▓███  
▒██    ▒ ▓█   ▀▓  ██▒ ▓▒ ██  ▓██▒▓██░  ██▒
░ ▓██▄   ▒███  ▒ ▓██░ ▒░▓██  ▒██░▓██░ ██▓▒
  ▒   ██▒▒▓█  ▄░ ▓██▓ ░ ▓▓█  ░██░▒██▄█▓▒ ▒
▒██████▒▒░▒████▒ ▒██▒ ░ ▒▒█████▓ ▒██▒ ░  ░
▒ ▒▓▒ ▒ ░░░ ▒░ ░ ▒ ░░   ░▒▓▒ ▒ ▒ ▒▓▒░ ░  ░
░ ░▒  ░ ░ ░ ░  ░   ░    ░░▒░ ░ ░ ░▒ ░     
░  ░  ░     ░    ░       ░░░ ░ ░ ░░       
      ░     ░  ░           ░              
  `);

  const setupResults: SetupResult[] = [];
  try {
    setupResults.push(...checkDependencies());
    setupResults.push(await installDependencies());
    setupResults.push(await setupGitHooks());
    setupResults.push(await setupEnvFiles({ rootDir, foldersToScan }));

    const failedSteps = setupResults.filter((r) => r.status === 'failed');
    if (failedSteps.length > 0) {
      console.log('\n❌ Setup failed with the following errors:');
      failedSteps.forEach((step) => {
        console.log(`- ${step.action}: ${step.error}`);
      });
      process.exit(1);
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nSetup summary:');
    setupResults.forEach(({ action, status }) => {
      const emoji = status === 'success' ? '✅' : '❌';
      console.log(`${emoji} ${action}`);
    });

    const isDockerRunning = async (): Promise<boolean> => {
      try {
        execSync('docker info', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    };

    const dockerStatus = await isDockerRunning();
    if (!dockerStatus) {
      console.log(
        '\n⚠️  Docker is not running! Please start Docker Engine and rerun to set up Supabase.',
      );
      process.exit(1);
    }

    console.log('\n🔨 Next steps:');
    console.log(
      '   1. Run "pnpm turbo generate" to create a new app or package',
    );
  } catch (error) {
    const err = error as Error;
    console.error('Failed during setup:', err);
    process.exit(1);
  }
};

executeInitialSetup({
  rootDir: process.cwd(),
  foldersToScan: ['apps', 'packages'],
});
