import logging
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.models.user import UserRole

logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # base.Base.metadata.create_all(bind=base.engine)

    # Create initial users if no users exist
    user_count = db.query(crud.user.model).count()
    if user_count == 0:
        # Create admin user
        admin_in = schemas.UserCreate(
            email="admin@example.com",
            password="password",  # This is for demo only, use strong passwords in production
            name="Administrateur",
            role=UserRole.admin,
            status="actif"
        )
        admin = crud.user.create(db, obj_in=admin_in)
        logger.info(f"Created admin user: {admin.email}")

        # Create recruiter user
        recruiter_in = schemas.UserCreate(
            email="recruteur@example.com",
            password="password",  # This is for demo only, use strong passwords in production
            name="Recruteur",
            role=UserRole.recruteur,
            status="actif"
        )
        recruiter = crud.user.create(db, obj_in=recruiter_in)
        logger.info(f"Created recruiter user: {recruiter.email}")

        # Create candidate user
        candidate_in = schemas.UserCreate(
            email="candidat@example.com",
            password="password",  # This is for demo only, use strong passwords in production
            name="Candidat",
            role=UserRole.candidat,
            status="actif"
        )
        candidate = crud.user.create(db, obj_in=candidate_in)
        logger.info(f"Created candidate user: {candidate.email}")
    else:
        logger.info("Users already exist, skipping initial data creation")