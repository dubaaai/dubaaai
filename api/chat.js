export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { messages, currentVer, text } = body;

        if (currentVer === "Image") {
            const tempUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(text || 'aesthetic')}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*99999)}`;
            
            const discordRes = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `**gen:** ${text}`,
                    embeds: [{ image: { url: tempUrl } }]
                })
            });

            const discordData = await discordRes.json();
            
            const finalUrl = discordData.embeds?.[0]?.image?.url || tempUrl;
            return res.status(200).json({ isImage: true, url: finalUrl });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.6
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        res.status(200).json({ isImage: false, content: data.choices[0].message.content });

    } catch (error) {
        console.error("Bridge Error:", error);
        res.status(500).json({ error: "bridge error", details: error.message });
    }
}