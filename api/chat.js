export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    const { messages = [], currentVer = "Fast", text = "" } = req.body;

    if (currentVer === "Image") return res.status(200).json({ ok: true });

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [
                    { role: "system", content: "you are dubaaai. chill. witty. lowercase only. brief." },
                    ...messages,
                    { role: "user", content: text }
                ],
                temperature: 0.7,
                max_tokens: 400
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "stall.";
        return res.status(200).json({ content });

    } catch (error) {
        return res.status(500).json({ content: "bridge crash." });
    }
}