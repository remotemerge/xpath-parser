import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// Read and parse the root package.json
const cwd = process.cwd();
const packageJson = await Bun.file(join(cwd, 'package.json')).json();

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

// Write the generated package.json to the dist folder
const distPath = join(cwd, 'dist');
await Bun.write(join(distPath, 'package.json'), JSON.stringify(npmPackageConfig, null, 2));

// Copy LICENSE from project root
await Bun.write(join(distPath, 'LICENSE'), Bun.file(join(cwd, '..', 'LICENSE')));

// Copy README.md with path fix
const readmeContent = await Bun.file(join(cwd, '..', 'README.md')).text();
const fixedReadme = readmeContent.replace(/\.\/html\/assets\//g, './assets/');
await Bun.write(join(distPath, 'README.md'), fixedReadme);

// Copy assets folder to dist/assets
const distAssetsPath = join(distPath, 'assets');
await mkdir(distAssetsPath, { recursive: true });
await cp(join(cwd, 'assets'), distAssetsPath, { recursive: true });