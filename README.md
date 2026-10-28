# Time Complexity Analyzer — starter implementation

React + Vite frontend and FastAPI backend for the existing ML time-complexity classifier. Docker files will be added after the local end-to-end flow is tested.

## Prerequisites

- Node.js 20+ and npm
- Python 3.11 recommended

## 1. Add the existing model files

The original ZIP contains `complexity_model.pkl` and `tfidf_vectorizer.pkl`. Copy them into:

- `backend/models/complexity_model.pkl`
- `backend/models/tfidf_vectorizer.pkl`

Those files are not duplicated in this starter ZIP; copy them from your original project ZIP. Only load trusted model artifacts.

## 2. Start the backend

Open a terminal in `backend/`:

```bash
python -m venv .venv
```

Windows PowerShell:
```powershell
.venv\\Scripts\\Activate.ps1
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Then:
```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 3. Start the frontend

Open another terminal in `frontend/`:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

The frontend proxies `/api/*` to `http://127.0.0.1:8000` during local development.

## Notes

- The frontend includes a working code editor and sends source text to the backend; it does not execute submitted code.
- The API returns the model's predicted complexity class and a short explanation.
- Predictions are estimates, not proofs. The original model has known dataset and heuristic limitations.
- If the backend reports a pickle/scikit-learn compatibility error, do not retrain blindly; send the exact traceback so we can identify the version mismatch.
- Docker Compose and Nginx are intentionally deferred until local frontend/backend integration works.
