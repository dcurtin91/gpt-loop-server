
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';

const firebaseConfig = {
   
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
import http from 'http'
import express from 'express';
const appp = express();
import cors from 'cors'
appp.use(cors());
import bodyParser from 'body-parser';
appp.use(bodyParser.json());
// const host = '0.0.0.0';
const PORT = process.env.PORT || 5000;
import { Configuration, OpenAIApi } from 'openai';
const colRef = collection(db, "chat-rooms/chat/messages");
const q = query(colRef, orderBy("timestamp", "desc"));


const server = http.createServer(async (req, res) => {



    const configuration = new Configuration({
        apiKey: '',
    });
    const openai = new OpenAIApi(configuration);


    const docsSnap = await getDocs(q);
    if (docsSnap.size > 0) {
        const latestDoc = docsSnap.docs[0];
        const text = latestDoc.data().text;



        const prompt = docsSnap.size % 2 === 0 ? "Pretend you are a person who must decline sales pitches without offending anyone." : "Pretend you are a salesperson who can't take no for an answer."


        req = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt + text }],

            temperature: 0.8,
            presence_penalty: 2.0,
            frequency_penalty: 2.0,
        });

        const chatResponse = req.data.choices[0].message.content;


        // const origin = process.env.NODE_ENV === 'production' ? 'https://gpt-loop.herokuapp.com/' : 'http://localhost:3000';

        const origin = 'https://dcurtin91.github.io';

        res.setHeader('Access-Control-Allow-Origin', origin);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ chatResponse }));
    }
});





server.listen(PORT, () => console.log('Server is listening on port', PORT));
