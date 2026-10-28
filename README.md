# AI-Powered Time Complexity Analyzer for Source Code

An intelligent code analysis tool that predicts the time complexity category of a source code snippet using machine learning and structural code features. The project combines a trained Scikit-learn model with a FastAPI backend and a React frontend to provide an interactive interface for analyzing code.

## Overview

Understanding the time complexity of an algorithm is an essential part of software development. It helps developers evaluate how an algorithm's execution cost grows as the input size increases.

Manually estimating time complexity can be challenging, particularly when source code contains nested loops, conditional statements, recursive calls, and other complex structures.

This project aims to automate part of that process by extracting useful features from source code and using a trained machine learning classifier to predict its time complexity category.

Users can enter code into an interactive editor, submit it for analysis, and view the model's prediction through a web interface.

## Key Features

- **AI-Based Complexity Prediction:** Uses a trained machine learning classifier to predict the time complexity category of code snippets.
- **Structural Code Features:** Uses structural information extracted from source code to help identify patterns associated with algorithmic complexity.
- **TF-IDF Feature Extraction:** Converts code-related text into numerical features suitable for machine learning.
- **Feature Scaling:** Applies a trained scaler to transform features before classification.
- **Interactive Code Editor:** Provides a React-based interface with Monaco Editor integration.
- **REST API:** Uses FastAPI to receive analysis requests and return predictions.
- **Containerized Environment:** Uses Docker and Docker Compose to run the frontend and backend services together.
- **API Documentation:** Provides interactive API documentation through FastAPI's Swagger UI.

## How It Works

The system follows a machine learning pipeline that transforms source code into features and uses those features to predict a complexity category.

### Step 1: Enter Source Code

The user enters or pastes a code snippet into the web application's code editor.

The frontend is built using React, with Monaco Editor providing the code-editing experience.

### Step 2: Send the Code to the Backend

When the user requests an analysis, the frontend sends the source code to the FastAPI backend through a REST API endpoint.

The frontend uses the `/api/analyze` endpoint to submit the request.

### Step 3: Extract Features from the Code

The backend processes the code using the feature-extraction components loaded from the trained model artifacts.

The project uses TF-IDF-based features and structural code features to represent relevant patterns in the source code numerically.

These numerical representations allow the machine learning model to process code as input.

### Step 4: Scale the Features

The extracted features are transformed using the scaler saved during model training.

Using the corresponding trained preprocessing components helps ensure that the input representation is consistent with the representation expected by the classifier.

### Step 5: Predict Time Complexity

The processed features are passed to the trained **Linear Support Vector Classifier (LinearSVC)** from Scikit-learn.

The classifier predicts a complexity category based on patterns learned from its training data.

### Step 6: Display the Result

The backend returns the analysis result through the API, and the React frontend displays the prediction to the user.

### Workflow Diagram

```text
                 USER
                   |
                   v
       Enter Source Code in Editor
                   |
                   v
          React Frontend
          + Monaco Editor
                   |
                   v
          FastAPI REST API
           /api/analyze
                   |
                   v
        Source Code Feature Extraction
          /                   \
         v                     v
   TF-IDF Features       Structural Features
          \                   /
           v                 v
          Feature Processing
          and Scaling
                   |
                   v
          Trained LinearSVC
             Classifier
                   |
                   v
        Predicted Complexity Class
                   |
                   v
          FastAPI JSON Response
                   |
                   v
          Display Prediction
          in React Frontend
```

## Machine Learning Approach

The project uses a supervised machine learning approach to classify source code into time complexity categories.

### Model Used

**Linear Support Vector Classifier (LinearSVC)**

LinearSVC is a linear classification algorithm provided by Scikit-learn. It learns decision boundaries from labeled training examples and uses the learned patterns to classify new inputs.

In this project, the classifier operates on features extracted from source code rather than directly understanding the code in the way a compiler or a large language model would.

### Feature Engineering

The model pipeline uses the following components:

| Component | Purpose |
|---|---|
| TF-IDF Vectorizer | Converts text-based code features into numerical representations |
| Structural Features | Represents selected structural characteristics of source code |
| Feature Scaler | Applies the preprocessing transformation learned during training |
| LinearSVC Classifier | Predicts the complexity class from the processed features |

The trained preprocessing components and classifier are loaded from the model artifact:

`backend/models/codecomplex_structural.pkl`

### What Does the Prediction Mean?

Time complexity describes how an algorithm's computational requirements grow with input size.

Common theoretical complexity categories include:

| Complexity | Name | General interpretation |
|---|---|---|
| `O(1)` | Constant | Growth does not depend on input size |
| `O(log n)` | Logarithmic | Growth is proportional to the logarithm of input size |
| `O(n)` | Linear | Growth is proportional to input size |
| `O(n log n)` | Linearithmic | Common in efficient comparison-based sorting algorithms |
| `O(n²)` | Quadratic | Often associated with two nested loops over the input |
| `O(2ⁿ)` | Exponential | Can occur in algorithms that explore exponentially many possibilities |

**Important:** These are examples of standard complexity classes, not a guarantee that every category is supported by the trained model. The actual available predictions depend on the labels used to train the classifier.

The model produces a classification based on learned patterns. Its output should be treated as a prediction rather than a formal mathematical proof of an algorithm's asymptotic complexity.

## System Architecture

The application is divided into two primary services.

### Frontend

**Technologies:** React, Vite, JavaScript, Monaco Editor, Lucide React

Responsibilities:

- Provides the user interface.
- Allows users to enter and edit source code.
- Sends analysis requests to the backend.
- Displays the returned complexity prediction.
- Communicates with the API through the `/api` route.

### Backend

**Technologies:** Python, FastAPI, Uvicorn, Scikit-learn, NumPy, SciPy, Joblib

Responsibilities:

- Exposes the code analysis REST API.
- Loads the saved vectorizer, scaler, and classifier.
- Processes incoming source code using the trained feature pipeline.
- Returns the prediction in an API response.
- Provides health-check and API documentation endpoints.

### Docker Environment

**Technologies:** Docker, Docker Compose

The application uses two containers:

1. **Frontend container:** Runs the Vite development server.
2. **Backend container:** Runs the FastAPI application through Uvicorn.

Docker Compose coordinates the services and provides network communication between them.

## Technology Stack

| Layer | Technologies |
|---|---|
| Programming Language | Python, JavaScript |
| Frontend | React, Vite |
| Code Editor | Monaco Editor |
| Backend | FastAPI, Uvicorn |
| Machine Learning | Scikit-learn, LinearSVC |
| Feature Processing | TF-IDF, structural code features, feature scaling |
| Numerical Processing | NumPy, SciPy |
| Model Serialization | Joblib, Pickle-based model artifact |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |

## Project Structure

```text
time-complexity-analyzer/
|
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- Dockerfile
|   |-- .dockerignore
|   |
|   `-- models/
|       `-- codecomplex_structural.pkl
|
|-- frontend/
|   |-- src/
|   |   `-- api.js
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- Dockerfile
|   `-- .dockerignore
|
|-- docker-compose.yml
|-- README.md
`-- .gitignore
```

*The structure above represents the main project components. Other frontend source files, assets, configuration files, or model artifacts may also be present in the repository.*

## Getting Started

You can run the project using Docker Compose or by starting the backend and frontend separately.

### Prerequisites

For Docker-based execution:

- Git
- Docker Desktop or Docker Engine
- Docker Compose

For local execution without Docker:

- Python 3.11
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/buvan45/time-complexity-analyzer.git
cd time-complexity-analyzer
```

### 2. Run with Docker Compose

Make sure Docker Desktop is running.

Build the images and start both services:

```bash
docker compose up --build
```

Once the containers start, access the application using the following URLs:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger API Documentation | http://localhost:8000/docs |
| Backend Health Check | http://localhost:8000/api/health |

The frontend communicates with the backend through the configured Vite `/api` proxy.

To stop the containers, press `Ctrl+C` in the terminal running Compose. You can then run:

```bash
docker compose down
```

### 3. Run the Backend Locally

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

On Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend should be available at:

`http://localhost:8000`

Interactive API documentation:

`http://localhost:8000/docs`

### 4. Run the Frontend Locally

Open a second terminal:

```bash
cd frontend
```

Install the Node.js dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open:

`http://localhost:5173`

**Note:** When running the frontend outside Docker, ensure that the API proxy in `frontend/vite.config.js` targets the locally running backend at `http://127.0.0.1:8000`. When running both services through Docker Compose, the proxy should target `http://backend:8000`.

## API Endpoints

The backend exposes endpoints for code analysis and service health.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Submits code for complexity analysis |
| `/api/health` | GET | Checks backend health and model-loading status |
| `/docs` | GET | Opens the interactive Swagger API documentation |

### Example Analysis Request

The following is an illustrative request body. The exact request schema must match the implementation in `backend/main.py`.

```json
{
  "code": "for i in range(n):\n    print(i)"
}
```

The backend processes the request and returns a JSON response containing the analysis result according to its implemented response schema.

Use the Swagger documentation at `http://localhost:8000/docs` to inspect the actual request fields, submit test requests, and view the response structure.

### Health Check

Open:

`http://localhost:8000/api/health`

The health endpoint reports the service status and whether the required model components have loaded successfully.

## Docker Implementation

Docker packages the application and its dependencies into reproducible environments.

### Why Docker?

- Reduces environment-related inconsistencies.
- Separates the frontend and backend into independent services.
- Simplifies installation and startup.
- Makes it easier to reproduce the development environment.
- Provides a foundation for deployment to compatible hosting platforms.

### Useful Docker Commands

Check running containers:

```bash
docker compose ps
```

View service logs:

```bash
docker compose logs
```

View backend logs:

```bash
docker compose logs backend
```

View frontend logs:

```bash
docker compose logs frontend
```

Rebuild and restart services:

```bash
docker compose up --build
```

Stop and remove the Compose containers:

```bash
docker compose down
```

The current Compose configuration uses the Vite development server. A production deployment would typically use a production frontend build and a suitable production server configuration.

## Current Scope and Limitations

- Predictions depend on the quality, coverage, and labels of the model's training dataset.
- Code patterns not adequately represented in training may be classified incorrectly.
- Source-code features are statistical representations and do not guarantee complete semantic understanding of an algorithm.
- Actual runtime also depends on input characteristics, implementation details, hardware, and other factors.
- The prediction should support code review and learning rather than replace algorithmic analysis or empirical benchmarking.
- The Docker Compose configuration is intended for development and local execution unless additional production hardening is performed.

## Future Enhancements

Potential improvements include:

- Support for additional programming languages.
- More robust syntax-aware parsing and abstract syntax tree features.
- Improved handling of recursive algorithms and nested control structures.
- Confidence estimates or explanations for predictions, where supported by the model.
- Comparison of predictions against manually analyzed examples.
- A test suite covering different algorithms and edge cases.
- Production deployment with automated testing and continuous integration.
- Performance benchmarking and model evaluation on a held-out dataset.

## Learning Outcomes

This project demonstrates practical integration of:

- Supervised machine learning for source-code classification.
- Feature extraction and preprocessing.
- Model serialization and loading.
- REST API development with FastAPI.
- Frontend and backend integration.
- Containerization and multi-service orchestration with Docker Compose.
- Version control and collaborative development workflows using Git and GitHub.

## Author

**M. Buvan Sathrock**

Information Technology

Sri Siva Subramaniya Nadar College of Engineering, Chennai

GitHub: [@buvan45](https://github.com/buvan45)

## License

Add a license to this repository if you intend to distribute or reuse the project publicly. Until a license is added, do not assume that others have permission to reuse the source code.
