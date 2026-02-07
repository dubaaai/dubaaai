export default async function handler(req, res) {
    const { code } = req.query;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    if (!code) {
        const authUrl = new URL('https://discord.com/api/oauth2/authorize');
        authUrl.searchParams.append('client_id', process.env.CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', 'identify guilds');

        return res.redirect(authUrl.toString());
    }

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error_description || tokenData.error });
        }

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

        const target = new URL('https://dubaaai.vercel.app/');
        target.searchParams.append('user', userData.username);
        target.searchParams.append('roles', roles.join(','));
        target.searchParams.append('isAdmin', isAdmin.toString());

        res.redirect(target.toString());

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Authentication internal error" });
    }
}