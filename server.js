const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
app.use(express.json());

// =========================
// CONFIG & API KEY
// =========================
const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = path.join(__dirname, "downloads");
const API_KEY = process.env.API_KEY || "MAINUL-X-SECRET"; // Your secret key

// Auto-delete config (e.g., 10 minutes)
const FILE_RETENTION_MS = 10 * 60 * 1000; 

// Create downloads folder
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

// =========================
// STATS TRACKER
// =========================
let apiStats = {
    totalRequests: 0,
    successDownloads: 0,
    failedDownloads: 0,
    filesAutoDeleted: 0 // Tracks how many files were cleaned up
};

// =========================
// AUTO STORAGE CLEANUP (CRON)
// =========================
function cleanupOldFiles() {
    fs.readdir(DOWNLOAD_DIR, (err, files) => {
        if (err) return;
        const now = Date.now();
        
        files.forEach(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                // If file is older than retention time, delete it
                if (now - stats.mtimeMs > FILE_RETENTION_MS) {
                    fs.unlink(filePath, err => {
                        if (!err) {
                            apiStats.filesAutoDeleted++;
                            console.log(`🗑️ Auto-deleted old file to save space: ${file}`);
                        }
                    });
                }
            });
        });
    });
}
// Run the cleanup check every 1 minute
setInterval(cleanupOldFiles, 60 * 1000);

// =========================
// DEVELOPER INFORMATION
// =========================
const AUTHOR = "Md. Mainul Islam";
const OWNER = "MAINUL - X";
const GITHUB = "M41NUL";
const GITHUB_URL = "https://github.com/M41NUL";
const WHATSAPP = "+8801308850528";
const TELEGRAM = "@mdmainulislaminfo";
const EMAIL = "githubmainul@gmail.com, devmainulislam@gmail.com";
const LICENSE = "MIT License";
const YEAR = new Date().getFullYear();
const COPYRIGHT = `Copyright (c) ${YEAR} ${OWNER}`;

// =========================
// HELPER: SYSTEM HEALTH
// =========================
function getSystemHealth() {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

    let status = "Healthy";
    let color = "#10b981"; // Emerald Green

    if (usedMemPercent > 85) {
        status = "Critical";
        color = "#ef4444"; // Red
    } else if (usedMemPercent > 70) {
        status = "Warning";
        color = "#f59e0b"; // Amber
    }

    return { status, color, usedMemPercent: usedMemPercent.toFixed(1) };
}

function formatUptime(uptime) {
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    return `${h}h ${m}m ${s}s`;
}

// =========================
// ROOT API (GLASSMORPHISM DASHBOARD)
// =========================
app.get("/", (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MAINUL-X API Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --text-main: #ffffff;
                --text-muted: #94a3b8;
                --accent: #0ea5e9;
                --accent-glow: rgba(14, 165, 233, 0.5);
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --glass-bg: rgba(255, 255, 255, 0.05);
                --glass-border: rgba(255, 255, 255, 0.1);
            }
            * { box-sizing: border-box; }
            
            body {
                font-family: 'Poppins', sans-serif;
                margin: 0; padding: 20px;
                color: var(--text-main);
                min-height: 100vh;
                /* Animated Gradient Background */
                background: linear-gradient(-45deg, #0f172a, #1e1b4b, #064e3b, #312e81);
                background-size: 400% 400%;
                animation: gradientBG 15s ease infinite;
            }

            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            .container { max-width: 950px; margin: 0 auto; padding-bottom: 40px;}
            
            .header { text-align: center; margin-bottom: 40px; padding-top: 20px;}
            .header h1 { 
                color: #fff; 
                margin-bottom: 15px; 
                font-weight: 700;
                text-shadow: 0 0 20px var(--accent-glow);
            }
            
            #health-badge {
                display: inline-block; padding: 6px 16px;
                border-radius: 30px; font-weight: 600; font-size: 14px;
                backdrop-filter: blur(5px);
                border: 1px solid transparent;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }

            /* Glassmorphism Card */
            .card {
                background: var(--glass-bg);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 25px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            }
            .card:hover { transform: translateY(-5px); }

            .card h2 {
                margin-top: 0; 
                color: #fff;
                border-bottom: 1px solid var(--glass-border);
                padding-bottom: 12px; 
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; }
            .item strong { 
                display: block; color: var(--text-muted); 
                font-size: 12px; text-transform: uppercase; 
                letter-spacing: 1px; margin-bottom: 5px; 
            }
            .item span { font-size: 16px; word-break: break-word; font-weight: 400;}
            
            .stats-box { font-size: 28px !important; font-weight: 700 !important;}
            .text-accent { color: var(--accent); text-shadow: 0 0 10px var(--accent-glow);}
            .text-success { color: var(--success); text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);}
            .text-danger { color: var(--danger); text-shadow: 0 0 10px rgba(239, 68, 68, 0.4);}
            .text-warning { color: var(--warning); text-shadow: 0 0 10px rgba(245, 158, 11, 0.4);}

            a { color: var(--accent); text-decoration: none; transition: 0.3s;}
            a:hover { color: #fff; text-shadow: 0 0 8px var(--accent);}
            
            .endpoint {
                background: rgba(0, 0, 0, 0.2); padding: 18px;
                border-radius: 12px; margin-bottom: 15px;
                border-left: 4px solid var(--accent); font-family: monospace;
            }
            .method.post { color: var(--warning); font-weight: bold; margin-right: 10px; }
            .method.get { color: var(--success); font-weight: bold; margin-right: 10px; }
            
            .footer { text-align: center; margin-top: 40px; color: var(--text-muted); font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 MAINUL-X YouTube API</h1>
                <span id="health-badge">● Loading System Status...</span>
            </div>

            <!-- API Statistics -->
            <div class="card">
                <h2>📊 Live API Statistics</h2>
                <div class="grid">
                    <div class="item"><strong>Total Requests</strong><span id="stats-total" class="stats-box text-accent">0</span></div>
                    <div class="item"><strong>Success</strong><span id="stats-success" class="stats-box text-success">0</span></div>
                    <div class="item"><strong>Failed</strong><span id="stats-failed" class="stats-box text-danger">0</span></div>
                </div>
            </div>

            <!-- Storage & Auto-Delete Feature -->
            <div class="card" style="border-left: 4px solid var(--accent);">
                <h2>💾 Storage & Auto-Cleanup</h2>
                <div class="grid">
                    <div class="item"><strong>Active Files in Server</strong><span id="active-files" class="stats-box text-warning">0</span></div>
                    <div class="item"><strong>Files Auto-Deleted</strong><span id="auto-deleted" class="stats-box text-success">0</span></div>
                    <div class="item" style="grid-column: 1 / -1; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                        <strong style="color: var(--accent);">Storage Policy Active 🛡️</strong>
                        <span style="font-size: 14px; color: #cbd5e1;">To keep the server fast and storage safe, downloaded video files are automatically deleted after 10 minutes.</span>
                    </div>
                </div>
            </div>

            <!-- Server Runtime -->
            <div class="card">
                <h2>🖥️ Live Server Runtime</h2>
                <div class="grid">
                    <div class="item"><strong>Node Version</strong><span>${process.version}</span></div>
                    <div class="item"><strong>Platform</strong><span style="text-transform: capitalize;">${process.platform}</span></div>
                    <div class="item"><strong>Uptime</strong><span id="uptime">Loading...</span></div>
                    <div class="item"><strong>App RAM Usage</strong><span id="ram-usage">Loading...</span></div>
                </div>
            </div>

            <!-- API Endpoints -->
            <div class="card">
                <h2>🔌 Secure API Endpoints</h2>
                
                <div class="endpoint">
                    <span class="method post">POST</span> <span>/download</span>
                    <br><br>
                    <span style="color: var(--text-muted);">Headers required:</span>
                    <div style="color: #f87171; margin-top: 5px;">"x-api-key": "YOUR_API_KEY"</div>
                    <br>
                    <span style="color: var(--text-muted);">Body (JSON):</span>
                    <div style="color: #a78bfa; margin-top: 5px;">{ "url": "https://youtube.com/..." }</div>
                </div>

                <div class="endpoint" style="border-left-color: var(--success);">
                    <span class="method get">GET</span> <span>/file/:name</span>
                    <br><br>
                    <span style="color: var(--text-muted);">Description: Download the saved video file before it auto-deletes.</span>
                </div>
            </div>

            <!-- Dev Info -->
            <div class="card">
                <h2>🧑‍💻 Developer Information</h2>
                <div class="grid">
                    <div class="item"><strong>Owner</strong><span>${OWNER}</span></div>
                    <div class="item"><strong>GitHub</strong><span><a href="${GITHUB_URL}" target="_blank">@${GITHUB}</a></span></div>
                    <div class="item"><strong>WhatsApp</strong><span>${WHATSAPP}</span></div>
                    <div class="item"><strong>Telegram</strong><span>${TELEGRAM}</span></div>
                </div>
            </div>

            <div class="footer">
                ${COPYRIGHT} | All Rights Reserved
            </div>
        </div>

        <!-- AUTO REFRESH SCRIPT -->
        <script>
            function fetchServerStatus() {
                fetch('/api/status')
                    .then(response => response.json())
                    .then(data => {
                        // Update Health Badge
                        const badge = document.getElementById('health-badge');
                        badge.innerText = "● System: " + data.health.status + " (" + data.health.usedMemPercent + "% RAM)";
                        badge.style.color = data.health.color;
                        badge.style.border = "1px solid " + data.health.color;
                        badge.style.backgroundColor = data.health.color + "15"; // 15 is HEX opacity

                        // Update Runtime Stats
                        document.getElementById('uptime').innerText = data.uptime;
                        document.getElementById('ram-usage').innerText = data.ram_usage;

                        // Update API Stats
                        document.getElementById('stats-total').innerText = data.stats.totalRequests;
                        document.getElementById('stats-success').innerText = data.stats.successDownloads;
                        document.getElementById('stats-failed').innerText = data.stats.failedDownloads;
                        
                        // Update Storage Stats
                        document.getElementById('active-files').innerText = data.stats.activeFiles;
                        document.getElementById('auto-deleted').innerText = data.stats.filesAutoDeleted;
                    })
                    .catch(error => console.error("Status fetch error:", error));
            }

            // Fetch instantly, then every 2 seconds
            fetchServerStatus();
            setInterval(fetchServerStatus, 2000);
        </script>
    </body>
    </html>
    `;

    res.send(htmlContent);
});

// =========================
// LIVE STATUS API
// =========================
app.get("/api/status", (req, res) => {
    const mem = process.memoryUsage();
    
    // Count files currently in download dir
    let activeFilesCount = 0;
    if (fs.existsSync(DOWNLOAD_DIR)) {
        activeFilesCount = fs.readdirSync(DOWNLOAD_DIR).length;
    }

    res.json({
        uptime: formatUptime(process.uptime()),
        ram_usage: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
        health: getSystemHealth(),
        stats: {
            ...apiStats,
            activeFiles: activeFilesCount
        }
    });
});

// =========================
// DOWNLOAD API (Secured)
// =========================
app.post("/download", (req, res) => {
    apiStats.totalRequests++;

    const clientApiKey = req.headers['x-api-key'] || req.body.api_key;
    if (!clientApiKey || clientApiKey !== API_KEY) {
        apiStats.failedDownloads++;
        return res.status(401).json({ status: "error", message: "Unauthorized! Invalid API Key." });
    }

    const url = req.body.url;
    if (!url) {
        apiStats.failedDownloads++;
        return res.status(400).json({ status: "error", message: "URL is required." });
    }

    const filename = `${Date.now()}.mp4`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    const cmd = `yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" -o "${outputPath}" "${url}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            apiStats.failedDownloads++;
            return res.status(500).json({ status: "error", message: "Download failed.", error: stderr });
        }

        apiStats.successDownloads++;
        res.json({
            status: "success",
            message: "Download complete. File will auto-delete in 10 minutes.",
            file_url: `/file/${filename}`,
            file_name: filename
        });
    });
});

// =========================
// FILE SERVE API
// =========================
app.get("/file/:name", (req, res) => {
    const filePath = path.join(DOWNLOAD_DIR, req.params.name);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ status: "error", message: "File not found or has been auto-deleted." });
    }

    res.download(filePath);
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 Secure API Key set to: ${API_KEY}`);
    console.log(`🧹 Auto-Cleanup enabled (Files delete after 10 minutes)`);
});
