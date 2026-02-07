import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);

export default async function handler(req, res) {
    try {
        await client.connect();
        const db = client.db('jcustoms');
        const collection = db.collection('forms');

        if (req.method === 'POST') {
            const { title, time, role, questions } = req.body;
            await collection.insertOne({ title, time, role, questions, createdAt: new Date() });
            return res.status(200).json({ success: true });
        }

        if (req.method === 'GET') {
            const forms = await collection.find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(forms);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await client.close();
    }
}