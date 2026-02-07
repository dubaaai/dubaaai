export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).send("no url");

    try {
        const response = await fetch(decodeURIComponent(url));
        if (!response.ok) throw new Error();

        const contentType = response.headers.get("content-type");
        const buffer = await response.arrayBuffer();
        
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("Content-Type", contentType || "image/png");
        return res.send(Buffer.from(buffer));
    } catch (e) {
        return res.status(500).send("cdn error");
    }
}