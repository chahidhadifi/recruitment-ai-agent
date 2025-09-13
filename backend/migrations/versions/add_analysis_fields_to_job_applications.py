"""Add analysis fields to job applications

Revision ID: add_analysis_fields
Revises: 
Create Date: 2025-09-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_analysis_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the 'analyzed' status to the ApplicationStatus enum
    op.execute("ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'analyzed'")
    
    # Add the new columns to the job_applications table
    op.add_column('job_applications', sa.Column('score', sa.Integer(), nullable=True))
    op.add_column('job_applications', sa.Column('observations', sa.Text(), nullable=True))
    op.add_column('job_applications', sa.Column('qualified', sa.Boolean(), nullable=True))
    op.add_column('job_applications', sa.Column('strengths', sa.Text(), nullable=True))
    op.add_column('job_applications', sa.Column('weaknesses', sa.Text(), nullable=True))
    op.add_column('job_applications', sa.Column('keywords_match', sa.Text(), nullable=True))
    op.add_column('job_applications', sa.Column('analyzed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove the columns from the job_applications table
    op.drop_column('job_applications', 'analyzed_at')
    op.drop_column('job_applications', 'keywords_match')
    op.drop_column('job_applications', 'weaknesses')
    op.drop_column('job_applications', 'strengths')
    op.drop_column('job_applications', 'qualified')
    op.drop_column('job_applications', 'observations')
    op.drop_column('job_applications', 'score')
    
    # Note: We cannot remove values from an enum in PostgreSQL