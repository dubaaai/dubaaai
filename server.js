require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

const Form = mongoose.model('Form', new mongoose.Schema({
    title: String,
    time: String,
    role: String,
    questions: Array
}));

const Submission = mongoose.model('Submission', new mongoose.Schema({
    formId: String,
    formTitle: String,
    username: String,
    userId: String,
    userAvatar: String,
    answers: Array,
    submittedAt: { type: Date, default: Date.now }
}));

app.get('/api/auth', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
    res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenRes.data.access_token;
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        let roles = [];
        try {
            const memberRes = await axios.get(`https://discord.com/api/users/@me/guilds/${process.env.GUILD_ID}/member`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            roles = memberRes.data.roles;
        } catch (e) {}

        const params = new URLSearchParams({
            user: userRes.data.username,
            id: userRes.data.id,
            avatar: userRes.data.avatar,
            roles: roles.join(',')
        });
        res.redirect(`/?${params.toString()}`);
    } catch (err) {
        res.status(500).send("Auth Failed");
    }
});

app.post('/api/forms', async (req, res) => {
    try {
        const newForm = new Form(req.body);
        await newForm.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/forms', async (req, res) => {
    res.json(await Form.find());
});

app.get('/api/forms/:id', async (req, res) => {
    res.json(await Form.findById(req.params.id));
});

app.post('/api/submissions', async (req, res) => {
    try {
        const sub = new Submission(req.body);
        await sub.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/submissions', async (req, res) => {
    res.json(await Submission.find().sort({ submittedAt: -1 }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));