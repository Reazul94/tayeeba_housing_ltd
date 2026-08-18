# TAYEEBA HOUSING LTD. ERP v2.6 — Local Office LAN Deployment Guide

---

## 1. Overview

While Supabase PostgreSQL acts as the central authoritative database, the Express API backend can be hosted locally on a dedicated office server machine (e.g. `192.168.1.100` or `10.111.185.43`) to provide ultra-fast local network performance.

---

## 2. Setup Steps

1. **Configure Host Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
2. **Obtain LAN IP Address**: The server automatically displays all local IPv4 addresses in the console:
   ```
   Local:   http://localhost:5000/api/health
   Network: http://192.168.1.100:5000/api/health
   ```
3. **Configure Firewall**: Allow inbound TCP traffic on port 5000 in Windows Defender Firewall / Linux ufw.
4. **Client Workstations**: Access the ERP through the browser using the LAN IP or GitHub Pages configured with `VITE_API_URL=http://192.168.1.100:5000/api`.
