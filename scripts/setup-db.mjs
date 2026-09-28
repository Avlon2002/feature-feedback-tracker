// Creates the tables in your Neon database. Run with: npm run db:setup
// Add --seed to also insert a few example features.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Create .env.local first (see .env.example).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

// The HTTP driver runs one statement per call, so split on semicolons.
const statements = schema
  .split(";")
  .map((s) => s.replace(/--.*$/gm, "").trim())
  .filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`Schema applied (${statements.length} statements).`);

if (process.argv.includes("--seed")) {
  const examples = [
    ["Leave Requests", "Apply for and approve annual/sick leave"],
    ["Payslips", "View and download monthly payslips"],
    ["Timesheets", "Log hours against projects"],
    ["Profile", "Personal details, emergency contacts"],
  ];
  for (const [name, description] of examples) {
    await sql.query(
      "INSERT INTO features (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
      [name, description],
    );
  }
  console.log("Example features added.");
}
