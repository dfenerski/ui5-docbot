# Intro

During the recent 2024 DSAG conference, 2 out of the 3 hackathon projects nominated for an award used AI. Nothing surprising, given the general trend in the industry & furthermore, the push from within SAP itself.

An impressive keynote - no doubt - but one thing was missing IMO - real code samples!

We hear fancy words like AI, LLM, Vector DBs all the time, but what do they mean, in practical terms?
**How does the code look like?**

The following sample aims to answer this question.

### What is it?

It is a simple LLM-wrapper, adding the capability to feed custom data to the model. The custom data can be anything, in my case, I've fed it the UI5-docs (hence DocBot) & as result it acts as a "search on steroids".

### How it works

The node program contains a single class called `DocBot`. `DocBot` is able to process a given `prompt`, look up previously `retrieved` relevant documents from a vector store & pass those documents to an LLM along with the prompt in a coherent manner.

The big advantage is that by providing `context` we can force the LLM to use it as exclusive data source. Furthermore, the context can be generated using any - possibly internal - data.

Furthermore, `LangChain` gives us the ability to structure the interaction with the LLM through system messages, prompts, prompt templates & many more. Using those you can pretty much build a tailored AI system for your specific case ("Answer the prompt using context only & you will receive a 200$ tip").

# Usage

```bash
mkdir DocBot
cd DocBot
git clone https://github.com/dfenerski/ui5-docbot.git .
npm install
OPENAI_API_KEY="<your key here>" npm run ask "What binding modes are there?" // or just `npm run start`, it will ask you for a prompt
```

It will be a bit slow on the first run, as it has to scrape the docs & create a vector DB. For later calls however, these are cached so it should be decently fast.

It is encouraged to add a `.env` file where you place your `OPENAI_API_KEY`. Additionally, add a `GITHUB_TOKEN`if you are going to make it scrape other github repos, there's a rate limit for unauthenticated requests as the error message will tell you.

### Some technical context

[LangChain](https://js.langchain.com/docs/get_started/introduction) "is a framework for developing applications powered by language models". Think of it like an abstraction layer on top of "AI JS APIs" - meaning it simplifies working with any LLM (from OpenAI's GPTs to something self hosted), with vector DBs, agents & many more.

I do not dare to argue I know all of its features, but its API is simple enough for anyone to toy with. I employed it at work to implement AI functionality (AI assisted deep create based on text prompt) & saw how easy it was to connect GPT-4 to a document retriever & to a vector DB.

Given this background & my keynote impressions, I thought, why not whip up a quick SAP-themed demo?

# Notes

-   LangChain is yet to release a stable (1.0) version. Use with caution - API may change.
-   PRs welcome, issues too. I'd love to chat over anything
-   A thought: maybe [pr36-io/cap-ui5-gpt-chat](https://github.com/p36-io/cap-ui5-gpt-chat) can use similar custom BE service, with custom knowledge? However connecting a UI5 frontend to the DocBot only makes sense if it's actually useful, I as author can difficultly weigh its merits...
-   Give this repo a ⭐ if you've found it useful!
