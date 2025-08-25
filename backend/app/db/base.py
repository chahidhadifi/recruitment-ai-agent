# Import all the models, so that Base has them before being imported by Alembic
from app.db.session import Base, engine
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.interview import Interview