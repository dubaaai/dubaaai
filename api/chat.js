export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        let { messages, currentVer, text } = body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 999999);
            const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(text || 'aesthetic')}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            fetch(`https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `**gen:** ${text}`, embeds: [{ image: { url: imageUrl } }] })
            }).catch(() => {});

            return res.status(200).json({ isImage: true, url: imageUrl });
        }

        const vibes = {
            Fast: "you are dubaaai. chill, witty, lowercase only. be brief.",
            Complex: "you are dubaaai. deep thinker. provide detailed, high-level analysis but keep the aesthetic chill and lowercase.",
            Dev: "you are dubaaai's dev mode. expert coder. provide clean code blocks and technical logic. lowercase, no fluff."
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: vibes[currentVer] || vibes.Fast }, ...messages],
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.status(200).json({ isImage: false, content: data.choices?.[0]?.message?.content || "stall. try again." });

    } catch (error) {
        res.status(200).json({ isImage: false, content: "bridge error." });
    }
}