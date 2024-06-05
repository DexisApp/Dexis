/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = Dexis.deploy ? '0.0.0.0' : 'localhost';
await app.listen(Dexis.port, listeningHost);

const logger = new Logger('App');

logger.log(`Dexis Server is running in [${Dexis.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${Dexis.port}`);
logger.log(`And the public server should be recognized as ${Dexis.baseUrl}`);
