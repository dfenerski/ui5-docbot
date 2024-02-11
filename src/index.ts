import { DocBot } from './DocBot';

const logger = console;

const result = await DocBot.run();

logger.log(result);
