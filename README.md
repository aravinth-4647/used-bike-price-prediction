# 🏍️ Used Bike Price Prediction System

An end-to-end, lightweight, production-ready Machine Learning web application that predicts the estimated resale/selling price of used motorcycles and scooters based on user inputs.

The system features **dynamic column adaptation**, allowing any dataset in CSV or Excel format (`.csv`, `.xlsx`, `.xls`) to be placed in `dataset/` and trained on without modifying the codebase.

---

## 🌟 Key Features

- **Dynamic Dataset Pipeline**: Automatically detects `.csv` or `.xlsx` in the `dataset/` folder, detects column types and the target price column (`price`, `selling_price`, etc.), and dynamically adapts the ML pipeline.
- **Multi-Model Tournament**: Automatically benchmarks candidate regressors (Random Forest, Gradient Boosting, Ridge, Linear Regression) and selects the best model.
- **Accurate Price Valuation & Confidence Bounds**: Computes fair market value, confidence price range (min–max interval), resale health score, and depreciation rate.
- **Dataset Inspector & CLI Analyzer**: Complete exploratory data analysis tool (`backend/ml/analyze_dataset.py`) for shapes, data types, missing values, duplicates, and target price statistics.
- **Neon PostgreSQL & Serverless Compatible**: SQLAlchemy models with database connection via `DATABASE_URL` (automatic fallback to SQLite for local development).
- **Lightweight (< 500 MB footprint)**: Built with Scikit-learn, Pandas, NumPy, FastAPI, and Vite React with zero heavyweight framework overhead.
- **Vercel Deployment Ready**: Configured `vercel.json` and serverless API entrypoint.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Pandas, NumPy, Scikit-Learn, Joblib, OpenPyXL |
| **Database** | PostgreSQL (Neon ready), SQLAlchemy, SQLite (local fallback) |
| **Deployment** | Vercel (`vercel.json`), Serverless Function ready |

---

## 📁 Project Structure

```
.
├── dataset/                    # Machine learning datasets (.csv, .xlsx, .xls)
│   └── used_bikes.csv          # Pre-loaded realistic bikes dataset
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI route endpoints
│   │   │   ├── predict.py      # /api/predict & /api/metadata
│   │   │   ├── history.py      # /api/history
│   │   │   └── train.py        # /api/training (train, upload, analyze)
│   │   ├── config.py           # Environment & Settings
│   │   ├── database.py         # SQLAlchemy & Neon PostgreSQL setup
│   │   ├── models.py           # Database models (PredictionLog)
│   │   ├── schemas.py          # Pydantic validation schemas
│   │   └── main.py             # FastAPI entry point & CORS
│   ├── ml/
│   │   ├── analyze_dataset.py  # Dataset analysis CLI tool
│   │   ├── dataset_loader.py   # Dynamic CSV/Excel auto-loader
│   │   ├── preprocessor.py     # Flexible ColumnTransformer pipeline
│   │   ├── train.py            # Model training & benchmarking pipeline
│   │   ├── predict.py          # Model inference & valuation engine
│   │   └── saved_models/       # Serialized .joblib & model_metadata.json
│   ├── requirements.txt        # Python dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # UI Components (Form, Result, Insights, Inspector, History)
│   │   ├── services/           # Axios API client
│   │   ├── utils/              # Currency and date formatters
│   │   ├── App.jsx             # Main application
│   │   └── index.css           # Tailwind design system
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── api/
│   └── index.py                # Vercel Python serverless entrypoint
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Dataset Analysis CLI Tool

To analyze any dataset placed in `dataset/`:

```bash
# Run analysis on the active dataset in dataset/
py backend/ml/analyze_dataset.py

# Or analyze a specific file:
py backend/ml/analyze_dataset.py dataset/my_bikes.xlsx
```

This displays:
1. Dataset Shape (Rows × Columns)
2. Columns & Data Types
3. Missing values & null percentages
4. Duplicate row counts
5. Numerical vs. Categorical column lists
6. Target price column identification & distribution stats

---

### 2. Model Training CLI Tool

To train and benchmark candidate models on your dataset:

```bash
py backend/ml/train.py
```

This trains Random Forest, Gradient Boosting, Ridge, and Linear Regression, selects the champion model, and generates `backend/ml/saved_models/used_bike_model.joblib` and `backend/ml/saved_models/model_metadata.json`.

---

### 3. Running Backend Locally

```bash
# Run FastAPI server with Uvicorn
py -m uvicorn backend.app.main:app --reload --port 8000
```

- API Docs (Swagger UI): `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/health`

---

### 4. Running Frontend Locally

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🗄️ Database Configuration (Neon PostgreSQL)

1. Create a serverless PostgreSQL database on [Neon.tech](https://neon.tech).
2. Copy the connection string.
3. Set the environment variable in `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

*Note: If `DATABASE_URL` is omitted or empty, the application automatically uses local SQLite (`bike_prediction.db`) without requiring any additional setup.*

---

## ☁️ Vercel Deployment

1. Push this repository to GitHub / GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `DATABASE_URL` = Your Neon PostgreSQL connection string.
4. Click **Deploy**. Vercel will automatically build the React Vite static frontend and serve the FastAPI backend through `api/index.py`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Computes estimated price & valuation bounds for bike specifications |
| `GET` | `/api/metadata` | Returns active model metadata, feature schemas, and categories |
| `GET` | `/api/history` | Fetches logged predictions with optional brand filter |
| `DELETE` | `/api/history/{id}` | Deletes a specific prediction log |
| `GET` | `/api/training/datasets` | Lists datasets available in `dataset/` |
| `GET` | `/api/training/analyze` | Returns structured exploratory analysis for dataset |
| `POST` | `/api/training/train` | Triggers retraining pipeline and reloads model in memory |
| `POST` | `/api/training/upload` | Uploads a new `.csv` or `.xlsx` dataset file |
| `GET` | `/api/health` | Service health status |
