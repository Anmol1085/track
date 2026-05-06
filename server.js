require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy if you are deploying to platforms like Render/Heroku so we get the real IP
app.set('trust proxy', true);

// POST endpoint to receive visitor data
app.post('/api/visit', async (req, res) => {
    try {
        const visitorData = req.body;

        // Parse User-Agent using ua-parser-js for exact device models
        const UAParser = require('ua-parser-js');
        const parser = new UAParser(visitorData.userAgent);
        const uaInfo = parser.getResult();
        
        const deviceVendor = uaInfo.device.vendor || "";
        const deviceModel = uaInfo.device.model || "";
        const fallbackDeviceType = visitorData.deviceType || "Desktop";
        const exactDevice = (deviceVendor || deviceModel) 
            ? `${deviceVendor} ${deviceModel}`.trim() 
            : fallbackDeviceType;
            
        const exactOs = uaInfo.os.name ? `${uaInfo.os.name} ${uaInfo.os.version || ''}`.trim() : (visitorData.os || "Unknown");
        const exactBrowser = uaInfo.browser.name ? `${uaInfo.browser.name} ${uaInfo.browser.version || ''}`.trim() : (visitorData.browser || "Unknown");

        // Get the visitor's IP address
        // Prioritize the frontend public IP if we are testing locally
        let ip = visitorData.publicIp || req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown IP';
        
        // Clean up IPv6 localhost formatting
        if (ip === '::1') ip = '127.0.0.1';

        let location = "Unknown Location";
        let isp = "Unknown ISP";

        // Fetch location data from IP
        if (ip && ip !== 'Unknown IP' && ip !== '::1' && ip !== '127.0.0.1') {
            try {
                // Using ip-api for free IP geolocation
                const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
                const geoData = await geoRes.json();
                if (geoData.status === "success") {
                    location = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
                    isp = geoData.isp || "Unknown ISP";
                }
            } catch (err) {
                console.error("Geo-IP fetch failed:", err);
            }
        } else if (ip === '::1' || ip === '127.0.0.1') {
            location = "Localhost (Testing)";
        }

        // Prepare the message payload for the Discord Webhook
        const discordMessage = {
            embeds: [
                {
                    title: "🚀 New Visitor Analytics Data",
                    color: 0x00FF00, // Green color hex
                    timestamp: new Date().toISOString(),
                    fields: [
                        { name: "🌐 IP Address", value: ip, inline: true },
                        { name: "📍 Location", value: location, inline: true },
                        { name: "🏢 ISP", value: isp, inline: true },
                        { name: "💻 OS", value: exactOs, inline: true },
                        { name: "📱 Device", value: exactDevice, inline: true },
                        { name: "🧭 Browser", value: exactBrowser, inline: true },
                        { name: "🖥️ Resolution", value: visitorData.resolution || "Unknown", inline: true },
                        { name: "⏱️ Timezone", value: visitorData.timezone || "Unknown", inline: true },
                        { name: "🧠 CPU Cores", value: String(visitorData.cpuCores) || "Unknown", inline: true },
                        { name: "💾 RAM Estimate", value: visitorData.ram ? `${visitorData.ram} GB` : "Unknown", inline: true },
                        { name: "🗣️ Language", value: visitorData.language || "Unknown", inline: true },
                        { name: "⏰ Visit Time (Local)", value: visitorData.visitTime || "Unknown", inline: false },
                        { name: "🔋 Battery", value: visitorData.batteryLevel || "Unknown", inline: true },
                        { name: "⚡ Charging", value: visitorData.isCharging || "Unknown", inline: true },
                        { name: "🎨 Color Depth", value: String(visitorData.colorDepth) || "Unknown", inline: true },
                        { name: "🔍 Pixel Ratio", value: String(visitorData.devicePixelRatio) || "Unknown", inline: true },
                        { name: "🍪 Cookies", value: visitorData.cookieEnabled || "Unknown", inline: true },
                        { name: "👆 Touch Points", value: String(visitorData.maxTouchPoints) || "Unknown", inline: true },
                        { name: "📶 Network", value: visitorData.connection || "Unknown", inline: true },
                        { name: "🔗 Referrer", value: visitorData.referrer || "Unknown", inline: true },
                        { name: "🕵️ User-Agent", value: visitorData.userAgent || "Unknown", inline: false }
                    ],
                    footer: {
                        text: "Portfolio Analytics Bot"
                    }
                }
            ]
        };

        // If a Discord Webhook URL is set, send the data
        if (DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_URL !== "YOUR_DISCORD_WEBHOOK_URL_HERE") {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordMessage)
            });

            if (!response.ok) {
                console.error(`Error sending to Discord: ${response.status} ${response.statusText}`);
            } else {
                console.log("Visitor data successfully sent to Discord!");
            }
        } else {
            console.log("⚠️ Discord Webhook URL is not set. Visitor data logged:");
            console.log(JSON.stringify(visitorData, null, 2));
            console.log(`IP: ${ip}`);
        }

        // Send a success response back to the client
        res.status(200).json({ success: true, message: "Analytics received." });

    } catch (error) {
        console.error("Error processing visit:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
