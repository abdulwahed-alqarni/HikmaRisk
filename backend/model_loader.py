import joblib
import shap
import pandas as pd
import numpy as np
import os

def load_model_and_explainer(pipeline_path='diabetes_prediction_pipeline.joblib'):
    """
    Loads pre-trained sklearn pipeline containing preprocessor and XGBoost classifier,
    and initializes a SHAP TreeExplainer.
    """
    if not os.path.exists(pipeline_path):
        # Fallback path check inside backend folder or root
        if os.path.exists(os.path.join(os.path.dirname(__file__), pipeline_path)):
            pipeline_path = os.path.join(os.path.dirname(__file__), pipeline_path)

    try:
        pipeline = joblib.load(pipeline_path)
        # Extract preprocessor and classifier
        classifier = None
        preprocessor = None

        if hasattr(pipeline, 'named_steps'):
            if 'classifier' in pipeline.named_steps:
                classifier = pipeline.named_steps['classifier']
            elif 'model' in pipeline.named_steps:
                classifier = pipeline.named_steps['model']
            else:
                classifier = pipeline.steps[-1][1]

            if 'preprocessor' in pipeline.named_steps:
                preprocessor = pipeline.named_steps['preprocessor']
            else:
                preprocessor = pipeline.steps[0][1]
        else:
            classifier = pipeline

        # Create SHAP TreeExplainer
        explainer = shap.TreeExplainer(classifier)

        return {
            'pipeline': pipeline,
            'classifier': classifier,
            'preprocessor': preprocessor,
            'explainer': explainer
        }
    except Exception as e:
        print(f"Warning: Could not load pipeline from '{pipeline_path}': {e}")
        # Return None to allow graceful fallback/mock explainer in prediction_service
        return None
