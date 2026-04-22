from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
import uuid
import datetime
import random
import os
import shutil
import json
from typing import List, Optional
from pydantic import BaseModel

from models import SessionLocal, engine, Complaint, AuditLog, User, Agent, Notification
from nlp import nlp_service

app = FastAPI(title="Municipality Grievance API")

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class ComplaintCreate(BaseModel):
    description: str
    location: str
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: Optional[str] = "Web App"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    remark: Optional[str] = None
    agent_id: Optional[str] = None

@app.post("/api/complaints")
async def create_complaint(
    description: str = Form(...),
    location: str = Form(...),
    category: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    source: Optional[str] = Form("Web App"),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
    # NLP Data Pipeline
    final_category = category or nlp_service.classify_grievance(description)
    urgency = nlp_service.detect_urgency(description)
    sentiment = nlp_service.analyze_sentiment(description)
    department = nlp_service.get_routing(final_category)
    
    complaint_id = f"GRI-{uuid.uuid4().hex[:8].upper()}"
    
    # Handle Image Uploads
    saved_images = []
    for file in files:
        if file.filename:
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_images.append(unique_filename)
    
    # Auto-assign agent if available for the department
    available_agent = db.query(Agent).filter(Agent.department == department, Agent.status == "Active").first()
    
    new_complaint = Complaint(
        id=complaint_id,
        description=description,
        location=location,
        latitude=latitude or 12.9716 + random.uniform(-0.05, 0.05),
        longitude=longitude or 77.5946 + random.uniform(-0.05, 0.05),
        category=final_category,
        urgency=urgency,
        sentiment=sentiment,
        department=department,
        status="Pending",
        agent_id=available_agent.id if available_agent else None,
        images=saved_images,
        created_at=datetime.datetime.utcnow()
    )
    
    db.add(new_complaint)
    db.add(AuditLog(
        complaint_id=complaint_id,
        action="Complaint Submission",
        performed_by="Citizen",
        details=f"Submitted via {source}. Categorized as {final_category} ({urgency} priority)."
    ))
    
    # Create Notification
    db.add(Notification(
        complaint_id=complaint_id,
        message=f"Grievance {complaint_id} has been successfully logged. Status: Pending acknowledgment."
    ))
    
    if available_agent:
        db.add(Notification(
            complaint_id=complaint_id,
            message=f"Agent {available_agent.name} has been assigned to your grievance from the {department} department."
        ))

    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@app.get("/api/complaints")
def get_complaints(category: Optional[str] = None, status: Optional[str] = None, agent_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Complaint).options(joinedload(Complaint.agent))
    if category: query = query.filter(Complaint.category == category)
    if status: query = query.filter(Complaint.status == status)
    if agent_id: query = query.filter(Complaint.agent_id == agent_id)
    return query.order_by(Complaint.created_at.desc()).all()

@app.get("/api/complaints/{id}")
def get_complaint(id: str, db: Session = Depends(get_db)):
    db_complaint = db.query(Complaint).options(joinedload(Complaint.agent)).filter(Complaint.id == id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

@app.patch("/api/complaints/{id}")
def update_complaint(id: str, update_in: ComplaintUpdate, db: Session = Depends(get_db)):
    db_complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if update_in.status:
        old_status = db_complaint.status
        db_complaint.status = update_in.status
        if update_in.status == "Resolved":
            db_complaint.resolved_at = datetime.datetime.utcnow()
            if db_complaint.agent:
                db_complaint.agent.resolved_count += 1
        
        db.add(AuditLog(complaint_id=id, action="Status Update", performed_by="Admin", details=f"Status changed from {old_status} to {update_in.status}"))
        
        # Create Notification
        db.add(Notification(
            complaint_id=id,
            message=f"Status update on your grievance {id}: Now marked as {update_in.status}."
        ))
    
    if update_in.remark: 
        db_complaint.remark = update_in.remark
        db.add(Notification(
            complaint_id=id,
            message=f"Official remark added to grievance {id}: \"{update_in.remark[:30]}...\""
        ))

    if update_in.agent_id: db_complaint.agent_id = update_in.agent_id
        
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.timestamp.desc()).limit(20).all()

@app.patch("/api/notifications/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}

@app.get("/api/agents")
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).options(joinedload(Agent.complaints)).all()

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    all_complaints = db.query(Complaint).all()
    # KPIs
    total, resolved = len(all_complaints), len([c for c in all_complaints if c.status == "Resolved"])
    pending = total - resolved
    # Distributions
    categories = {}
    for c in all_complaints: categories[c.category] = categories.get(c.category, 0) + 1
    priorities = {"High": 0, "Medium": 0, "Low": 0}
    for c in all_complaints: priorities[c.urgency] = priorities.get(c.urgency, 0) + 1

    # Trends: Volume over the last 7 days
    now = datetime.datetime.utcnow()
    trends = []
    for i in range(6, -1, -1):
        day = (now - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        count = len([c for c in all_complaints if c.created_at.strftime("%Y-%m-%d") == day])
        trends.append({"name": day, "value": count})

    return {
        "kpis": {"total": total, "resolved": resolved, "pending": pending},
        "charts": {
            "by_category": [{"name": k, "value": v} for k, v in categories.items()],
            "by_priority": [{"name": k, "value": v} for k, v in priorities.items()],
            "trends": trends,
            "by_status": [
                {"name": "Pending", "value": len([c for c in all_complaints if c.status == "Pending"])},
                {"name": "In Progress", "value": len([c for c in all_complaints if c.status == "In Progress"])},
                {"name": "Under Review", "value": len([c for c in all_complaints if c.status == "Under Review"])},
                {"name": "Escalated", "value": len([c for c in all_complaints if c.status == "Escalated"])},
                {"name": "Resolved", "value": resolved}
            ]
        }
    }

@app.get("/api/audit")
def get_audit_logs(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if search:
        query = query.filter(AuditLog.details.contains(search) | AuditLog.complaint_id.contains(search))
    return query.order_by(AuditLog.timestamp.desc()).limit(100).all()

@app.get("/api/seed")
def seed_data(db: Session = Depends(get_db)):
    # Clear existing data in reverse dependency order
    db.query(AuditLog).delete()
    db.query(Complaint).delete()
    db.query(Agent).delete()
    
    # Seed Agents
    depts = ["Engineering & Public Works", "Water Supply & Sewerage", "Electrical Services", "Solid Waste Management", "Traffic Police & Transport", "Department of Health & Sanitation"]
    agents = []
    for i in range(12):
        a = Agent(
            id=f"AGT-{100+i}",
            name=f"Agent {random.choice(['John', 'Sarah', 'Alex', 'Emily', 'Michael', 'Jessica'])} {random.choice(['Smith', 'Doe', 'Curry', 'Wong', 'Garcia'])}",
            department=random.choice(depts),
            status=random.choice(["Active", "Busy", "Active"]),
            resolved_count=random.randint(5, 50)
        )
        db.add(a)
        agents.append(a)
    
    # Pre-flush so IDs are available but not committed
    db.flush()

    sample_descriptions = [
        {"desc": "Large pothole on the main road causing accidents.", "loc": "Main St & 5th Ave", "cat": "Roads"},
        {"desc": "Water supply is cut for the last 48 hours.", "loc": "Zion Park North", "cat": "Water"},
        {"desc": "Street lights are not working near the park.", "loc": "South Boulevard", "cat": "Electricity"},
        {"desc": "Garbage has not been collected for a week.", "loc": "West End District", "cat": "Garbage"},
        {"desc": "Traffic lights are broken at the intersection.", "loc": "Downtown Square", "cat": "Traffic"},
    ]
    
    for _ in range(30):
        sample = random.choice(sample_descriptions)
        cid = f"GRI-{uuid.uuid4().hex[:8].upper()}"
        status = random.choice(["Pending", "In Progress", "In Progress", "Resolved"])
        dept = nlp_service.get_routing(sample["cat"])
        dept_agents = [a for a in agents if a.department == dept]
        active_agent = random.choice(dept_agents) if dept_agents else random.choice(agents)
        
        complaint = Complaint(
            id=cid, description=sample["desc"], location=sample["loc"],
            latitude=12.9716 + random.uniform(-0.05, 0.05), longitude=77.5946 + random.uniform(-0.05, 0.05),
            category=sample["cat"], urgency=random.choice(["High", "Medium", "Low"]),
            sentiment="Negative", department=dept, status=status, agent_id=active_agent.id,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 15))
        )
        db.add(complaint)
        db.add(AuditLog(complaint_id=cid, action="Submission", performed_by="Citizen", details="Initial seeding"))
        if status != "Pending":
            db.add(AuditLog(complaint_id=cid, action="Status Update", performed_by="Admin", details=f"Status set to {status}"))
            
    db.commit()
    return {"status": "seeded", "counts": {"complaints": 30, "agents": 12}}
