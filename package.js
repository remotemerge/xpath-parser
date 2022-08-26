#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// use vars from package config
import pc from './package.json' assert { type: 'json' };

// current directory
const __dirname = path.resolve();

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

// generate chrome manifest
const publicPath = `${__dirname}/dist`;
fs.existsSync(publicPath) || fs.mkdirSync(publicPath);
fs.createWriteStream(`${publicPath}/package.json`, 'utf-8').write(JSON.stringify(packageConfig));
