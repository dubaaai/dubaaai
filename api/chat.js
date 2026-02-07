export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    const { messages, currentVer, text } = req.body;

    if (currentVer === "Image") {
        const seed = Math.floor(Math.random() * 1000000);
        const proxiedUrl = `/cdn-img/${encodeURIComponent(text || 'aesthetic')}?width=1024&height=1024&nologo=true&seed=${seed}`;
        return res.status(200).json({ isImage: true, url: proxiedUrl });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "you are dubaaai. chill. lowercase only." }, ...messages],
            temperature: 0.6
        })
    });
    const data = await response.json();
    return res.status(200).json({ isImage: false, content: data.choices?.[0]?.message?.content || "stall." });
}