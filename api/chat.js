export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    const { messages = [], text = "" } = req.body;

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
                temperature: 0.6,
                max_tokens: 300 
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "bridge dry.";
        return res.status(200).json({ content });

    } catch (error) {
        return res.status(500).json({ content: "bridge stall." });
    }
}