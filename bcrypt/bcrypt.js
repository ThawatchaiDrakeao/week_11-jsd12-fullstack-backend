import bcrypt from "bcrypt";

async function hashPassword(plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  return hashedPassword;
}

async function verifyPassword(plainPassword, hashedPassword) {
  const isMatched = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatched;
}

const plainPassword = "gayray987";
const hashedPassword = await hashPassword(plainPassword);
const isMatched = await verifyPassword(plainPassword, hashedPassword);

console.log("Plain password:", plainPassword);
console.log("Hashed password:", hashedPassword);
console.log("Password matched:", isMatched);
