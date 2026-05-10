import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// pre-baked hash used to keep timing constant when the user lookup misses
const DUMMY_HASH = bcrypt.hashSync("dummy-password-never-matched", SALT_ROUNDS);

export const passwordService = {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },

  // burn the same time as a real compare — call this when user is missing
  async dummyCompare(plain: string): Promise<void> {
    await bcrypt.compare(plain, DUMMY_HASH);
  },
};
