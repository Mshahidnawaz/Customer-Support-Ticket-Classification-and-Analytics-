import sys
import os
import random
import uuid
import datetime
from sqlalchemy.orm import Session

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from models import SessionLocal, AuditLog, Complaint, Agent
from nlp import nlp_service

def debug_seed():
    db = SessionLocal()
    try:
        print("Clearing data...")
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
        
        print("Flushing agents...")
        db.flush()

        sample_descriptions = [
            {"desc": "Large pothole on the main road causing accidents.", "loc": "Main St & 5th Ave", "cat": "Roads"},
            {"desc": "Water supply is cut for the last 48 hours.", "loc": "Zion Park North", "cat": "Water"},
            {"desc": "Street lights are not working near the park.", "loc": "South Boulevard", "cat": "Electricity"},
            {"desc": "Garbage has not been collected for a week.", "loc": "West End District", "cat": "Garbage"},
            {"desc": "Traffic lights are broken at the intersection.", "loc": "Downtown Square", "cat": "Traffic"},
        ]
        
        print("Creating complaints...")
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
                
        print("Committing...")
        db.commit()
        print("Successfully seeded!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    debug_seed()
