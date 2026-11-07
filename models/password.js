import bcryptjs from "bcryptjs";

function getNumberOfRounds() {
  return process.env.NODE_ENV == "production" ? 14 : 1;
}

async function hash(password) {
  const ROUNDS = getNumberOfRounds();

  return await bcryptjs.hash(password, ROUNDS);
}

async function compare(password, storedPassword) {
  return await bcryptjs.compare(password, storedPassword);
}

const password = { hash, compare };

export default password;
