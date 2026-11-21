import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const result = envSchema.safeParse(process.env);

// A missing value must stop the app; running with a default secret could leak into production.
if (!result.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
