const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// 1. Get email from command line args
const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address.");
  console.error("Example: node scripts/make-admin.js equitymitra.support@gmail.com");
  process.exit(1);
}

// 2. Open the production SQLite database using exactly the same logic
// In Railway, DATA_DIR is used. Fallback to the local data folder.
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "equitymitra.db");

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}. Ensure the app is running and the database exists.`);
  process.exit(1);
}

try {
  const db = new Database(DB_PATH);

  // 3. Run the SQL update
  const stmt = db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?");
  const info = stmt.run(email);

  // 4. Check if the user was found and updated
  if (info.changes === 0) {
    console.log("User not found");
  } else {
    // 5. Print success
    console.log("Admin access granted.");
  }

  db.close();
} catch (error) {
  console.error("Database error:", error.message);
  process.exit(1);
}
