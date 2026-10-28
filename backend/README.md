# Backend

FastAPI wrapper for the project's existing scikit-learn model.

## Model artifacts

Put the original trusted `complexity_model.pkl` and `tfidf_vectorizer.pkl` files in `backend/models/`. Do not load pickle/joblib files from unknown sources.

## Run locally

```bash
python -m venv .venv
# Windows PowerShell:
.venv\\Scripts\\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/api/health` and API docs at `http://127.0.0.1:8000/docs`.

The scikit-learn version used to unpickle the existing artifacts must be compatible with the version used to train them. If loading fails, share the full traceback and we can pin the matching version.
