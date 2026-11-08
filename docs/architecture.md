# Architecture Diagram

```
flowchart LR
    Client[Client (React SPA)] -->|API Calls| Server[Express Server]
    Server -->|Calls| Gemini[Google Gemini API]
    Server -->|Database| Store[In‑memory User Store]
    Server -->|Email| SMTP[SMTP Server]
```

The server handles authentication, vocabulary scanning, pronunciation analysis, chat, and PvP generation. Validation is performed via Zod schemas.
