#!/usr/bin/env python3
"""
Script pour vérifier et corriger l'utilisateur admin dans la base de données
"""
import hashlib
import psycopg2
import os

def hash_password(password: str) -> str:
    """Hash un mot de passe avec SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def check_admin_user():
    """Vérifier si l'utilisateur admin existe"""
    
    # Configuration de la base de données
    db_config = {
        'dbname': 'fastapi_db',
        'user': 'postgres',
        'password': 'password',
        'host': 'localhost',
        'port': '5432'
    }
    
    try:
        # Connexion à la base de données
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        # Vérifier si l'utilisateur admin@gmail.com existe
        cursor.execute("SELECT email, password FROM users WHERE email = %s", ('admin@gmail.com',))
        user = cursor.fetchone()
        
        if user:
            print(f"✅ Utilisateur trouvé: {user[0]}")
            print(f"🔑 Mot de passe hashé: {user[1]}")
            
            # Vérifier si le mot de passe correspond à 'password123'
            expected_hash = hash_password('password123')
            if user[1] == expected_hash:
                print("✅ Le mot de passe correspond à 'password123'")
            else:
                print(f"❌ Le mot de passe ne correspond pas")
                print(f"   Attendu: {expected_hash}")
                print(f"   Trouvé:  {user[1]}")
                
                # Demander si on veut corriger le mot de passe
                response = input("Voulez-vous corriger le mot de passe ? (oui/non): ")
                if response.lower() in ['oui', 'o', 'yes', 'y']:
                    cursor.execute("UPDATE users SET password = %s WHERE email = %s", 
                                  (expected_hash, 'admin@gmail.com'))
                    conn.commit()
                    print("✅ Mot de passe corrigé avec succès")
        else:
            print("❌ Utilisateur admin@gmail.com non trouvé")
            
            # Demander si on veut créer l'utilisateur
            response = input("Voulez-vous créer l'utilisateur admin@gmail.com ? (oui/non): ")
            if response.lower() in ['oui', 'o', 'yes', 'y']:
                hashed_password = hash_password('password123')
                cursor.execute("""
                    INSERT INTO users (email, name, password, role, status, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, ('admin@gmail.com', 'Administrateur', hashed_password, 'admin', 'actif', True))
                conn.commit()
                print("✅ Utilisateur admin@gmail.com créé avec succès")
                print(f"📧 Email: admin@gmail.com")
                print(f"🔑 Mot de passe: password123")
                print(f"🔐 Hash: {hashed_password}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        print("Assurez-vous que la base de données est démarrée avec: docker-compose up -d db")

if __name__ == "__main__":
    print("🔍 Vérification de l'utilisateur admin dans la base de données...")
    check_admin_user()