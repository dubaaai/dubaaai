export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    const { messages = [], text = "" } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.ROUTER_API_KEY}`, 
                "Content-Type": "application/json",
                "HTTP-Referer": "https://dubaaai.vercel.app", 
                "X-Title": "dubaaai"
            },
            body: JSON.stringify({
                model: "anthropic/claude-3.5-sonnet", 
                messages: [
                    { role: "system", content: "You are the dubaaai math expert. Be precise. Use LaTeX for math. Smart aesthetic." },
                    ...messages,
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json({ content: data.choices?.[0]?.message?.content || "api dry." });
    } catch (e) {
        return res.status(500).json({ content: "bridge stall." });
    }
}