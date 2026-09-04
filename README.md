# Agent Storefront

A hackathon-ready reference build for "agent-to-agent commerce": a merchant
storefront that an AI shopping agent can browse, negotiate cart/cross-sell
with, and pay for through Razorpay — with every money-adjacent action
**bounded** (hard limits), **gated** (human confirmation above a threshold),
and **explainable** (full audit trail with LLM-generated reasoning).

- Backend: Python 3.11 + FastAPI + MySQL (SQLAlchemy/PyMySQL)
- LLM: local Ollama (`llama3.2`) — intent parsing + reasoning only, never
  calls Razorpay directly
- Payments: Razorpay **Test Mode** — MCP server as the primary agent-callable
  path, direct SDK as an automatic fallback
- Frontend: React + Vite + Tailwind

---

## 1. Project structure

```
agent-storefront/
├── backend/
│   ├── main.py                     # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── .env.example                # copy to .env and fill in
│   ├── schema.sql                  # optional manual MySQL schema
│   ├── schemas.py                  # Pydantic request/response models
│   ├── db/
│   │   ├── database.py             # SQLAlchemy engine/session
│   │   ├── models.py               # ORM models (sessions, audit_log, orders, catalog_items)
│   │   └── seed.py                 # seeds catalog_items
│   ├── policy/
│   │   ├── engine.py                # deterministic bound/gate checker
│   │   └── policy.json              # merchant policy config
│   ├── agent/
│   │   ├── intent_parser.py         # Ollama intent parsing + regex fallback
│   │   └── reasoning.py             # Ollama reasoning string + fallback
│   ├── razorpay_client/
│   │   ├── mcp_client.py            # primary: Razorpay MCP tool calls
│   │   └── sdk_client.py            # fallback: direct Razorpay SDK
│   ├── catalog/
│   │   ├── catalog.json             # sample product feed (reference only; DB is source of truth)
│   │   └── routes.py                # GET /catalog
│   └── routers/
│       ├── chat.py                  # POST /chat — the agent loop
│       ├── checkout.py              # POST /checkout/propose, /confirm, /simulate-decline
│       ├── audit.py                 # GET /audit
│       └── webhook.py               # POST /webhook/razorpay
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx                  # tab shell: Buyer Chat / Merchant Dashboard / Audit Trail
        ├── api.js                   # fetch wrapper for the backend
        ├── index.css
        └── components/
            ├── ChatWidget.jsx        # buyer chat + cart + gated checkout UI
            ├── AuditTrail.jsx        # timeline viewer for audit_log
            └── MerchantDashboard.jsx # catalog + policy display
```

---

## 2. Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- MySQL Server + MySQL Workbench (already installed, per your setup)
- [Ollama](https://ollama.com) installed, with `llama3.2` pulled (`ollama pull llama3.2`)
- A free [Razorpay](https://razorpay.com) account (Test Mode — no KYC needed)
- [ngrok](https://ngrok.com) free tier (only needed if you want live webhook
  delivery during the demo)

---

## 3. MySQL setup

1. Open **MySQL Workbench**, connect to your local server.
2. Open `backend/schema.sql` and run the whole script. This will:
   - create the `agent_storefront` database
   - create `sessions`, `audit_log`, `orders`, `catalog_items` tables
   - seed 5 sample catalog items
3. That's it — you don't strictly need step 2 if you'd rather let the
   backend auto-create tables on first run (`Base.metadata.create_all()`
   in `main.py` does this automatically), but running `schema.sql`
   manually is more reliable and also seeds the catalog for you.

If you skip `schema.sql`, run the Python seed script instead (see §6,
step 4) to populate the catalog.

---

## 4. Razorpay setup (Test Mode — free, no KYC)

1. Sign up / log in at https://dashboard.razorpay.com/signin.
2. In the dashboard, make sure the **Test Mode** toggle (top left) is ON.
3. Go to **Settings → API Keys → Generate Test Key**. Copy the
   `Key Id` (starts with `rzp_test_`) and `Key Secret`.
4. Paste both into `backend/.env` as `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
5. (Optional, for webhook demo) Go to **Settings → Webhooks → Add New
   Webhook**:
   - Run `ngrok http 8000` in a terminal, copy the `https://xxxx.ngrok-free.app`
     forwarding URL.
   - Webhook URL: `https://xxxx.ngrok-free.app/webhook/razorpay`
   - Active events: `payment_link.paid`, `payment.failed`
   - Set a webhook secret, and put the same value into
     `RAZORPAY_WEBHOOK_SECRET` in `.env`.
6. Test card for a **successful** payment in test mode: `4111 1111 1111 1111`,
   any future expiry, any CVV, any name.
7. Test card for a **declined** payment (used by the app's own
   "simulate decline" button, but also works for real if you want to
   trigger it through an actual payment link): `4000 0000 0000 0002`.

The Razorpay MCP server needs no separate signup — it authenticates with
the same test key/secret over Basic Auth (already wired up in
`razorpay_client/mcp_client.py`). If the MCP call fails for any reason,
the app automatically falls back to the direct SDK, and the audit trail
records which path actually executed.

---

## 5. Ollama setup

```bash
# if you haven't already
ollama pull llama3.2

# make sure the server is running (usually starts automatically)
ollama serve
```

Verify it's reachable:
```bash
curl http://localhost:11434/api/tags
```

---

## 6. Backend — order of execution

Open a terminal in `backend/`:

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# then edit .env: set DB_PASSWORD, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

# 4. (Only if you didn't run schema.sql in Workbench) seed the catalog
python -m db.seed

# 5. Start the API server
uvicorn main:app --reload --port 8000
```

Confirm it's up: open http://localhost:8000/health → `{"status": "ok"}`.
Interactive API docs: http://localhost:8000/docs.

---

## 7. Frontend — order of execution

Open a **second** terminal in `frontend/`:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Open http://localhost:5173.

---

## 8. Full run order (every time)

1. `ollama serve` (if not already running as a background service)
2. MySQL server running (usually a background service already)
3. Terminal A: `cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000`
4. Terminal B: `cd frontend && npm run dev`
5. (Optional, for real webhook delivery) Terminal C: `ngrok http 8000`
6. Open http://localhost:5173

---

## 9. Demo script

1. **Buyer Chat tab** — type `I want a blue hoodie`. The agent (via
   `llama3.2`) parses intent, matches the catalog, and suggests the
   cross-sell (black cap).
2. Add another item to push the cart above ₹500 to trigger the
   **gate** — e.g. add 2 hoodies.
3. Click **Checkout**. Because the total is above the
   `requires_human_confirm_above_inr` threshold in `policy.json`,
   you'll see the amber "Confirmation required" panel — click **Approve**.
   This is your live "agent doesn't just do things unattended" proof point.
4. The app calls the Razorpay MCP server (falling back to the SDK
   automatically if MCP is unreachable) and returns a real test-mode
   payment link. Open it and pay with `4111 1111 1111 1111`.
5. Switch to the **Audit Trail tab** — every step (add_to_cart,
   create_payment_link, the policy check result, the reasoning string,
   and the raw Razorpay response) is there as a timeline, whether or
   not the action was ultimately approved.
6. Click **"Simulate a failed / declined payment"** to show the
   graceful-failure path — the agent explains the decline in plain
   language instead of crashing, and it's logged to the audit trail too.
7. **Merchant Dashboard tab** — show the agent-readable catalog feed
   (`GET /catalog`) and the active policy limits side by side, to tie
   back to "agent-readable catalog" + "bounded" requirements explicitly.

---

## 10. Notes / known limitations (be upfront with judges)

- `llama3.2` (3B) is not as reliable at structured JSON output as a
  cloud model — that's why every LLM call in this codebase has a
  deterministic regex/keyword fallback, and why the **policy engine
  itself has zero LLM involvement**. This is a deliberate design choice,
  not an oversight — call it out in your pitch.
- Webhooks require a public URL (ngrok) to reach your local FastAPI
  server; without it, payment-status updates from Razorpay just won't
  arrive, though the payment link itself still works fine for the demo.
- Everything runs in Razorpay **Test Mode** — no real money moves, no
  KYC required.
