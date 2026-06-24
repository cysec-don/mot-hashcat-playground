import { db } from "../src/lib/db";

async function main() {
  const students = await db.student.findMany({ select: { id: true, fullName: true, isAdmin: true } });
  console.log("STUDENTS:", JSON.stringify(students, null, 2));

  const certs = await db.certificate.findMany();
  console.log("CERTIFICATES:", JSON.stringify(certs, null, 2));

  const cr = await db.challengeResult.groupBy({
    by: ["studentId"],
    _count: { _all: true },
  });
  console.log("CHALLENGE COUNTS:", JSON.stringify(cr, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
