const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;


// Facebook webhook verification
app.get("/webhook", (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});


// Receive Messenger messages
app.post("/webhook", async (req, res) => {

    const body = req.body;

    if (body.object !== "page") {
        return res.sendStatus(404);
    }

    for (const entry of body.entry || []) {

        for (const event of entry.messaging || []) {

            if (!event.sender || !event.sender.id) {
                continue;
            }

            const senderId = event.sender.id;

            if (event.message && event.message.text) {

                const message =
                    event.message.text.trim().toLowerCase();

                await handleMessage(senderId, message);
            }
        }
    }

    res.status(200).send("EVENT_RECEIVED");
});


// Bot replies
async function handleMessage(senderId, message) {

    let reply;


    if (
        message === "hi" ||
        message === "hello" ||
        message === "হাই" ||
        message === "হ্যালো"
    ) {

        reply =
`আসসালামু আলাইকুম! 👋

আমাদের Messenger Bot-এ আপনাকে স্বাগতম।

"menu" লিখে পাঠান।`;
    }


    else if (
        message === "menu" ||
        message === "মেনু"
    ) {

        reply =
`📋 MENU

1️⃣ আমাদের সম্পর্কে
2️⃣ সাহায্য
3️⃣ যোগাযোগ

1, 2 অথবা 3 পাঠান।`;
    }


    else if (message === "1") {

        reply =
`ℹ️ আমাদের সম্পর্কে

এটি একটি Messenger chatbot। 🤖`;
    }


    else if (message === "2") {

        reply =
`🆘 সাহায্য

আপনি লিখতে পারেন:

hi
menu
1
2
3`;
    }


    else if (message === "3") {

        reply =
`📞 যোগাযোগ

আমাদের Facebook Page-এর মাধ্যমে যোগাযোগ করুন।`;
    }


    else {

        reply =
`দুঃখিত 😅

আমি এই মেসেজটি বুঝতে পারিনি।

"menu" লিখে পাঠান।`;
    }


    await sendMessage(senderId, reply);
}


// Send reply to Messenger
async function sendMessage(senderId, text) {

    const url =
        `https://graph.facebook.com/v23.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

    try {

        const response = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                recipient: {
                    id: senderId
                },

                message: {
                    text: text
                }

            })
        });

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.error(error);

    }
}


// Test page
app.get("/", (req, res) => {

    res.send("Messenger Bot is running 🤖");

});


app.listen(PORT, () => {

    console.log(`Bot running on port ${PORT}`);

});
