import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bigbproperties.ae" },
    update: {},
    create: {
      email: "admin@bigbproperties.ae",
      password: passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      phone: "+971507480180",
    },
  });

  const salesManager = await prisma.user.upsert({
    where: { email: "sales.manager@bigbproperties.ae" },
    update: {},
    create: {
      email: "sales.manager@bigbproperties.ae",
      password: passwordHash,
      name: "Fatima Al Suwaidi",
      role: "SALES_MANAGER",
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "agent1@bigbproperties.ae" },
    update: {},
    create: {
      email: "agent1@bigbproperties.ae",
      password: passwordHash,
      name: "Omar Siddiqui",
      role: "AGENT",
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "agent2@bigbproperties.ae" },
    update: {},
    create: {
      email: "agent2@bigbproperties.ae",
      password: passwordHash,
      name: "Priya Nair",
      role: "AGENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "finance@bigbproperties.ae" },
    update: {},
    create: {
      email: "finance@bigbproperties.ae",
      password: passwordHash,
      name: "Yusuf Rahman",
      role: "FINANCE",
    },
  });

  const developer = await prisma.company.upsert({
    where: { id: "seed-developer-emaar" },
    update: {},
    create: {
      id: "seed-developer-emaar",
      name: "Emaar Properties",
      website: "https://www.emaar.com",
      registrationStatus: "Registered",
      commissionTerms: "2% on booking, net of VAT",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-marina-gate" },
    update: {},
    create: {
      id: "seed-project-marina-gate",
      name: "Marina Gate",
      developerId: developer.id,
      masterCommunity: "Dubai Marina",
      location: "Dubai Marina, Dubai",
      status: "Under construction",
      startingPrice: 1800000,
      expectedCompletion: new Date("2027-12-31"),
      paymentPlan: "60/40 on completion",
      unitTypes: "1BR, 2BR, 3BR",
    },
  });

  const property1 = await prisma.property.upsert({
    where: { reference: "BGB-1001" },
    update: {},
    create: {
      reference: "BGB-1001",
      title: "2BR Marina Gate Tower 1",
      category: "OFF_PLAN",
      emirate: "Dubai",
      area: "Dubai Marina",
      building: "Marina Gate Tower 1",
      projectId: project.id,
      bedrooms: 2,
      bathrooms: 3,
      builtUpArea: 1250,
      price: 2350000,
      paymentPlan: "60/40",
      availability: "AVAILABLE",
      listingAgentId: agent1.id,
      publicationStatus: "PUBLISHED",
    },
  });

  await prisma.property.upsert({
    where: { reference: "BGB-1002" },
    update: {},
    create: {
      reference: "BGB-1002",
      title: "1BR Secondary Unit - JVC",
      category: "SECONDARY_SALE",
      emirate: "Dubai",
      area: "Jumeirah Village Circle",
      bedrooms: 1,
      bathrooms: 2,
      builtUpArea: 750,
      price: 950000,
      availability: "AVAILABLE",
      listingAgentId: agent2.id,
      publicationStatus: "PUBLISHED",
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: "seed-lead-1" },
    update: {},
    create: {
      id: "seed-lead-1",
      fullName: "Ahmed Khan",
      email: "ahmed.khan@example.com",
      phone: "+1 647 555 0192",
      country: "Canada",
      preferredLanguage: "English",
      source: "META_ADS",
      propertyInterest: "2BR off-plan Dubai Marina",
      budgetMin: 2000000,
      budgetMax: 2500000,
      currency: "AED",
      purpose: "CAPITAL_APPRECIATION",
      temperature: "HOT",
      stage: "QUALIFIED",
      assignedAgentId: agent1.id,
      assignedById: salesManager.id,
    },
  });

  const contact = await prisma.contact.upsert({
    where: { id: "seed-contact-1" },
    update: {},
    create: {
      id: "seed-contact-1",
      fullName: "Raj Mehta",
      email: "raj.mehta@example.com",
      phone: "+91 98200 11223",
      country: "India",
      preferredLanguage: "English",
      currency: "INR",
      budgetMin: 1500000,
      budgetMax: 2000000,
      propertyPreferences: "1-2BR, rental income focus",
      lifetimeValue: 0,
    },
  });

  const deal = await prisma.deal.upsert({
    where: { id: "seed-deal-1" },
    update: {},
    create: {
      id: "seed-deal-1",
      title: "2BR Marina Gate - Raj Mehta",
      type: "OFF_PLAN",
      stage: "NEGOTIATION",
      value: 2350000,
      currency: "AED",
      contactId: contact.id,
      propertyId: property1.id,
      agentId: agent1.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "seed-task-1" },
    update: {},
    create: {
      id: "seed-task-1",
      title: "Follow up on booking payment",
      priority: "HIGH",
      status: "PENDING",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assigneeId: agent1.id,
      dealId: deal.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "NOTE",
      content: "Client requested updated payment plan breakdown.",
      authorId: agent1.id,
      leadId: lead.id,
    },
  });

  console.log("Seed complete. Login with admin@bigbproperties.ae / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
