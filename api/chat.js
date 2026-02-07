export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { messages = [], currentVer = "Fast", text = "" } = req.body;

        if (currentVer === "Image") {
            return res.status(200).json({ isImage: true, text: text });
        }

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: "you are dubaaai. chill. lowercase." }, ...messages],
                temperature: 0.6
            })
        });

        const data = await groqRes.json();
        return res.status(200).json({ isImage: false, content: data.choices?.[0]?.message?.content || "stall." });

    } catch (error) {
        return res.status(500).json({ isImage: false, content: "bridge error." });
    }
}