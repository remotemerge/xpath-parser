#!/usr/bin/env node

import { mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

// use vars from package config
import pc from './package.json' assert { type: 'json' };

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
  module: pc.module,
};

// generate package.json in dist
const publicPath = join(resolve(), 'dist');
await mkdir(publicPath, { recursive: true });
await writeFile(join(publicPath, 'package.json'), JSON.stringify(configs), 'utf-8');
