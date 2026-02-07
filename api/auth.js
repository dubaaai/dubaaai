export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
        return res.redirect(DISCORD_AUTH_URL);
    }

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.REDIRECT_URI,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json();

        const guildMemberResponse = await fetch(`https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${userData.id}`, {
            headers: { Authorization: `Bot ${process.env.CLIENT_TOKEN}` },
        });
        const memberData = await guildMemberResponse.json();

        const roles = memberData.roles || [];
        const isAdmin = roles.includes("1408919581896212620");

        res.redirect(`/?user=${userData.username}&avatar=${userData.avatar}&roles=${roles.join(',')}&isAdmin=${isAdmin}`);

    } catch (error) {
        res.status(500).json({ error: "Auth Failed" });
    }
}