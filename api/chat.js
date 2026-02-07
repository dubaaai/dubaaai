export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { messages, currentVer, text } = body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 999999);
            const prompt = text || "aesthetic cyberpunk";
            const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `**gen:** ${prompt}`, embeds: [{ image: { url: imageUrl } }] })
            }).catch(e => console.error("Discord Backup Failed"));

            return res.status(200).json({ isImage: true, url: imageUrl });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "your name is dubaaai. you are a helpful, witty, and grounded assistant. keep it chill, use lowercase, and be direct. do not over-explain. if the user asks for something, do it exactly as requested." },
                    ...messages
                ],
                temperature: 0.5 
            })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || "i'm lost. say that again?";
        res.status(200).json({ isImage: false, content: aiReply });

    } catch (error) {
        res.status(500).json({ error: "bridge error" });
    }
}