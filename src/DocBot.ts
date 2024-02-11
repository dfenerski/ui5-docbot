import { CloseVectorNode } from '@langchain/community/vectorstores/closevector/node';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { GithubRepoLoader } from 'langchain/document_loaders/web/github';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { formatDocumentsAsString } from 'langchain/util/document';
import { stdin, stdout } from 'process';
import { createInterface } from 'readline/promises';
import { DOC_PATH, VECTOR_STORE_PATH } from './misc/constants';

export class DocBot {
    private static readonly logger = console;
    private static readonly model = new ChatOpenAI({
        modelName: 'gpt-4',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
    });
    private static outputParser = new StringOutputParser();
    private static documentLoader = new GithubRepoLoader(
        'https://github.com/SAP-docs/sapui5',
        {
            branch: 'main',
            recursive: true,
            unknown: 'warn',
            accessToken: process.env.GITHUB_TOKEN, // Optional
        },
    );
    private static textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    private static async getPrompt() {
        const readInterface = createInterface({
            input: stdin,
            output: stdout,
        });
        const prompt = await readInterface.question('Ask me a question: ');
        readInterface.close();
        return prompt;
    }

    public static async run() {
        // Load the docs
        this.logger.log('Loading documents...');
        const docs = await (async () => {
            // Reuse loaded json if it exists
            if (existsSync(DOC_PATH)) {
                return JSON.parse(readFileSync(DOC_PATH, 'utf8'));
            }
            // Otherwise use git repo web loader to retrieve them
            const docs = await this.documentLoader.load();
            // Store retrieved docs for later use
            writeFileSync(DOC_PATH, JSON.stringify(docs), 'utf-8');
            return docs;
        })();
        // Store the chunks in a vector database
        this.logger.log('Storing vectors...');
        const vectorStore = await (async () => {
            // Reuse loaded vector store if it exists
            if (existsSync(VECTOR_STORE_PATH)) {
                return CloseVectorNode.load(
                    VECTOR_STORE_PATH,
                    new OpenAIEmbeddings(),
                );
            }
            // Split into processable chunks
            this.logger.log('Splitting documents...');
            const splits = await this.textSplitter.splitDocuments(docs);
            // Create vector store from the splits
            const vectorStore = await CloseVectorNode.fromDocuments(
                splits,
                new OpenAIEmbeddings(),
            );
            // Save the vector store for later use
            await vectorStore.save(VECTOR_STORE_PATH);
            return vectorStore;
        })();
        // Create a retriever from the vector store
        const retriever = vectorStore.asRetriever();
        //
        this.logger.log('Ready to chat!');
        //
        const result = await RunnableSequence.from([
            new RunnableLambda({
                func: async ({ prompt }: any) => {
                    this.logger.log('Processing request...');
                    const relevantDocs = await retriever.getRelevantDocuments(
                        prompt,
                    );
                    const context = formatDocumentsAsString(relevantDocs);
                    return {
                        prompt,
                        context,
                    };
                },
            }),
            new ChatPromptTemplate({
                inputVariables: ['prompt', 'context'],
                promptMessages: [
                    SystemMessagePromptTemplate.fromTemplate(
                        'You are SAPGPT, a chatbot that knows everything about SAP UI5. Answer any questions you are knowledgable about, while trying to only output modern TypeScript in your responses.',
                    ),
                    HumanMessagePromptTemplate.fromTemplate('{prompt}'),
                    SystemMessagePromptTemplate.fromTemplate(
                        'Here is some relevant context: {context}',
                    ),
                ],
            }),
            this.model,
            this.outputParser,
        ]).invoke({
            prompt: process.argv[2] || (await this.getPrompt()),
        });
        //
        return result;
    }
}
