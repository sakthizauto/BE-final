import express from 'express';
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv';
import { LLMChain } from "langchain/chains";
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3000;
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt'
mongoose.connect('mongodb://0.0.0.0/project', { useUnifiedTopology: true })


app.use(cors());
app.use(express.json());

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema, 'my_custom_users_collection');

app.use(bodyParser.json());
app.post('/api/signup-user', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






















dotenv.config();

const model = new OpenAI({
    temperature: 0.9,
});
app.use(cors());
const template = "you are finacial advisor,tell the topic about{product} stock and  give some tips and compare the related stock";
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

