require("dotenv").config();

const prisma = require("./config/prisma.js");

async function main() {
  const users = await prisma.user.findMany();

  console.log(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());