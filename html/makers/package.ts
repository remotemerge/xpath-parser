import { readFileSync } from 'fs';
import { copyFile, mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

// use vars from package config
const pc = JSON.parse(readFileSync(`${resolve()}/package.json`, 'utf8'));

const stripDist = (value: string) => value.replace(/^(\.\/|\.\.\/)?dist\//, '');

const rewriteExports = (exports: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(exports)) {
    if (typeof val === 'string') {
      out[key] = './' + stripDist(val);
    } else if (val && typeof val === 'object') {
      out[key] = rewriteExports(val as Record<string, unknown>);
    }
  }
  return out;
};

// format configs
const configs = {
  name: pc.name,
  version: pc.version,
  description: pc.description,
  license: pc.license,
  keywords: pc.keywords,
  author: pc.author,
  repository: pc.repository,
  bugs: pc.bugs,
  type: pc.type,
  types: stripDist(pc.types),
  main: stripDist(pc.main),
  module: stripDist(pc.module),
  exports: rewriteExports(pc.exports),
  dependencies: pc.dependencies,
};

// generate package.json in dist
const publicPath = join(resolve(), 'dist');
await mkdir(publicPath, { recursive: true });
await writeFile(join(publicPath, 'package.json'), JSON.stringify(configs), 'utf-8');

// copy README.md to dist
await copyFile('../README.md', `${publicPath}/README.md`);
