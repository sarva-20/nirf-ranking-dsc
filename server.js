const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { getRankings } = require('./calculator');

// Attempt to use node-fetch if available, otherwise fallback to https (built-in)
let fetch;
try {
    fetch = require('node-fetch');
} catch (e) {
    console.log("node-fetch not found, using https-proxy fallback");
}

const app = express();
const PORT = 3000;

// Global Logger for Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// AI Proxy Configuration (User Provided)
const TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJFeU43dHQwRWVvM2U2eGFCTmY1WGl5SkNyQllxajdwSnV6OWRZWEVuUmtrIn0.eyJleHAiOjE3NzQ1MDMyNzYsImlhdCI6MTc3NDQ3NDQ3NiwiYXV0aF90aW1lIjoxNzc0NDc0NDcxLCJqdGkiOiI3MTE2YTUzMi02NzRiLTQ3OGYtOWZlOC00MTg2ZDRjMTRlNWIiLCJpc3MiOiJodHRwczovL2lhbS5pbnRlbGxlY3RzZWVjc3RhZy5jb20vYXV0aC9yZWFsbXMvaWR4c2FuZGJveCIsImF1ZCI6WyJmYWJyaWMiLCJhY2NvdW50Il0sInN1YiI6IjA0YWJhY2M1LWRlZmUtNGU2NS1hNzU1LTg1ZmZjZTFhOTg2NiIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1hZ2ljcGxhdGZvcm0iLCJub25jZSI6ImYwNGIyYjc0LTc4ZTktNGYxZS04YmVmLWRjNmE4MzYwOGFiMyIsInNlc3Npb25fc3RhdGUiOiIxYTJkM2QzNi0xN2NhLTQ4OGYtYmI3NC1mYWEwYzE4Yjc3YmUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9tYWdpY3BsYXRmb3JtLmludGVsbGVjdHNlZWNzdGFnLmNvbSIsImh0dHBzOi8vdXMuaW50ZWxsZWN0c2VlY3N0YWcuY29tL3B1cnBsZWZhYnJpYyIsImh0dHA6Ly9sb2NhbGhvc3Q6MTg0MSIsImh0dHBzOi8vaWR4c2FuZGJveC5pbnRlbGxlY3RzZWVjc3RhZy5jb20iLCJodHRwczovL2xvY2FsaG9zdDoxODQxIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtaWR4c2FuZGJveCIsInVtYV9hdXRob3JpemF0aW9uIiwiQVBQX1VTRVIiXX0sInJlc291cmNlX2FjY2VzcyI6eyJtYWdpY3BsYXRmb3JtIjp7InJvbGVzIjpbIk1BR0lDX1BMQVRGT1JNX0FETUlOIiwiQVBQX1VTRVIiXX0sImZhYnJpYyI6eyJyb2xlcyI6WyJBUFBfVVNFUiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQiLCJzaWQiOiIxYTJkM2QzNi0xN2NhLTQ4OGYtYmI3NC1mYWEwYzE4Yjc3YmUiLCJ1c2VyUm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLWlkeHNhbmRib3giLCJ1bWFfYXV0aG9yaXphdGlvbiIsIkFQUF9VU0VSIl0sIm1vbmdvLXVzZXJJZCI6ImRlc2lnbnNwYXJrLnNhcnZhdGFyc2hhbi5zYW5rYXIiLCJwcm9maWxlSWQiOiJpZHhzYW5kYm94LXVzZXItNDY1NjM0ODY1OSIsInRlbmFudElkIjoiaWR4c2FuZGJveCIsIkxBU1RfTkFNRSI6IlNBTktBUiIsIkZJUlNUX05BTUUiOiJTQVJWQVRBUlNIQU4ifQ.v59wlnrjgZLv1DkdD2B6ajb4elSLk9kaEzDXMvqHRQG4zBfx7bUyrKMuUulELpkJ1E6tjFSO8TICLjUC8TeoIiDpOhHL5Q0o-bZ7y2ipFBKaP-tAXvQ5YKjLa6nnLx3UiacpdqY7GiqXZpXNq8X7YzfAOg0q0rcV9SWCwT1qaRgEsmonsQeIv-kWfnIXwmmES83FJ3_u6g5MWFZQ2a2uHjCaPQj8IkF0TL1_345otrEdJay6b1hAGwVPQfRmTHedsrcBvY-tXlo6njyOOfcAOrbdyeddwl7ntouiT5spr7bWqZSAffoAhVdgXGTWBic1Y1pwR9Pgwo4tQrkr9EFIYw";
const WORKSPACE_ID = "07932037-bd9e-40ae-b974-421dd1c451b2";
const CONVERSATION_ID = "69c452c680a4ef70c109754e";
const ASSET_VERSION_ID = "174de6ab-e9d9-400b-9989-c2a133e797fd";
const BASE_URL = "idxsandbox.intellectseecstag.com";

// AI Proxy API
app.post('/api/analyze', async (req, res) => {
    console.log("HIT /api/analyze with:", req.body);
    const { query } = req.body;
    
    if (fetch) {
        // Use node-fetch@2 (Recommended by user)
        try {
            const response = await fetch(
                `https://${BASE_URL}/fabric/api/v1/workspaces/${WORKSPACE_ID}/conversations/${CONVERSATION_ID}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': TOKEN,
                        'Accept': 'text/event-stream'
                    },
                    body: JSON.stringify({
                        query: query,
                        asset_version_id: ASSET_VERSION_ID,
                        workspace_id: WORKSPACE_ID
                    })
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                console.error("Purple Fabric error:", response.status, errText);
                return res.status(response.status).json({ error: errText });
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            response.body.pipe(res);

            response.body.on('error', (err) => {
                console.error("Stream error:", err);
                res.end();
            });
        } catch (err) {
            console.error("Fetch error:", err);
            res.status(500).json({ error: err.message });
        }
    } else {
        // Fallback to https proxy logic
        const options = {
            hostname: BASE_URL,
            path: `/fabric/api/v1/workspaces/${WORKSPACE_ID}/conversations/${CONVERSATION_ID}/messages`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': TOKEN,
                'Accept': 'text/event-stream'
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            console.error("Proxy Error:", e);
            res.status(500).json({ error: 'Proxying failed' });
        });

        proxyReq.write(JSON.stringify({ query, asset_version_id, workspace_id }));
        proxyReq.end();
    }
});

// Main ranking API
app.get('/api/rankings', (req, res) => {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');
        const data = JSON.parse(rawData);
        const rankedData = getRankings(data);
        res.json(rankedData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to process ranking data' });
    }
});

// Search API
app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    try {
        const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');
        const data = JSON.parse(rawData);
        const rankedData = getRankings(data);
        const filtered = rankedData.filter(item => 
            item.college.toLowerCase().includes(query) || 
            item.counselling_code.toLowerCase().includes(query)
        );
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.listen(PORT, () => {
    console.log(`NIRF Backend running at http://localhost:${PORT}`);
});
