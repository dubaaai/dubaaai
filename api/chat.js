export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { messages, currentVer, text } = req.body;

        if (currentVer === "Image") {
            const cleanPrompt = encodeURIComponent(text || 'aesthetic');
            const seed = Math.floor(Math.random() * 999999);
            
            const proxiedUrl = `/cdn-img/${cleanPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&t=${Date.now()}`;
            
            return res.status(200).json({ isImage: true, url: proxiedUrl });
        }

        const vibes = {
            Fast: "you are dubaaai. chill, witty, lowercase only, brief.",
            Complex: "you are dubaaai. deep analysis mode. lowercase only.",
            Dev: "you are dubaaai dev. coding expert. lowercase only."
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: vibes[currentVer] || vibes.Fast }, ...messages],
                temperature: 0.6
            })
        });

        const data = await response.json();
        return res.status(200).json({ isImage: false, content: data.choices?.[0]?.message?.content || "stall." });

    } catch (e) {
        return res.status(500).json({ isImage: false, content: "bridge error." });
    }
}