import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultDexisConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const Dexis_CONFIG_PATH = process.env.Dexis_CONFIG_PATH ?? configDir;
  // Initializing Dexis config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(Dexis_CONFIG_PATH, '.env'),
  });

  // 2. generate Dexis default config and assign to `globalThis.Dexis`
  globalThis.Dexis = getDefaultDexisConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/Dexis.env`
  // 3. load env => config map to `globalThis.Dexis.ENV_MAP
  await loadRemote(Dexis_CONFIG_PATH, 'Dexis.env.js');

  // 4. load `config/Dexis` to patch custom configs
  await loadRemote(Dexis_CONFIG_PATH, 'Dexis.js');

  // 5. load `config/Dexis.self` to patch custom configs
  // This is the file only take effect in [Dexis Cloud]
  if (!Dexis.isSelfhosted) {
    await loadRemote(Dexis_CONFIG_PATH, 'Dexis.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.Dexis`
  applyEnvToConfig(globalThis.Dexis);

  if (Dexis.node.dev) {
    console.log(
      'Dexis Config:',
      JSON.stringify(omit(globalThis.Dexis, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
