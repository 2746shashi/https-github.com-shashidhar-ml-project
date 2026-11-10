from functools import wraps
from pathlib import Path
import os
import secrets
import sqlite3

from flask import (
    Flask,
    abort,
    flash,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get(
    "BOOK_EXCHANGE_SECRET", "local-demo-key-change-before-deploy"
)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)

DB = Path(__file__).with_name("books.db")
CATEGORIES = [
    "Fiction",
    "Non-fiction",
    "Education",
    "Science",
    "Technology",
    "History",
    "Biography",
    "Children",
    "Other",
]
CONDITIONS = ["Like new", "Good", "Acceptable"]


# ---------------------------------------------------------------------------
# Database Management & Performance Optimization
# ---------------------------------------------------------------------------
def get_db():
    """Reuse a single SQLite connection per request with WAL mode enabled."""
    if "db" not in g:
        conn = sqlite3.connect(DB)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        g.db = conn
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        if exception is None:
            db.commit()
        else:
            db.rollback()
        db.close()


def ensure_column(db, table, column, definition):
    names = {r["name"] for r in db.execute(f"PRAGMA table_info({table})")}
    if column not in names:
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def init_db():
    """Create tables, indexes, and seed initial books if the database is empty."""
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS books(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                book_condition TEXT NOT NULL,
                owner_name TEXT NOT NULL,
                available INTEGER NOT NULL DEFAULT 1,
                owner_id INTEGER,
                category TEXT NOT NULL DEFAULT 'Other',
                description TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS exchange_requests(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                requester_name TEXT NOT NULL,
                message TEXT,
                status TEXT NOT NULL DEFAULT 'Pending',
                requester_id INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(book_id) REFERENCES books(id)
            );
            """
        )
        # Backward-compatible migrations for older books.db files
        ensure_column(conn, "books", "owner_id", "INTEGER")
        ensure_column(conn, "books", "category", "TEXT NOT NULL DEFAULT 'Other'")
        ensure_column(conn, "books", "description", "TEXT NOT NULL DEFAULT ''")
        ensure_column(conn, "books", "created_at", "TEXT NOT NULL DEFAULT ''")
        ensure_column(conn, "exchange_requests", "requester_id", "INTEGER")
        ensure_column(conn, "exchange_requests", "created_at", "TEXT NOT NULL DEFAULT ''")

        # Indexes for fast filtering and lookups
        conn.executescript(
            """
            CREATE INDEX IF NOT EXISTS idx_books_available_cat ON books(available, category);
            CREATE INDEX IF NOT EXISTS idx_books_owner ON books(owner_id);
            CREATE INDEX IF NOT EXISTS idx_requests_book ON exchange_requests(book_id, status);
            CREATE INDEX IF NOT EXISTS idx_requests_requester ON exchange_requests(requester_id);
            """
        )

        # Seed sample users & books if the shelf is empty
        book_count = conn.execute("SELECT COUNT(*) FROM books").fetchone()[0]
        if book_count == 0:
            demo_pw = generate_password_hash("password123")
            cur1 = conn.execute(
                "INSERT OR IGNORE INTO users(name, email, password_hash) VALUES (?, ?, ?)",
                ("Aarav Mehta", "aarav@example.com", demo_pw),
            )
            cur2 = conn.execute(
                "INSERT OR IGNORE INTO users(name, email, password_hash) VALUES (?, ?, ?)",
                ("Meera Nair", "meera@example.com", demo_pw),
            )
            u1 = cur1.lastrowid or conn.execute("SELECT id FROM users WHERE email='aarav@example.com'").fetchone()[0]
            u2 = cur2.lastrowid or conn.execute("SELECT id FROM users WHERE email='meera@example.com'").fetchone()[0]

            sample_books = [
                (
                    "The Midnight Library",
                    "Matt Haig",
                    "Fiction",
                    "Like new",
                    "Between life and death there is a library, and within that library, the shelves go on forever. A warm, uplifting read.",
                    u1,
                    "Aarav Mehta",
                ),
                (
                    "Atomic Habits",
                    "James Clear",
                    "Non-fiction",
                    "Good",
                    "Practical strategies for forming good habits, breaking bad ones, and mastering tiny behaviors that lead to remarkable results.",
                    u2,
                    "Meera Nair",
                ),
                (
                    "Sapiens: A Brief History of Humankind",
                    "Yuval Noah Harari",
                    "History",
                    "Like new",
                    "Explores how Homo sapiens came to dominate the planet through cognitive, agricultural, and scientific revolutions.",
                    u1,
                    "Aarav Mehta",
                ),
                (
                    "Designing Data-Intensive Applications",
                    "Martin Kleppmann",
                    "Technology",
                    "Good",
                    "Essential guide to modern distributed systems, databases, stream processing, and scalable software architecture.",
                    u2,
                    "Meera Nair",
                ),
                (
                    "Cosmos",
                    "Carl Sagan",
                    "Science",
                    "Like new",
                    "A poetic journey through space, time, and the evolution of science and civilization.",
                    u1,
                    "Aarav Mehta",
                ),
                (
                    "The Wright Brothers",
                    "David McCullough",
                    "Biography",
                    "Acceptable",
                    "The dramatic story-behind-the-story about the courageous brothers who taught the world how to fly.",
                    u2,
                    "Meera Nair",
                ),
            ]
            conn.executemany(
                """
                INSERT INTO books(title, author, category, book_condition, description, owner_id, owner_name, available)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """,
                sample_books,
            )
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Auth & CSRF Helpers
# ---------------------------------------------------------------------------
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    if "current_user" not in g:
        g.current_user = (
            get_db()
            .execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
            .fetchone()
        )
    return g.current_user


def csrf():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_urlsafe(32)
    return session["csrf_token"]


@app.context_processor
def inject_globals():
    """Automatically provide user, csrf token, and categories to all templates."""
    return {
        "user": current_user(),
        "csrf": csrf(),
        "categories": CATEGORIES,
        "conditions": CONDITIONS,
    }


@app.before_request
def verify_forms():
    if request.method == "POST":
        sent = request.form.get("csrf_token", "")
        expected = session.get("csrf_token", "")
        if not sent or not expected or not secrets.compare_digest(sent, expected):
            abort(400, description="This form expired. Refresh the page and try again.")


def login_required(view):
    @wraps(view)
    def protected(*args, **kwargs):
        if current_user() is None:
            flash("Please sign in to continue.", "info")
            return redirect(url_for("login", next=request.path))
        return view(*args, **kwargs)

    return protected


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    search = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    if category not in CATEGORIES:
        category = ""
    term = f"%{search}%"

    books = (
        get_db()
        .execute(
            """
            SELECT books.*, users.name AS account_owner
            FROM books
            LEFT JOIN users ON users.id = books.owner_id
            WHERE books.available = 1
              AND (? = '' OR books.title LIKE ? OR books.author LIKE ? OR books.description LIKE ?)
              AND (? = '' OR books.category = ?)
            ORDER BY books.id DESC
            """,
            (search, term, term, term, category, category),
        )
        .fetchall()
    )
    return render_template(
        "index.html",
        page_title="Explore books",
        mode="explore",
        books=books,
        search=search,
        selected_category=category,
    )


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user():
        return redirect(url_for("home"))
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not 2 <= len(name) <= 60:
            flash("Your name must be between 2 and 60 characters.", "error")
        elif len(email) > 120 or "@" not in email:
            flash("Enter a valid email address.", "error")
        elif len(password) < 8:
            flash("Use a password with at least 8 characters.", "error")
        else:
            try:
                db = get_db()
                cursor = db.execute(
                    "INSERT INTO users(name, email, password_hash) VALUES (?, ?, ?)",
                    (name, email, generate_password_hash(password)),
                )
                db.commit()
                session.clear()
                session["user_id"] = cursor.lastrowid
                flash("Your account is ready. Welcome to the exchange!", "success")
                return redirect(url_for("home"))
            except sqlite3.IntegrityError:
                flash("An account with that email already exists.", "error")

    return render_template(
        "index.html",
        page_title="Create account",
        mode="auth",
        creating=True,
        heading="Create account",
    )


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user():
        return redirect(url_for("home"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = (
            get_db()
            .execute("SELECT * FROM users WHERE email = ?", (email,))
            .fetchone()
        )
        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session["user_id"] = user["id"]
            target = request.args.get("next", "")
            if target.startswith("/") and not target.startswith("//"):
                return redirect(target)
            return redirect(url_for("home"))
        flash("Email or password is incorrect.", "error")

    return render_template(
        "index.html",
        page_title="Sign in",
        mode="auth",
        creating=False,
        heading="Sign in",
    )


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("You have signed out.", "success")
    return redirect(url_for("home"))


def save_book(book=None):
    heading = "Edit listing" if book else "List a book"
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        author = request.form.get("author", "").strip()
        category = request.form.get("category", "").strip()
        condition = request.form.get("book_condition", "").strip()
        description = request.form.get("description", "").strip()

        if not title or len(title) > 120 or not author or len(author) > 100:
            flash("Enter a title and author within the length limits.", "error")
        elif category not in CATEGORIES or condition not in CONDITIONS:
            flash("Choose a valid category and condition.", "error")
        elif len(description) > 700:
            flash("Description must be 700 characters or less.", "error")
        else:
            user = current_user()
            db = get_db()
            if book:
                db.execute(
                    """
                    UPDATE books
                    SET title = ?, author = ?, category = ?, book_condition = ?, description = ?
                    WHERE id = ? AND owner_id = ?
                    """,
                    (title, author, category, condition, description, book["id"], user["id"]),
                )
            else:
                db.execute(
                    """
                    INSERT INTO books(title, author, category, book_condition, description, owner_id, owner_name, available)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                    """,
                    (title, author, category, condition, description, user["id"], user["name"]),
                )
            db.commit()
            flash("Your listing has been saved.", "success")
            return redirect(url_for("my_books"))

    return render_template(
        "add_book.html",
        page_title=heading,
        heading=heading,
        book=book,
    )


@app.route("/books/new", methods=["GET", "POST"])
@login_required
def book_form():
    return save_book(None)


@app.route("/books/<int:book_id>/edit", methods=["GET", "POST"])
@login_required
def edit_book(book_id):
    user = current_user()
    book = (
        get_db()
        .execute(
            "SELECT * FROM books WHERE id = ? AND owner_id = ?",
            (book_id, user["id"]),
        )
        .fetchone()
    )
    if not book:
        abort(404)
    return save_book(book)


@app.route("/books/<int:book_id>/request", methods=["POST"])
@login_required
def request_book(book_id):
    user = current_user()
    message = request.form.get("message", "").strip()
    if len(message) > 240:
        flash("Your note must be 240 characters or less.", "error")
        return redirect(url_for("home"))

    db = get_db()
    book = db.execute(
        "SELECT * FROM books WHERE id = ? AND available = 1", (book_id,)
    ).fetchone()

    if not book:
        flash("This book is no longer available.", "error")
    elif book["owner_id"] is None:
        flash("This older listing has no account owner. Ask the owner to relist it.", "info")
    elif book["owner_id"] == user["id"]:
        flash("You cannot request your own listing.", "error")
    else:
        duplicate = db.execute(
            """
            SELECT id FROM exchange_requests
            WHERE book_id = ? AND requester_id = ? AND status = 'Pending'
            """,
            (book_id, user["id"]),
        ).fetchone()
        if duplicate:
            flash("You already have a pending request for this book.", "info")
        else:
            db.execute(
                """
                INSERT INTO exchange_requests(book_id, requester_name, requester_id, message, status)
                VALUES (?, ?, ?, ?, 'Pending')
                """,
                (book_id, user["name"], user["id"], message),
            )
            db.commit()
            flash("Your exchange request has been sent.", "success")
    return redirect(url_for("home"))


@app.route("/my-books")
@login_required
def my_books():
    user = current_user()
    books = (
        get_db()
        .execute(
            """
            SELECT books.*,
                   (SELECT COUNT(*) FROM exchange_requests r
                    WHERE r.book_id = books.id AND r.status = 'Pending') AS pending_count
            FROM books
            WHERE owner_id = ?
            ORDER BY id DESC
            """,
            (user["id"],),
        )
        .fetchall()
    )
    return render_template(
        "index.html",
        page_title="My shelf",
        mode="shelf",
        books=books,
    )


@app.route("/books/<int:book_id>/availability", methods=["POST"])
@login_required
def toggle_book(book_id):
    user = current_user()
    db = get_db()
    book = db.execute(
        "SELECT available FROM books WHERE id = ? AND owner_id = ?",
        (book_id, user["id"]),
    ).fetchone()
    if not book:
        abort(404)
    db.execute(
        "UPDATE books SET available = ? WHERE id = ? AND owner_id = ?",
        (0 if book["available"] else 1, book_id, user["id"]),
    )
    db.commit()
    flash("Listing updated.", "success")
    return redirect(url_for("my_books"))


@app.route("/requests")
@login_required
def exchange_requests():
    user = current_user()
    db = get_db()
    incoming = db.execute(
        """
        SELECT r.*, b.title, b.owner_name, u.name AS requester_display, u.email AS requester_email
        FROM exchange_requests r
        JOIN books b ON b.id = r.book_id
        LEFT JOIN users u ON u.id = r.requester_id
        WHERE b.owner_id = ?
        ORDER BY r.id DESC
        """,
        (user["id"],),
    ).fetchall()

    outgoing = db.execute(
        """
        SELECT r.*, b.title, b.owner_name, u.email AS owner_email
        FROM exchange_requests r
        JOIN books b ON b.id = r.book_id
        LEFT JOIN users u ON u.id = b.owner_id
        WHERE r.requester_id = ?
        ORDER BY r.id DESC
        """,
        (user["id"],),
    ).fetchall()

    return render_template(
        "requests.html",
        page_title="Exchange requests",
        incoming=incoming,
        outgoing=outgoing,
    )


@app.route("/requests/<int:request_id>/<action>", methods=["POST"])
@login_required
def update_request(request_id, action):
    if action not in ("accept", "decline"):
        abort(400)
    user = current_user()
    status = "Accepted" if action == "accept" else "Declined"
    db = get_db()

    item = db.execute(
        """
        SELECT r.id, r.book_id
        FROM exchange_requests r
        JOIN books b ON b.id = r.book_id
        WHERE r.id = ? AND b.owner_id = ? AND r.status = 'Pending'
        """,
        (request_id, user["id"]),
    ).fetchone()

    if not item:
        flash("This request is no longer pending.", "info")
        return redirect(url_for("exchange_requests"))

    db.execute(
        "UPDATE exchange_requests SET status = ? WHERE id = ?",
        (status, request_id),
    )
    if action == "accept":
        db.execute("UPDATE books SET available = 0 WHERE id = ?", (item["book_id"],))
        db.execute(
            """
            UPDATE exchange_requests
            SET status = 'Declined'
            WHERE book_id = ? AND id <> ? AND status = 'Pending'
            """,
            (item["book_id"], request_id),
        )
    db.commit()
    flash(f"Request {status.lower()}.", "success")
    return redirect(url_for("exchange_requests"))


@app.errorhandler(400)
@app.errorhandler(404)
def error_page(error):
    message = getattr(error, "description", "That page could not be found.")
    return (
        render_template(
            "index.html",
            page_title=str(error.code),
            mode="error",
            code=error.code,
            message=message,
        ),
        error.code,
    )


init_db()

if __name__ == "__main__":
    app.run(debug=True)