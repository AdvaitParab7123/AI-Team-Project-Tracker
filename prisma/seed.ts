import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Default password for all team members
  const defaultPassword = await hash("tracker123", 12);

  // Upsert team members (won't duplicate if run multiple times)
  const advait = await prisma.user.upsert({
    where: { email: "advait.parab@netcorecloud.com" },
    update: { password: defaultPassword },
    create: {
      name: "Advait Parab",
      email: "advait.parab@netcorecloud.com",
      password: defaultPassword,
      role: "admin",
    },
  });

  const ganesh = await prisma.user.upsert({
    where: { email: "ganesh.rai@netcorecloud.com" },
    update: { password: defaultPassword },
    create: {
      name: "Ganesh Rai",
      email: "ganesh.rai@netcorecloud.com",
      password: defaultPassword,
      role: "admin",
    },
  });

  const tanishq = await prisma.user.upsert({
    where: { email: "tanishq.juneja@netcorecloud.com" },
    update: { password: defaultPassword },
    create: {
      name: "Tanishq Juneja",
      email: "tanishq.juneja@netcorecloud.com",
      password: defaultPassword,
      role: "admin",
    },
  });

  console.log("Team members seeded:", {
    advait: advait.email,
    ganesh: ganesh.email,
    tanishq: tanishq.email,
  });

  // Create a sample project if none exist
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    const project = await prisma.project.create({
      data: {
        name: "AI Team Project Tracker",
        description: "Track all AI adoption team projects and tasks",
        type: "internal",
        ownerId: advait.id,
        columns: {
          create: [
            { name: "Backlog", position: 0 },
            { name: "To Do", position: 1 },
            { name: "In Progress", position: 2 },
            { name: "Review", position: 3 },
            { name: "Done", position: 4 },
          ],
        },
        labels: {
          create: [
            { name: "Bug", color: "#ef4444" },
            { name: "Feature", color: "#3b82f6" },
            { name: "Enhancement", color: "#10b981" },
            { name: "Documentation", color: "#f59e0b" },
          ],
        },
      },
    });

    console.log("Sample project created:", project.name);
  }

  console.log("Seeding complete!");
  console.log("\nLogin credentials for all team members:");
  console.log("  Password: tracker123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
