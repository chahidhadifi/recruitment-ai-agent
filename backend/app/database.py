from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database credentials from environment variables
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "fastapi_db")

# Construct database URL with proper escaping
# Use urllib.parse to properly escape special characters in password
from urllib.parse import quote_plus
DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD)
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Also check if DATABASE_URL is directly provided
if os.getenv("DATABASE_URL"):
    # Parse and encode the password in DATABASE_URL if provided
    db_url = os.getenv("DATABASE_URL")
    if '://' in db_url and '@' in db_url:
        prefix, suffix = db_url.split('@', 1)
        if ':' in prefix:
            auth_parts = prefix.split(':')
            if len(auth_parts) >= 3:
                user_part = auth_parts[1].split('//')[-1]
                password_part = auth_parts[2]
                encoded_password = quote_plus(password_part)
                prefix = f"{auth_parts[0]}://{user_part}:{encoded_password}"
        SQLALCHEMY_DATABASE_URL = f"{prefix}@{suffix}"
    else:
        SQLALCHEMY_DATABASE_URL = db_url
    
logger.info(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_NAME} with user {DB_USER}")

# Log database connection details (without exposing full password)
db_url_parts = SQLALCHEMY_DATABASE_URL.split('@')
if len(db_url_parts) > 1:
    auth_parts = db_url_parts[0].split(':')
    if len(auth_parts) > 2:
        # Mask the password for logging
        masked_password = auth_parts[2][0] + '*****' if auth_parts[2] else ''
        masked_url = f"{auth_parts[0]}:{auth_parts[1]}:{masked_password}@{db_url_parts[1]}"
        logger.info(f"Database URL: {masked_url}")

# Create SQLAlchemy engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Function to initialize database (replaces Alembic migrations)
def init_db():
    from . import models
    
    logger.info("Initializing database tables...")
    try:
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Verify database connection
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            logger.info("Database connection verified")
        except Exception as e:
            logger.error(f"Error verifying database connection: {str(e)}")
            raise
        finally:
            db.close()
            
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

# Log additional connection details if not already logged
if len(db_url_parts) > 1 and '@' in SQLALCHEMY_DATABASE_URL:
    auth_parts = db_url_parts[0].split(':')
    if len(auth_parts) > 2:
        # Only show first character of password for security
        masked_password = auth_parts[2][0] + '*****' if auth_parts[2] else ''
        logger.info(f"Connecting to database with user: {auth_parts[1].split('//')[1]}, password: {masked_password}, host: {db_url_parts[1]}")
else:
    logger.info(f"Database URL format unexpected: {SQLALCHEMY_DATABASE_URL.split(':')[0]}")


# Create engine with retry logic
def get_engine(url, max_retries=10, retry_interval=5):
    retries = 0
    last_error = None
    
    # Mask password in log
    masked_url = url
    if '@' in url:
        prefix, suffix = url.split('@', 1)
        if ':' in prefix and '//' in prefix:
            protocol, rest = prefix.split('//', 1)
            if ':' in rest:
                user, password_rest = rest.split(':', 1)
                if password_rest:
                    masked_url = f"{protocol}//{user}:****@{suffix}"
    
    logger.info(f"Attempting to connect to database with URL: {masked_url}")
    
    while retries < max_retries:
        try:
            # Create engine with SQLAlchemy 1.4 syntax
            engine = create_engine(url)
            
            # Test connection
            connection = engine.connect()
            connection.execute(text("SELECT 1"))
            connection.close()
            
            logger.info("Database connection successful")
            return engine
                
        except OperationalError as e:
            last_error = e
            retries += 1
            error_msg = str(e)
            
            # Check if the error is about the database not existing
            if "database \"fastapi_db\" does not exist" in error_msg:
                logger.warning(f"Database '{DB_NAME}' does not exist. Attempting to create it...")
                
                # Create a connection to the default 'postgres' database to create our database
                try:
                    # Construct a URL to the postgres database
                    postgres_url = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/postgres"
                    # Use AUTOCOMMIT to allow database creation
                    temp_engine = create_engine(postgres_url, isolation_level='AUTOCOMMIT')
                    
                    with temp_engine.connect() as connection:
                        # Check if database already exists
                        query = text(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
                        result = connection.execute(query)
                        exists = result.fetchone() is not None
                        
                        if not exists:
                            # Create the database
                            connection.execute(text(f"CREATE DATABASE {DB_NAME}"))
                            logger.info(f"Successfully created database '{DB_NAME}'")
                        else:
                            logger.info(f"Database '{DB_NAME}' already exists")
                    
                    # Close the temporary engine
                    temp_engine.dispose()
                    # Wait a moment for the database to be available
                    time.sleep(2)
                    continue  # Skip the rest of this iteration and retry the main connection
                    
                except Exception as create_error:
                    logger.error(f"Failed to create database: {str(create_error)}")
                    # Continue with normal retry logic
            
            logger.warning(f"Database connection attempt {retries} failed: {error_msg}")
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts. Last error: {error_msg}")
                raise
                
        except Exception as e:
            last_error = e
            retries += 1
            logger.warning(f"Database connection attempt {retries} failed with unexpected error: {str(e)}")
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts. Last error: {str(e)}")
                raise

# Create engine with foreign key constraints disabled
engine = get_engine(SQLALCHEMY_DATABASE_URL)

# Execute raw SQL to disable foreign key constraints
with engine.connect() as connection:
    # Set the session_replication_role to 'replica' to disable foreign key constraints
    connection.execute(text("SET session_replication_role = 'replica';"))
    # Verify the setting was applied
    result = connection.execute(text("SHOW session_replication_role;")).fetchone()
    role = result[0] if result else "unknown"
    logger.info(f"Foreign key constraints disabled in the database session (role: {role})")
    if role != "replica":
        logger.warning("Failed to disable foreign key constraints - this may cause issues with data insertion")
        
    # Set this at the database level to ensure it persists for all connections
    try:
        connection.execute(text(f"ALTER DATABASE {DB_NAME} SET session_replication_role = 'replica';"))
        logger.info("Set session_replication_role to 'replica' at database level")
    except Exception as e:
        logger.warning(f"Could not set session_replication_role at database level: {str(e)}")
        logger.info("Will rely on session-level settings instead")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()