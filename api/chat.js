export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    try {
        const { messages, currentVer, text } = req.body;

        if (currentVer === "Image") {
            const seed = Math.floor(Math.random() * 1000000);
            const prompt = text || 'aesthetic minimalism';
            
            const proxiedUrl = `/cdn/image/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
            
            return res.status(200).json({ 
                isImage: true, 
                url: proxiedUrl 
            });
        }

        const vibes = {
            Fast: "you are dubaaai. chill, witty, lowercase only, brief. no emojis.",
            Complex: "you are dubaaai. deep analysis mode. stay chill but provide detailed, high-level thoughts. lowercase only.",
            Dev: "you are dubaaai dev. coding expert. provide clean code blocks and technical logic. lowercase only."
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
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiContent = data.choices?.[0]?.message?.content || "stall. try again.";
        
        return res.status(200).json({ 
            isImage: false, 
            content: aiContent 
        });

    } catch (e) {
        console.error("Bridge Error:", e);
        return res.status(500).json({ 
            isImage: false, 
            content: "bridge error. check logs." 
        });
    }
}