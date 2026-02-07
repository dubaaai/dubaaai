export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { messages, currentVer, text } = body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 999999);
            const prompt = text || "aesthetic cyberpunk landscape";
            const tempUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            try {
                const discordRes = await fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `**dubaaai gen:** ${prompt}`,
                        embeds: [{ image: { url: tempUrl } }]
                    })
                });

                const discordData = await discordRes.json();
                const finalUrl = discordData.embeds?.[0]?.image?.proxy_url || discordData.embeds?.[0]?.image?.url || tempUrl;
                return res.status(200).json({ isImage: true, url: finalUrl });
            } catch (discordErr) {
                return res.status(200).json({ isImage: true, url: tempUrl });
            }
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
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        const aiReply = data.choices?.[0]?.message?.content || "i'm speechless. try again?";
        res.status(200).json({ isImage: false, content: aiReply });

    } catch (error) {
        console.error("Bridge Error:", error);
        res.status(500).json({ isImage: false, content: "bridge crashed. check logs." });
    }
}