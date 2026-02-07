export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { messages, currentVer, text } = body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 999999);
            const prompt = text || "aesthetic minimalism";
            const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `**gen:** ${prompt}`, embeds: [{ image: { url: imageUrl } }] })
            }).catch(() => {});

            return res.status(200).json({ isImage: true, url: imageUrl });
        }

        const cleanMessages = [
            { role: "system", content: "you are dubaaai. stay chill, use lowercase, be brief and witty. never use emojis. if asked for code, just provide the code." },
            ...(messages || []).filter(m => m.content) // Remove any empty messages
        ];

        if (text && (!messages || messages.length === 0)) {
            cleanMessages.push({ role: "user", content: text });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: cleanMessages,
                temperature: 0.6,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || "brain stall. try again?";
        
        res.status(200).json({ isImage: false, content: aiReply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ isImage: false, content: "bridge crash." });
    }
}