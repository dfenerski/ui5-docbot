import { StringOutputParser } from '@langchain/core/output_parsers';
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import 'dotenv/config';
import { GithubRepoLoader } from 'langchain/document_loaders/web/github';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { formatDocumentsAsString } from 'langchain/util/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

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
            accessToken: process.env.GITHUB_TOKEN,
        },
    );
    private static textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    public static async run() {
        // Load the docs
        this.logger.log('Loading documents...');
        const docs = await this.documentLoader.load();
        // Split into processable chunks
        this.logger.log('Splitting documents...');
        const splits = await this.textSplitter.splitDocuments(docs);
        // Store the chunks in a vector database
        this.logger.log('Storing vectors...');
        const vectorStore = await MemoryVectorStore.fromDocuments(
            splits,
            new OpenAIEmbeddings(),
        );
        // Create a retriever from the vector store
        const retriever = vectorStore.asRetriever();
        //
        this.logger.log('Ready to chat!');
        // return;
        const res = await RunnableSequence.from([
            new RunnableLambda({
                func: async ({ prompt }: any) => {
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
            prompt: 'How do I export data to Excel?',
        });
        this.logger.error(res);
    }
}

DocBot.run();
