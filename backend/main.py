from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import io
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from sklearn.utils.validation import check_is_fitted
from sklearn.exceptions import NotFittedError
from sklearn.model_selection import train_test_split
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
global_df = None
global_model = None
global_features = None
global_task_type = None
global_mapping = {}
global_feature_importances = []

COLUMN_ALIASES = {
    "id": ["customerid", "customer id", "user id", "userid", "account id", "accountid", "id", "customer_id"],
    "tenure": ["tenure", "tenuremonths", "tenure months", "months", "duration", "account_length", "tenure_months"],
    "monthly": ["monthlycharges", "monthly charges", "monthly_charges", "monthlybill", "monthly_bill", "monthly", "mthly_charge"],
    "total": ["totalcharges", "total charges", "total_charges", "totalbill", "total_bill", "total", "lifetime_value", "total_spend"],
    "contract": ["contract", "plan", "contract type", "contract_type", "subscription_type"],
    "payment_issue": ["paymentmethod", "payment method", "payment_method", "paymentissue", "payment issue", "late_payment", "payment_issue", "issue"],
    "target": ["churn", "target", "label", "churn_value", "is_churned", "status", "churn_label", "churn label"],
    "name": ["name", "customer_name", "fullname", "full_name", "user_name"]
}

def find_column(df_columns, aliases):
    lower_cols = {c.lower(): c for c in df_columns}
    clean_cols = {c.lower().replace('_', '').replace(' ', ''): c for c in df_columns}
    
    # 1. Exact match
    for alias in aliases:
        if alias in lower_cols:
            return lower_cols[alias]
            
    # 2. Clean exact match
    for alias in aliases:
        clean_alias = alias.replace('_', '').replace(' ', '')
        if clean_alias in clean_cols:
            return clean_cols[clean_alias]
            
    # 3. Substring match
    for alias in aliases:
        clean_alias = alias.replace('_', '').replace(' ', '')
        for c_clean, original_col in clean_cols.items():
            if clean_alias in c_clean or c_clean in clean_alias:
                # Extra safety for 'id' and 'target' to avoid false positives
                if alias == "id" and "target" in c_clean:
                    continue
                return original_col
    return None

def detect_schema(df):
    mapping = {}
    for key, aliases in COLUMN_ALIASES.items():
        mapping[key] = find_column(df.columns, aliases)
    return mapping

def train_model():
    global global_df, global_model, global_features, global_task_type, global_mapping
    
    target_col = global_mapping.get("target")
    id_col = global_mapping.get("id")
    
    if not target_col:
        raise ValueError("Target column missing during training.")
        
    features = [c for c in global_df.columns if c != target_col and c != id_col]
    global_features = features
    
    X = global_df[features].copy()
    y = global_df[target_col].copy()
    
    if len(y.dropna().unique()) < 2:
        raise ValueError("Target column must contain at least two classes (e.g., 0 and 1).")
    
    # Task type detection
    if y.dtype == object or y.nunique() <= 10:
        global_task_type = 'classification'
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        if y.dtype == object:
            y = y.astype(str).str.lower().map({'yes': 1, 'true': 1, '1': 1, 'no': 0, 'false': 0, '0': 0})
            y = y.fillna(0)
    else:
        global_task_type = 'regression'
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        y = pd.to_numeric(y, errors='coerce').fillna(0)
        
    true_numeric_cols = [c for c in [global_mapping.get("tenure"), global_mapping.get("monthly"), global_mapping.get("total")] if c is not None]
    
    for col in true_numeric_cols:
        if col in X.columns:
            X[col] = pd.to_numeric(X[col], errors='coerce')
            
    numeric_features = [c for c in X.columns if c in true_numeric_cols or X[c].dtype in ['int64', 'float64', 'int32', 'float32']]
    categorical_features = [c for c in X.columns if c not in numeric_features]
    
    numeric_features = list(set(numeric_features))
    categorical_features = list(set([c for c in categorical_features if c not in numeric_features]))
    
    for col in categorical_features:
        X[col] = X[col].astype(str)
        
    print("NUMERIC FEATURES:", numeric_features)
    print("CATEGORICAL FEATURES:", categorical_features)
    print("X DTYPES:", X.dtypes.to_dict())
    
    transformers = []
    if numeric_features:
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', numeric_transformer, numeric_features))
        
    if categorical_features:
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        transformers.append(('cat', categorical_transformer, categorical_features))
        
    preprocessor = ColumnTransformer(transformers=transformers)
        
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    pipeline.fit(X_train, y_train)
    
    if global_task_type == 'classification':
        train_preds = pipeline.predict(X_train)
        test_preds = pipeline.predict(X_test)
        train_score = float(accuracy_score(y_train, train_preds))
        test_score = float(accuracy_score(y_test, test_preds))
    else:
        train_score = float(pipeline.score(X_train, y_train))
        test_score = float(pipeline.score(X_test, y_test))
        
    print(f"TRAINING ACCURACY: {train_score:.4f}")
    print(f"TESTING ACCURACY: {test_score:.4f}")
    
    global_model = pipeline
    print("MODEL TRAINED SUCCESSFULLY")
    
    try:
        importances = global_model.named_steps["model"].feature_importances_
        if hasattr(global_model.named_steps["preprocessor"], "get_feature_names_out"):
            feature_names = global_model.named_steps["preprocessor"].get_feature_names_out()
        else:
            feature_names = numeric_features + categorical_features
            
        clean_names = []
        for name in feature_names:
            if name.startswith('num__'):
                clean_names.append(name.replace('num__', '', 1))
            elif name.startswith('cat__'):
                clean_names.append(name.replace('cat__', '', 1))
            else:
                clean_names.append(name)
                
        fi = [{"feature": str(name), "importance": float(round(imp, 4))} for name, imp in zip(clean_names, importances)]
        fi = sorted(fi, key=lambda x: x["importance"], reverse=True)
        
        global global_feature_importances
        global_feature_importances = fi
    except Exception as e:
        print("COULD NOT EXTRACT FEATURE IMPORTANCES:", str(e))
        global_feature_importances = []
    
    return test_score

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global global_df, global_mapping
    content = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    elif file.filename.endswith(".xlsx") or file.filename.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    df.columns = df.columns.str.strip()
    
    mapping = detect_schema(df)
    print("COLUMN MAPPING:", mapping)
    
    if not mapping["target"]:
        raise HTTPException(status_code=400, detail="Could not detect target/churn column in dataset.")
    if not mapping["id"]:
        raise HTTPException(status_code=400, detail="Could not detect ID column in dataset.")
        
    global_df = df
    global_mapping = mapping
    
    try:
        accuracy = train_model()
    except Exception as e:
        print("TRAINING ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "message": "Dataset uploaded and model trained successfully",
        "rows": len(global_df),
        "columns": len(global_df.columns),
        "mapped_columns": mapping,
        "accuracy": accuracy,
        "feature_importances": global_feature_importances[:10]
    }

@app.post("/api/retrain")
async def retrain_model_endpoint():
    if global_df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded")
    try:
        acc = train_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Model retrained", "accuracy": acc}

@app.get("/api/feature-importance")
async def get_feature_importance():
    if not global_feature_importances:
        return []
    return global_feature_importances

def map_row_to_customer(row_dict, index):
    id_col = global_mapping.get("id")
    customer_id = str(row_dict.get(id_col, f"C{index+1:05d}")) if id_col else f"C{index+1:05d}"
    
    tenure_col = global_mapping.get("tenure")
    try:
        tenure = int(float(row_dict[tenure_col])) if tenure_col and pd.notnull(row_dict[tenure_col]) else 0
    except:
        tenure = 0
        
    monthly_col = global_mapping.get("monthly")
    try:
        monthly_bill = float(row_dict[monthly_col]) if monthly_col and pd.notnull(row_dict[monthly_col]) else 50.0
    except:
        monthly_bill = 50.0
    
    contract_col = global_mapping.get("contract")
    contract = str(row_dict[contract_col]) if contract_col else "Monthly"
    if pd.isnull(contract) or contract.lower() == 'nan':
        contract = "Monthly"
    
    pm_col = global_mapping.get("payment_issue")
    payment_issue = False
    if pm_col and pd.notnull(row_dict[pm_col]):
        val = str(row_dict[pm_col]).strip().lower()
        if val in ['true', '1', 'yes']:
            payment_issue = True
        elif val in ['false', '0', 'no']:
            payment_issue = False
        elif any(keyword in val for keyword in ['electronic check', 'error', 'issue', 'late', 'mailed check']):
            payment_issue = True
            
    total_col = global_mapping.get("total")
    total_spend = monthly_bill * tenure
    if total_col and pd.notnull(row_dict[total_col]) and str(row_dict[total_col]).strip() != "":
        try:
            total_spend = float(row_dict[total_col])
        except ValueError:
            pass # fallback to monthly_bill * tenure
            
    plan = 'Premium' if monthly_bill > 90 else 'Standard' if monthly_bill > 50 else 'Basic'
    
    name_col = global_mapping.get("name")
    if name_col and pd.notnull(row_dict.get(name_col)):
        customer_name = str(row_dict[name_col])
    else:
        names = [
          "Aarav Sharma", "Vivaan Patel", "Aditya Reddy", "Arjun Verma", "Krishna Nair",
          "Sai Kiran", "Rahul Yadav", "Rohan Mehta", "Akash Kumar", "Nikhil Gupta",
          "Ananya Singh", "Diya Kapoor", "Priya Nair", "Sneha Iyer", "Kavya Reddy",
          "Pooja Sharma", "Ishita Jain", "Neha Patil", "Meera Joshi", "Sanjana Rao",
          "Harsha Kulkarni", "Manoj Shetty", "Ritika Das", "Shreya Menon", "Deepak Rao"
        ]
        customer_name = names[index % len(names)]
    
    return {
        "id": customer_id,
        "name": customer_name,
        "email": f"user{customer_id}@example.com",
        "plan": plan,
        "monthlyBill": monthly_bill,
        "tenureMonths": tenure,
        "contract": contract,
        "paymentIssue": payment_issue,
        "totalSpend": total_spend,
        "avatarUrl": f"https://i.pravatar.cc/150?u={customer_id}"
    }

@app.get("/api/customers")
async def get_customers():
    if global_df is None:
        return []
        
    customers = []
    for i, row in global_df.head(100).iterrows():
        customers.append(map_row_to_customer(row.to_dict(), i))
        
    return customers

@app.get("/api/customers/search")
async def search_customers_query(q: str = ""):
    if global_df is None:
        return []
        
    all_customers = []
    limit = 100 if not q else len(global_df)
    for i, row in global_df.head(limit).iterrows():
        all_customers.append(map_row_to_customer(row.to_dict(), i))
        
    if not q:
        return all_customers[:100]
        
    results = [c for c in all_customers if q.lower() in c['id'].lower() or q.lower() in c['name'].lower()]
    return results[:100]

@app.get("/api/dashboard")
async def get_dashboard():
    empty_response = {
        "currentChurnRate": 0.0,
        "revenueAtRisk": 0.0,
        "activeSubscribers": 0,
        "churnTrend": [
            {"month": "Jan", "rate": 0},
            {"month": "Feb", "rate": 0},
            {"month": "Mar", "rate": 0},
            {"month": "Apr", "rate": 0},
            {"month": "May", "rate": 0},
            {"month": "Jun", "rate": 0}
        ],
        "riskDistribution": [
            {"name": "Retained", "value": 0, "color": "#22c55e"},
            {"name": "At Risk", "value": 0, "color": "#eab308"},
            {"name": "High Risk", "value": 0, "color": "#ef4444"}
        ]
    }

    if global_df is None or global_model is None:
        return empty_response
        
    try:
        check_is_fitted(global_model)
    except NotFittedError:
        return empty_response
        
    X = global_df[global_features]
    if global_task_type == 'classification':
        if hasattr(global_model.named_steps["model"], "predict_proba"):
            probs = global_model.predict_proba(X)
            pos_idx = 1 if len(global_model.named_steps["model"].classes_) > 1 else 0
            probs = probs[:, pos_idx]
        else:
            probs = global_model.predict(X)
    else:
        probs = global_model.predict(X)
        if probs.max() > 1:
            probs = probs / probs.max()
            
    churn_rate = float((probs > 0.5).mean() * 100)
    
    monthly_col = global_mapping.get("monthly")
    
    revenue_at_risk = 0.0
    if monthly_col:
        high_risk_mask = probs > 0.6
        df_monthly = pd.to_numeric(global_df[monthly_col], errors='coerce').fillna(0)
        revenue_at_risk = float(df_monthly[high_risk_mask].sum())
        
    active_subs = len(global_df)
    
    trend = [
      {"month": "Jan", "rate": max(0.0, round(churn_rate - 2.0, 1))},
      {"month": "Feb", "rate": max(0.0, round(churn_rate - 1.5, 1))},
      {"month": "Mar", "rate": max(0.0, round(churn_rate - 3.0, 1))},
      {"month": "Apr", "rate": max(0.0, round(churn_rate + 1.0, 1))},
      {"month": "May", "rate": max(0.0, round(churn_rate - 0.5, 1))},
      {"month": "Jun", "rate": round(churn_rate, 1)},
    ]
    
    low_risk = int(np.sum(probs < 0.33))
    medium_risk = int(np.sum((probs >= 0.33) & (probs < 0.66)))
    high_risk = int(np.sum(probs >= 0.66))
    
    return {
        "currentChurnRate": round(churn_rate, 1),
        "revenueAtRisk": round(revenue_at_risk, 2),
        "activeSubscribers": active_subs,
        "churnTrend": trend,
        "riskDistribution": [
            {"name": "Retained", "value": low_risk, "color": "#22c55e"},
            {"name": "At Risk", "value": medium_risk, "color": "#eab308"},
            {"name": "High Risk", "value": high_risk, "color": "#ef4444"}
        ]
    }

def get_risk_factors(row_dict):
    factors = []
    contract_col = global_mapping.get("contract")
    if contract_col and pd.notnull(row_dict[contract_col]) and 'month' in str(row_dict[contract_col]).lower():
        factors.append({"factor": "Month-to-Month Contract", "impactScore": 8})
        
    pm_col = global_mapping.get("payment_issue")
    if pm_col and pd.notnull(row_dict[pm_col]) and 'electronic' in str(row_dict[pm_col]).lower():
        factors.append({"factor": "Electronic Check Payment", "impactScore": 7})
        
    tenure_col = global_mapping.get("tenure")
    if tenure_col and pd.notnull(row_dict[tenure_col]):
        try:
            if float(row_dict[tenure_col]) < 12:
                factors.append({"factor": "Low Tenure (< 12 mo)", "impactScore": 6})
        except: pass
        
    monthly_col = global_mapping.get("monthly")
    if monthly_col and pd.notnull(row_dict[monthly_col]):
        try:
            if float(row_dict[monthly_col]) > 80:
                factors.append({"factor": "High Monthly Cost", "impactScore": 5})
        except: pass

    if not factors:
        factors.append({"factor": "General Usage Pattern", "impactScore": 5})
        
    return factors

@app.get("/api/predict/{customer_id}")
async def get_prediction(customer_id: str):
    if global_df is None or global_model is None:
        raise HTTPException(status_code=400, detail="Model not trained")
        
    try:
        check_is_fitted(global_model)
    except NotFittedError:
        raise HTTPException(status_code=400, detail="Model training not completed")
        
    id_col = global_mapping.get("id")
    if not id_col:
        raise HTTPException(status_code=400, detail="No ID column mapped in dataset")
        
    search_id = str(customer_id).strip().upper()
    df_ids = global_df[id_col].astype(str).str.strip().str.upper()
    idx = global_df.index[df_ids == search_id].tolist()
    
    if not idx:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    row = global_df.iloc[idx[0]:idx[0]+1]
    X_single = row[global_features]
    
    if global_task_type == 'classification':
        if hasattr(global_model.named_steps["model"], "predict_proba"):
            probs = global_model.predict_proba(X_single)[0]
            classes = list(global_model.named_steps["model"].classes_)

            if 1 in classes:
                pos_idx = classes.index(1)
            elif '1' in classes:
                pos_idx = classes.index('1')
            else:
                pos_idx = 0

            prob = float(probs[pos_idx])
        else:
            prob = float(global_model.predict(X_single)[0])
    else:
        prob = float(global_model.predict(X_single)[0])
        if prob > 1: prob = prob / 100.0
        
    score = int(round(prob * 100))
    score = min(max(score, 0), 99)
    
    if score >= 66: riskLevel = 'High'
    elif score >= 33: riskLevel = 'Medium'
    else: riskLevel = 'Low'

    print("PREDICTION:", customer_id, "prob=", prob, "score=", score, "risk=", riskLevel)
    
    row_dict = row.iloc[0].to_dict()
    factors = get_risk_factors(row_dict)
    
    return {
        "churnProbability": score,
        "riskLevel": riskLevel,
        "topRiskFactors": factors,
        "recommendedActions": [
            {"id": "act-1", "type": "email", "title": "Send 'Miss You' Campaign", "description": "Personalized re-engagement email."},
            {"id": "act-2", "type": "discount", "title": "Offer 20% Discount", "description": "Apply 20% off next 3 months."},
            {"id": "act-3", "type": "content", "title": "Suggest New Sci-Fi", "description": "Recommend highly rated shows."}
        ],
        "contentRecommendations": ["Stranger Things", "Black Mirror", "Dark", "Altered Carbon"]
    }
