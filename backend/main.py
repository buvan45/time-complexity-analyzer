
from pathlib import Path
from typing import Literal
import re

import joblib
import numpy as np
from scipy.sparse import csr_matrix, hstack
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# --------------------------------------------------
# PATHS AND MODEL LOADING
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "codecomplex_structural.pkl"

app = FastAPI(
    title="Time Complexity Analyzer API",
    version="0.2.0",
    description="Predicts an estimated Big-O complexity from source code."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

saved_model = None
vectorizer = None
scaler = None
classifier = None

if MODEL_PATH.exists():
    # Load only trusted model files.
    saved_model = joblib.load(MODEL_PATH)
    vectorizer = saved_model["vectorizer"]
    scaler = saved_model["scaler"]
    classifier = saved_model["classifier"]


# --------------------------------------------------
# REQUEST AND RESPONSE SCHEMAS
# --------------------------------------------------

class AnalyzeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30000)
    language: Literal[
        "python", "javascript", "java", "c++", "cpp", "c", "unknown"
    ] = "python"


class AnalyzeResponse(BaseModel):
    predicted_complexity: str
    complexity_name: str
    explanation: str
    analysis_method: str
    warnings: list[str]


# --------------------------------------------------
# LABEL MAPPING
# --------------------------------------------------

LABEL_TO_BIG_O = {
    "constant": "O(1)",
    "logn": "O(log n)",
    "linear": "O(n)",
    "nlogn": "O(n log n)",
    "quadratic": "O(n^2)",
    "cubic": "O(n^3)",
    "np": "np",
}

COMPLEXITY_NAMES = {
    "O(1)": "Constant",
    "O(log n)": "Logarithmic",
    "O(n)": "Linear",
    "O(n log n)": "Linearithmic",
    "O(n^2)": "Quadratic",
    "O(n^3)": "Cubic",
    "O(2^n)": "Exponential",
    "np": "Non-polynomial (dataset label)",
}

EXPLANATIONS = {
    "O(1)": "The model estimates constant-time growth: work remains approximately independent of input size.",
    "O(log n)": "The model estimates logarithmic growth, often associated with repeatedly reducing the search space.",
    "O(n)": "The model estimates linear growth: work tends to grow in proportion to input size.",
    "O(n log n)": "The model estimates linearithmic growth, commonly seen in efficient comparison-based sorting.",
    "O(n^2)": "The model estimates quadratic growth, which can occur when work scales across pairs of input elements.",
    "O(n^3)": "The model estimates cubic growth, which can occur with three input-sized nested iterations.",
    "O(2^n)": "The model estimates exponential growth, which can occur when exploring many combinations.",
    "np": "The model predicted the dataset's 'np' label. Its precise mapping to a specific Big-O class has not yet been verified.",
}


# --------------------------------------------------
# PREPROCESSING AND STRUCTURAL FEATURES
# IMPORTANT: Keep feature order identical to training.
# --------------------------------------------------

def clean_code(code: str) -> str:
    return code.replace("\u00a0", " ").strip()


def extract_features(code: str) -> list[float]:
    lines = code.splitlines()
    nonempty = [line for line in lines if line.strip()]
    stripped = [line.strip() for line in nonempty]

    depths = []
    brace_depth = 0

    for line in stripped:
        if line.startswith("}"):
            brace_depth = max(0, brace_depth - line.count("}"))

        indent = len(line) - len(line.lstrip())
        depths.append(max(indent // 4, brace_depth))

        brace_depth += max(0, line.count("{") - line.count("}"))

    loop_lines = sum(
        bool(re.search(r"\b(for|while)\b", line))
        for line in stripped
    )

    return [
        np.log1p(len(code)),
        np.log1p(len(nonempty)),
        np.log1p(len(set(code.split()))),
        np.log1p(loop_lines),
        np.log1p(sum("for " in line or "while " in line for line in stripped)),
        np.log1p(sum(line.count("*") for line in stripped)),
        np.log1p(sum(line.count("/") for line in stripped)),
        np.log1p(sum(line.count("sort") for line in stripped)),
        np.log1p(sum(line.count("sqrt") or line.count("log(") for line in stripped)),
        np.log1p(sum(line.count("return") for line in stripped)),
        np.log1p(sum(line.count("if ") for line in stripped)),
        np.log1p(max(depths, default=0)),
        np.log1p(sum("def " in line or "function " in line for line in stripped)),
        np.log1p(sum("memo" in line.lower() or "cache" in line.lower() for line in stripped)),
        np.log1p(sum("input(" in line or "readline" in line for line in stripped)),
    ]


# --------------------------------------------------
# PREDICTION
# --------------------------------------------------

def predict(code: str) -> tuple[str, str]:
    normalized = clean_code(code)

    if classifier is None or vectorizer is None or scaler is None:
        raise RuntimeError(
            "Structural model is missing. Place codecomplex_structural.pkl "
            "in backend/models/."
        )

    # Text features
    text_features = vectorizer.transform([normalized])

    # Structural features; same extraction and order as training
    structural_features = np.asarray(
        extract_features(normalized),
        dtype=float,
    ).reshape(1, -1)

    structural_scaled = scaler.transform(structural_features)

    # Match training: text features + scaled structural features * 0.5
    combined_features = hstack([
        text_features,
        csr_matrix(structural_scaled * 0.5),
    ]).tocsr()

    predicted_label = str(classifier.predict(combined_features)[0])

    prediction = LABEL_TO_BIG_O.get(predicted_label)
    if prediction is None:
        raise RuntimeError(
            f"Unexpected model label: {predicted_label}"
        )

    return prediction, "structural_ml_prediction"


# --------------------------------------------------
# API ENDPOINTS
# --------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_loaded": classifier is not None
        and vectorizer is not None
        and scaler is not None,
        "model_type": "CodeComplex structural TF-IDF + LinearSVC",
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    if not request.code.strip():
        raise HTTPException(
            status_code=422,
            detail="Code cannot be empty."
        )

    try:
        prediction, method = predict(request.code)

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        ) from exc

    except Exception as exc:
        # Print the actual exception in the backend terminal for debugging.
        print(f"Prediction error: {exc!r}")
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Check the backend logs."
        ) from exc

    warnings = [
        "This is an ML estimate, not a formal complexity proof.",
        "The model was trained on Python and Java examples. Accuracy may vary for other languages.",
        "The model uses approximate text and structural features; it does not formally analyze control flow or input constraints.",
    ]

    if prediction == "np":
        warnings.append(
            "The dataset's 'np' label is retained because its exact mapping "
            "to a specific Big-O class has not been verified."
        )

    return AnalyzeResponse(
        predicted_complexity=prediction,
        complexity_name=COMPLEXITY_NAMES.get(
            prediction, "Estimated class"
        ),
        explanation=EXPLANATIONS.get(
            prediction,
            "The classifier selected this dataset label. Review the algorithm to validate its complexity."
        ),
        analysis_method=method,
        warnings=warnings,
    )
