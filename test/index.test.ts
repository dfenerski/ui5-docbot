import assert from 'assert';
import { describe, it } from 'node:test';
import { DocBot } from '../src/DocBot';

const logger = console;

describe('DocBot', () => {
    it('should run & have access to specific data in the docs', async () => {
        // https://ui5.sap.com/#/topic/1c457c53595a6655e10000000a423f68
        process.argv[2] =
            'What are the supported data sources for APF apps OData services?';
        const result = await DocBot.run();
        assert.match(result, /1\. Calculation views/);
        assert.match(result, /2\. ABAP CDS/);
        assert.match(result, /3\. BW/);
        logger.log(result);
    });
});
