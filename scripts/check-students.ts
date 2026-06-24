// Quick check: list students and admin status
import { db } from "../src/lib/db";

async function main() {
  const students = await db.student.findMany();
  for (const s of students) {
    console.log(`${s.fullName} | isAdmin=${s.isAdmin} | xp=${s.xp}`);
  }
}

main().finally(() => process.exit(0));
