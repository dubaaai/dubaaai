export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { messages = [], currentVer = "Fast", text = "" } = req.body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 1000000);
            const prompt = encodeURIComponent(text || 'aesthetic');
            const rawUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error('Pollinations fetch failed');
            
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            
            const dataUrl = `data:image/png;base64,${base64}`;
            
            return res.status(200).json({ isImage: true, url: dataUrl });
        }

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "you are dubaaai. chill. witty. lowercase only." },
                    ...messages
                ],
                temperature: 0.6
            })
        });

        const data = await groqRes.json();
        const content = data.choices?.[0]?.message?.content || "stall.";
        return res.status(200).json({ isImage: false, content });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ isImage: false, content: "bridge failed." });
    }
}