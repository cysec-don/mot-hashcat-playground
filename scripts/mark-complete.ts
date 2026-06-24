// Quick script to mark all challenges complete for the test student
import { db } from "../src/lib/db";
import { CHALLENGES } from "../src/lib/challenges-data";

async function main() {
  const student = await db.student.findFirst({
    where: { fullName: "Pentest Agent Eight" },
  });
  if (!student) {
    console.error("Student not found");
    process.exit(1);
  }
  console.log(`Found student: ${student.fullName} (${student.id})`);

  for (const c of CHALLENGES) {
    const existing = await db.challengeResult.findUnique({
      where: {
        studentId_challengeId: {
          studentId: student.id,
          challengeId: c.id,
        },
      },
    });
    if (!existing) {
      await db.challengeResult.create({
        data: {
          studentId: student.id,
          challengeId: c.id,
          attempts: 1,
          hintsUsed: 0,
          completed: true,
          xpEarned: c.xp,
          completedAt: new Date(),
        },
      });
      await db.student.update({
        where: { id: student.id },
        data: { xp: { increment: c.xp } },
      });
    } else if (!existing.completed) {
      await db.challengeResult.update({
        where: { id: existing.id },
        data: {
          completed: true,
          xpEarned: existing.xpEarned + c.xp,
          completedAt: new Date(),
        },
      });
      await db.student.update({
        where: { id: student.id },
        data: { xp: { increment: c.xp } },
      });
    }
  }

  const fresh = await db.student.findUnique({ where: { id: student.id } });
  console.log(`Student XP now: ${fresh?.xp}`);
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
