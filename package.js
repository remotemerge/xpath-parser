#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// current directory
const __dirname = path.resolve();

// read package config
const configFile = await fs.readFile(path.join(__dirname, 'package.json'), 'utf-8');
const pc = JSON.parse(configFile);

// format configs
const packageConfig = {
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
const publicPath = path.join(__dirname, 'dist');
await fs.mkdir(publicPath, { recursive: true });
await fs.writeFile(path.join(publicPath, 'package.json'), JSON.stringify(packageConfig));
