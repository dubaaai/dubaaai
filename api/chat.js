export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const messages = req.body.messages || [];
        const currentVer = req.body.currentVer || "Fast";
        const text = req.body.text || "";

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 1000000);
            const rawUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text || 'aesthetic')}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            const imgRes = await fetch(rawUrl);
            const buffer = await imgRes.arrayBuffer();
            
            const base64 = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64}`;
            
            return res.status(200).json({ isImage: true, url: dataUrl });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: "you are dubaaai. chill. lowercase." }, ...messages],
                temperature: 0.6
            })
        });

        const data = await response.json();
        return res.status(200).json({ isImage: false, content: data.choices?.[0]?.message?.content || "stall." });

    } catch (e) {
        return res.status(500).json({ isImage: false, content: "bridge error." });
    }
}