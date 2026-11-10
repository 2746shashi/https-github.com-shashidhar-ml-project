# Leaf & Loan — Community Book Exchange

A Flask and SQLite mini-project where readers list books, search listings, and request exchanges.

Features: account registration and sign-in, search and categories, create/edit/hide/relist listings, request notes, accept or decline requests, request history, and responsive page design.

From this project folder in PowerShell:

    ..\..\.venv\Scripts\python.exe -m pip install -r requirements.txt
    ..\..\.venv\Scripts\python.exe app.py

Open http://127.0.0.1:5000. Keep the terminal open while using the app; press Ctrl+C to stop it.

HTML templates and responsive CSS are included in app.py for easier editing. SQLite stores data in books.db. The existing database is upgraded automatically.

For a demo, create two accounts. Use one to list a book and the other to request it. The owner handles requests from the Requests page. After acceptance, both readers can see each other's email address to arrange a handoff.

This is a local classroom demo using Flask's development server and a local database. Set a private secret key and use a production server before publishing it publicly.
