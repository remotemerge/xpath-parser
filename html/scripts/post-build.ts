import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { copyFile, cp, mkdir, readFile, writeFile } from 'fs/promises';

// Read and parse the root package.json
const packageJsonPath = join(resolve(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Extract necessary fields from package.json
const {
  name,
  version,
  description,
  license,
  author,
  repository,
  bugs,
  keywords,
  type,
  types,
  main,
  module,
  exports,
  dependencies,
} = packageJson;

// Strip 'dist/' prefix from paths for npm package exports
const stripDist = (value: string): string => value.replace(/^(\.\/|\.\.\/)?dist\//, '');

// Recursively rewrite exports to strip 'dist/' from all paths
const rewriteExports = (exportsMap: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(exportsMap)) {
    if (typeof value === 'string') {
      result[key] = './' + stripDist(value);
    } else if (value && typeof value === 'object') {
      result[key] = rewriteExports(value as Record<string, unknown>);
    }
  }
  return result;
};

// Configuration for the npm package
const npmPackageConfig = {
  name,
  version,
  description,
  license,
  author,
  keywords,
  repository,
  bugs,
  type,
  types: stripDist(types),
  main: stripDist(main),
  module: stripDist(module),
  exports: rewriteExports(exports),
  dependencies,
  files: ['**/*'],
  engines: {
    node: '>=18.0.0',
  },
  scripts: {
    start: 'echo "Thanks for using the package 🎉🎉🎉"',
    test: 'echo "Error: no test specified" && exit 1',
  },
};

// Create the dist folder if it doesn't exist
const distPath = join(resolve(), 'dist');
await mkdir(distPath, { recursive: true });

// Write the generated package.json to the dist folder
await writeFile(join(distPath, 'package.json'), JSON.stringify(npmPackageConfig, null, 2), 'utf-8');

// Copy LICENSE from project root
const projectRoot = join(resolve(), '..');
await copyFile(join(projectRoot, 'LICENSE'), join(distPath, 'LICENSE'));

// Copy README.md with path fix
const readmeContent = await readFile(join(projectRoot, 'README.md'), 'utf-8');
const fixedReadme = readmeContent.replace(/\.\/html\/assets\//g, './assets/');
await writeFile(join(distPath, 'README.md'), fixedReadme, 'utf-8');

// Copy assets folder to dist/assets
await cp(join(resolve(), 'assets'), join(distPath, 'assets'), { recursive: true });
