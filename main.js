import express from 'express';
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv';
import { LLMChain } from "langchain/chains";
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

const model = new OpenAI({
    temperature: 0.9,
});
app.use(cors());
const template = "tell the risk and p/l and compare the stock with other stock with the same industry of the {product} maximum of 60 words? ";
const prompttemplate = new PromptTemplate({
    template: template,
    inputVariables: ["product"],
});

const chain = new LLMChain({
    llm: model,
    prompt: prompttemplate
});

app.use(express.json());

app.get('/api/getStockInfo', async (req, res) => {
    try {
        const userQuery = req.query.question; // Assuming the user's question is passed as a query parameter

        if (!userQuery) {
            return res.status(400).json({ error: 'Missing question parameter' });
        }

        const result = await chain.call({
            product: userQuery
        });

        res.json({ data: result });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
