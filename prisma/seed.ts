import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123!", 12);
  const brokerPassword = await bcrypt.hash("broker123!", 12);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@crebrid.com" },
    update: {},
    create: {
      email: "admin@crebrid.com",
      name: "Crebrid Admin",
      password: adminPassword,
      role: "ADMIN",
      company: "Crebrid",
    },
  });

  // Processor user
  await prisma.user.upsert({
    where: { email: "processor@crebrid.com" },
    update: {},
    create: {
      email: "processor@crebrid.com",
      name: "Loan Processor",
      password: adminPassword,
      role: "PROCESSOR",
      company: "Crebrid",
    },
  });

  // Demo broker
  const broker = await prisma.user.upsert({
    where: { email: "broker@demo.com" },
    update: {},
    create: {
      email: "broker@demo.com",
      name: "John Smith",
      password: brokerPassword,
      role: "BROKER",
      company: "Smith Realty Investments",
      phone: "(214) 555-0100",
      nmls: "12345678",
    },
  });

  // Sample loan
  await prisma.loan.upsert({
    where: { loanNumber: "CRB-2025-00001" },
    update: {},
    create: {
      loanNumber: "CRB-2025-00001",
      loanType: "FIX_AND_FLIP",
      status: "DOCUMENTS_PENDING",
      brokerId: broker.id,
      propertyAddress: "4521 Elm Street",
      propertyCity: "Dallas",
      propertyState: "TX",
      propertyZip: "75204",
      propertyType: "Single Family Residence (SFR)",
      propertyCondition: "Poor - Major rehab needed",
      purchasePrice: 185000,
      rehabBudget: 65000,
      afterRepairValue: 340000,
      requestedLoanAmt: 200000,
      estimatedLtv: 200000 / 185000,
      estimatedLtc: 200000 / (185000 + 65000),
      borrowerName: "Maria Garcia",
      borrowerEmail: "maria@garcia-invest.com",
      borrowerPhone: "(214) 555-0200",
      borrowerEntity: "Garcia Investments LLC",
      borrowerExperience: "4-10 transactions",
      requestedRate: 10.5,
      requestedTerm: 12,
      exitStrategy: "Complete renovation and list for sale within 10 months",
      notes: "Strong borrower, 6 completed flips in DFW. Property needs full kitchen/bath renovation and new roof.",
    },
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Demo accounts:");
  console.log("  Admin:     admin@crebrid.com     / admin123!");
  console.log("  Processor: processor@crebrid.com / admin123!");
  console.log("  Broker:    broker@demo.com       / broker123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
