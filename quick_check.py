import sqlite3
db_path = "edgedash.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT title, company, fit_score FROM listings ORDER BY fit_score DESC LIMIT 10")
rows = cursor.fetchall()
print("\nTOP 10 SCORED JOBS:\n")
for i, (title, company, score) in enumerate(rows, 1):
    print(f"{i:2}. {title:35s} {company:25s} Score: {score}")
conn.close()
