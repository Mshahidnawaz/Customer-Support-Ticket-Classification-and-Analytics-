import random
import re

# Categories and keywords for classification
CATEGORIES = {
    "Roads": ["pothole", "street", "road", "pavement", "paving", "bridge", "asphalt", "culvert"],
    "Water": ["leak", "pipe", "water", "supply", "tap", "sewage", "drainage", "overflow"],
    "Electricity": ["power", "light", "current", "wire", "shock", "transformer", "blackout", "street light"],
    "Garbage": ["trash", "waste", "garbage", "bin", "dump", "dirty", "smell", "scavenging"],
    "Traffic": ["signal", "jam", "congestion", "parking", "fine", "vehicle", "speeding", "intersection"],
    "Public Health": ["mosquito", "hospital", "clinic", "disease", "emergency", "cleanliness", "infection"],
}

# Mapping categories to departments
DEPARTMENT_ROUTING = {
    "Roads": "Engineering & Public Works",
    "Water": "Water Supply & Sewerage",
    "Electricity": "Electrical Services",
    "Garbage": "Solid Waste Management",
    "Traffic": "Traffic Police & Transport",
    "Public Health": "Department of Health & Sanitation",
}

CRITICAL_KEYWORDS = ["danger", "emergency", "fatal", "blood", "fire", "smoke", "accident", "immediate", "urgent", "help", "risk", "hazard", "life", "criticial", "injury"]

NEGATIVE_WORDS = ["angry", "bad", "worst", "terrible", "stinking", "pathetic", "useless", "broken", "fail", "neglect", "don't care", "failed", "unsafe", "disgusting"]
POSITIVE_WORDS = ["good", "thanks", "better", "improved", "great", "suggest", "request", "please", "kindly"]

class NLPService:
    def __init__(self):
        pass

    def classify_grievance(self, text: str) -> str:
        """Categorize the grievance based on keyword density."""
        text = text.lower()
        scores = {cat: 0 for cat in CATEGORIES}
        for cat, keywords in CATEGORIES.items():
            for kw in keywords:
                # Use regex for basic whole word matching
                if re.search(rf"\b{kw}\b", text):
                    scores[cat] += 1
        
        predicted_cat = max(scores, key=scores.get)
        if scores[predicted_cat] == 0:
            return "General / Misc"
        return predicted_cat

    def detect_urgency(self, text: str) -> str:
        """Determines urgency level based on critical keyword detection."""
        text = text.lower()
        matches = [kw for kw in CRITICAL_KEYWORDS if re.search(rf"\b{kw}\b", text)]
        if len(matches) > 1:
            return "High"
        if len(matches) == 1:
            return "Medium"
        return "Low"

    def analyze_sentiment(self, text: str) -> str:
        """Basic sentiment analysis using positive/negative lexicons."""
        text = text.lower()
        neg_count = sum(1 for w in NEGATIVE_WORDS if re.search(rf"\b{w}\b", text))
        pos_count = sum(1 for w in POSITIVE_WORDS if re.search(rf"\b{w}\b", text))
        
        if neg_count > pos_count:
            return "Negative"
        if pos_count > neg_count:
            return "Positive"
        return "Neutral"

    def get_routing(self, category: str) -> str:
        """Returns the appropriate department for a category."""
        return DEPARTMENT_ROUTING.get(category, "General Administration")

nlp_service = NLPService()
