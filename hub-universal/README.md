# Hub Universal

Starter de um painel para centralizar provedores compatíveis com OpenAI, sites/serviços e o endpoint unificado `/api/v1/chat/completions`.

## Desenvolvimento

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. Altere `ADMIN_PASSWORD`, `JWT_SECRET` e `ENCRYPTION_KEY` antes de qualquer uso real. Nunca versione `.env` nem chaves reais.

## Gateway

Envie `POST /api/v1/chat/completions` com Bearer token. O provedor pode ser escolhido pelo header `x-site` ou pelo campo opcional `provider_id` no JSON. O backend descriptografa a chave somente durante a chamada ao provedor.
