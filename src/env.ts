import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(config());

const EnvSchema = z.object({
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default result.data;
