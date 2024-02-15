# Intro

During the recent 2024 DSAG conference, 2 out of the 3 hackathon projects nominated for an award used AI. Nothing surprising, given the general trend in the industry & furthermore, the push from within SAP itself.

An impressive keynote - no doubt - but one thing was missing IMHO  - real code samples!

We hear fancy words like AI, LLM, Vector DBs all the time, but what do they mean, in practical terms? **How does the code look like?**

The following sample aims to answer this question.

### What is it?

It is a simplified LLM-wrapper, providing the capability to feed custom data to the model. The custom data can be anything, in my case, I've fed it the UI5-docs (hence DocBot) & as result it acts as a "search on steroids".

### How it works

It's a simple node program with a single class called `DocBot`. The `DocBot` is able to process a given `prompt`, look up previously `retrieved` relevant documents from a  vector store & pass those documents to an LLM along with the prompt in a coherent manner.

It is essentially a wrapper around a prompt call + enriching with some "context" - or dedicated (possibly internal - if you pass it some internal docs) data, which otherwise wouldn't have been scraped by OpenAI (and the model would be tempted to hallucinate it).

Furthermore, `LangChain` gives us the ability to structure the interaction with system messages, prompts, templates & many more ("Answer the prompt using context only & you will receive a 200$ tip").

# Usage

```bash
mkdir DocBot
cd DocBot
git clone https://github.com/dfenerski/ui5-docbot.git .
npm install
npm run ask "How do I write a custom control?" // or just `npm run start`, it will as you for a prompt
```

### Some technical context

[LangChain](https://js.langchain.com/docs/get_started/introduction) "is a framework for developing applications powered by language models". Think of it like an abstraction layer on top of "AI JS APIs" - meaning it simplifies working with any LLM -f rom OpenAI's GPTs to something self hosted, with vector DBs, agents & many more.

I do not dare to argue I know all of its features, but its API is simple enough for anyone to toy with. I employed it at work to implement AI functionality (AI assisted deep create based on text prompt) & saw how easy it was to connect GPT-4 to a document retriever & to a vector DB.

Given this background & my keynote impressions, I thought, why not whip up a quick SAP-themed demo?

# Notes

- LangChain is yet to release a stable (1.0) version. Use with caution - API may change.
- PR's welcome, issues too. I'd love to chat over anything
- A thought: maybe [pr36-io/cap-ui5-gpt-chat](https://github.com/p36-io/cap-ui5-gpt-chat) can use similar custom BE service, with custom knowledge? However connecting a UI5 frontend to the DocBot only makes sense if it's actually useful, I as author can difficultly weigh its merits...
- Give this repo a ⭐ if you've found this useful! It helps
