import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv';
import { LLMChain } from "langchain/chains";
const cors = require('cors');

const express = require('express');
const app = express();
const port = 3000;
app.use(cors());
dotenv.config();
const model = new OpenAI({
    temperature: 0.9,
})
const template = "tell the risk and p/l and compare the stock with other stock with same industry of the {product} maximum of 60 words? ";
const prompttemplate = new PromptTemplate({
    template: template,
    inputVariables: ["product"]

});

const chain = new LLMChain({
    llm: model,
    prompt: prompttemplate
});

const res = await chain.call({
    product: "equitas"
})
console.log(res)

app.get('/api/getStockInfo', async (req, res) => {
    try {
        const result = await chain.call({
            product: "equitas"
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




