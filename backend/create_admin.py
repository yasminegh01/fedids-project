# backend/create_admin.py

import getpass
from sqlalchemy.orm import Session
from main import User, get_password_hash, engine, SessionLocal

def create_admin_user():
    """
    Command-line utility to create a new admin user in the database.
    """
    db: Session = SessionLocal()
    print("--- Create New Admin User ---")

    while True:
        username = input("Enter username: ").strip()
        if not username:
            print("Username cannot be empty.")
            continue
            
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"Username '{username}' already exists. Please choose another.")
            continue
        
        break

    while True:
        password = getpass.getpass("Enter password: ")
        if not password:
            print("Password cannot be empty.")
            continue
            
        password_confirm = getpass.getpass("Confirm password: ")
        if password != password_confirm:
            print("Passwords do not match. Please try again.")
            continue
        
        break

    try:
        hashed_password = get_password_hash(password)
        new_user = User(username=username, hashed_password=hashed_password)
        
        db.add(new_user)
        db.commit()
        
        print(f"\n✅ Successfully created admin user: '{username}'")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()