# database/database_setup.py
from pymongo import MongoClient
from pymongo.errors import CollectionInvalid

def setup_database_schema():
    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['financial_advisory']  # Replace with your database name
    
    

if __name__ == "__main__":
    setup_database_schema()
