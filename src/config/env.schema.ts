import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});
