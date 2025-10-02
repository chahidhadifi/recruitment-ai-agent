from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text
from urllib.parse import quote_plus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database credentials from environment variables
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "fastapi_db")

# Properly encode password
DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD)
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Override with DATABASE_URL if provided
if os.getenv("DATABASE_URL"):
    db_url = os.getenv("DATABASE_URL")
    # Simple validation
    if '://' in db_url:
        SQLALCHEMY_DATABASE_URL = db_url
        logger.info("Using DATABASE_URL from environment")
    
logger.info(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_NAME} with user {DB_USER}")


def mask_database_url(url: str) -> str:
    """Mask password in database URL for logging"""
    if '@' not in url:
        return url
    
    try:
        prefix, suffix = url.split('@', 1)
        if '://' in prefix and ':' in prefix:
            protocol, rest = prefix.split('//', 1)
            if ':' in rest:
                user, _ = rest.split(':', 1)
                return f"{protocol}//{user}:****@{suffix}"
    except Exception:
        pass
    return url.split(':')[0] + "://****"


def create_database_if_not_exists(db_url: str, db_name: str) -> bool:
    """Create database if it doesn't exist"""
    try:
        # Connect to postgres database to create our target database
        postgres_url = db_url.rsplit('/', 1)[0] + '/postgres'
        temp_engine = create_engine(
            postgres_url, 
            isolation_level='AUTOCOMMIT',
            pool_pre_ping=True
        )
        
        with temp_engine.connect() as connection:
            # Check if database exists
            query = text("SELECT 1 FROM pg_database WHERE datname = :db_name")
            result = connection.execute(query, {"db_name": db_name})
            exists = result.fetchone() is not None
            
            if not exists:
                # Create the database
                connection.execute(text(f'CREATE DATABASE "{db_name}"'))
                logger.info(f"Successfully created database '{db_name}'")
                temp_engine.dispose()
                time.sleep(2)  # Wait for database to be ready
                return True
            else:
                logger.info(f"Database '{db_name}' already exists")
        
        temp_engine.dispose()
        return True
        
    except Exception as e:
        logger.error(f"Failed to create database: {str(e)}")
        return False


def get_engine(url: str, max_retries: int = 10, retry_interval: int = 5):
    """Create database engine with retry logic"""
    masked_url = mask_database_url(url)
    logger.info(f"Attempting to connect to database: {masked_url}")
    
    retries = 0
    last_error = None
    
    while retries < max_retries:
        try:
            # Create engine with recommended settings
            engine = create_engine(
                url,
                pool_pre_ping=True,  # Verify connections before using them
                pool_recycle=3600,   # Recycle connections after 1 hour
                pool_size=5,         # Connection pool size
                max_overflow=10,     # Max overflow connections
                echo=False           # Set to True for SQL query logging
            )
            
            # Test connection
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            
            logger.info("Database connection successful")
            return engine
                
        except OperationalError as e:
            error_msg = str(e)
            
            # Check if database doesn't exist
            if "does not exist" in error_msg and DB_NAME in error_msg:
                logger.warning(f"Database '{DB_NAME}' does not exist. Attempting to create it...")
                
                if create_database_if_not_exists(url, DB_NAME):
                    continue  # Retry connection
                else:
                    logger.error("Failed to create database, aborting")
                    raise
            
            # Regular retry logic for other errors
            retries += 1
            last_error = e
            logger.warning(f"Database connection attempt {retries}/{max_retries} failed: {error_msg}")
            
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect after {max_retries} attempts")
                raise
                
        except Exception as e:
            retries += 1
            last_error = e
            logger.warning(f"Unexpected error on attempt {retries}/{max_retries}: {str(e)}")
            
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect after {max_retries} attempts")
                raise
    
    # This shouldn't be reached, but just in case
    if last_error:
        raise last_error


# Create the engine
engine = get_engine(SQLALCHEMY_DATABASE_URL)

# WARNING: Disabling foreign key constraints is dangerous!
# Only do this if you absolutely need to (e.g., for bulk data loading)
DISABLE_FOREIGN_KEY_CONSTRAINTS = os.getenv("DISABLE_FK_CONSTRAINTS", "false").lower() == "true"

if DISABLE_FOREIGN_KEY_CONSTRAINTS:
    logger.warning("⚠️  Foreign key constraints will be DISABLED for all connections!")
    logger.warning("⚠️  This can lead to data integrity issues. Use with caution!")
    
    # Set up event listener to disable FK constraints on every connection
    @event.listens_for(engine, "connect")
    def set_session_replication_role(dbapi_conn, connection_record):
        """Disable foreign key constraints for each new connection"""
        cursor = dbapi_conn.cursor()
        cursor.execute("SET session_replication_role = 'replica';")
        cursor.close()
        logger.debug("Foreign key constraints disabled for new connection")
    
    # Try to set at database level (requires superuser privileges)
    try:
        with engine.connect() as connection:
            connection.execute(text(f'ALTER DATABASE "{DB_NAME}" SET session_replication_role = "replica";'))
            connection.commit()
            logger.info(f"Set session_replication_role at database level for '{DB_NAME}'")
    except Exception as e:
        logger.warning(f"Could not set session_replication_role at database level: {str(e)}")
        logger.info("Using connection-level event listener instead")
else:
    logger.info("Foreign key constraints are ENABLED (default)")

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    """Database session dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Health check function
def check_database_connection() -> bool:
    """Check if database is accessible"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False


# Initialize database tables
def init_db():
    """Create all tables defined in models"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise