type SeedSafetyEnv = Partial<
  Pick<NodeJS.ProcessEnv, "ALLOW_DESTRUCTIVE_SEED" | "NODE_ENV">
>;

export function assertCanRunDestructiveSeed(
  env: SeedSafetyEnv = process.env
): void {
  if (env.NODE_ENV === "production") {
    throw new Error("Refusing to run destructive seed in production.");
  }

  if (env.ALLOW_DESTRUCTIVE_SEED !== "1") {
    throw new Error(
      "Set ALLOW_DESTRUCTIVE_SEED=1 to run the destructive dev seed."
    );
  }
}
