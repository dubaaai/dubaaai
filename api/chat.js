export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const messages = req.body.messages || [];
        const currentVer = req.body.currentVer || "Fast";
        const text = req.body.text || "";

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 1000000);
            const prompt = encodeURIComponent(text || 'aesthetic');
            
            const rawUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            const finalUrl = `https://corsproxy.io/?${rawUrl}`;
            
            return res.status(200).json({ isImage: true, url: finalUrl });
        }

        if (!process.env.GROQ_KEY) {
            return res.status(200).json({ isImage: false, content: "api key missing in vercel env." });
        }

        const vibes = {
            Fast: "you are dubaaai. chill, witty, lowercase only, brief.",
            Complex: "you are dubaaai. deep analysis mode. stay chill but detailed. lowercase.",
            Dev: "you are dubaaai dev. coding expert. clean code blocks, technical, lowercase."
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${process.env.GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: vibes[currentVer] || vibes.Fast },
                    ...messages 
                ],
                temperature: 0.6
            })
        });

        const data = await response.json();
        
        const aiReply = data.choices?.[0]?.message?.content || "stall. groq returned empty.";
        
        return res.status(200).json({ isImage: false, content: aiReply });

    } catch (error) {
        console.error("Handler Error:", error);
        return res.status(500).json({ isImage: false, content: "bridge crashed. check logs." });
    }
}