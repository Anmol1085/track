/**
 * script.js
 * Client-side script to collect non-sensitive browser and device metrics
 * and send them to our backend API.
 */

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Helper function to parse user agent for OS and Browser
    function parseUserAgent(ua) {
        let browser = "Unknown";
        let os = "Unknown";
        let deviceType = "Desktop";

        // Simple OS parsing
        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1) os = "MacOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("like Mac") !== -1) os = "iOS";

        // Simple Browser parsing
        if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("SamsungBrowser") !== -1) browser = "Samsung Internet";
        else if (ua.indexOf("Opera") !== -1 || ua.indexOf("OPR") !== -1) browser = "Opera";
        else if (ua.indexOf("Trident") !== -1) browser = "Internet Explorer";
        else if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1) browser = "Edge";
        else if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";

        // Simple Device Type parsing
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            deviceType = "Mobile / Tablet";
        }

        return { os, browser, deviceType };
    }

    // 2. Gather Data
    const uaInfo = parseUserAgent(navigator.userAgent);
    
    // Gather Battery Data (Async)
    let batteryLevel = "Not Supported";
    let isCharging = "Unknown";
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            batteryLevel = `${Math.round(battery.level * 100)}%`;
            isCharging = battery.charging ? "Yes ⚡" : "No";
        } catch (e) { }
    }
    
    // Gather Public IP from frontend (useful for local testing)
    let publicIp = null;
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        publicIp = ipData.ip;
    } catch (e) { }

    const analyticsData = {
        publicIp: publicIp,
        userAgent: navigator.userAgent,
        os: uaInfo.os,
        browser: uaInfo.browser,
        deviceType: uaInfo.deviceType,
        
        // screen.width and screen.height
        resolution: `${screen.width}x${screen.height}`,
        
        // navigator.hardwareConcurrency (CPU cores)
        cpuCores: navigator.hardwareConcurrency || "Unknown",
        
        // navigator.deviceMemory (RAM in GB, only available in Chromium browsers)
        ram: navigator.deviceMemory || null,
        
        // Intl.DateTimeFormat().resolvedOptions().timeZone
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
        
        // navigator.language
        language: navigator.language || "Unknown",
        
        // Current local visit time
        visitTime: new Date().toString(),
        
        // --- EXTRA DEVICE METRICS ---
        colorDepth: screen.colorDepth ? `${screen.colorDepth}-bit` : "Unknown",
        devicePixelRatio: window.devicePixelRatio || "Unknown",
        cookieEnabled: navigator.cookieEnabled ? "Yes" : "No",
        maxTouchPoints: navigator.maxTouchPoints || 0,
        connection: navigator.connection ? navigator.connection.effectiveType : "Unknown",
        referrer: document.referrer || "Direct / Bookmark",
        batteryLevel: batteryLevel,
        isCharging: isCharging
    };

    // 3. Send data to our backend Express server
    try {
        const response = await fetch('/api/visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsData)
        });

        if (response.ok) {
            console.log("Analytics sent successfully.");
        } else {
            console.error("Failed to send analytics.");
        }
    } catch (error) {
        console.error("Error communicating with analytics endpoint:", error);
    }
});
