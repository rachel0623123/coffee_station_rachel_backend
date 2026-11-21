import { describe, it, expect } from "vitest";
import { envSchema } from "../src/config/env";

const validEnv = {
  NODE_ENV: "development",
  PORT: "8000",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
};
describe("envSchema", () => {
  it("accepts a valid config", () => {
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it("rejects PORT above 65535", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: "70000" });
    expect(result.success).toBe(false);
  });

  it("accepts PORT 65535 (top edge)", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: "65535" });
    expect(result.success).toBe(true);
  });

  it("rejects PORT 0", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects a PORT that is not a number", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown NODE_ENV", () => {
    const result = envSchema.safeParse({ ...validEnv, NODE_ENV: "dev" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-postgres DATABASE_URL", () => {
    const result = envSchema.safeParse({ ...validEnv, DATABASE_URL: "mysql://u:p@localhost/db" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing DATABASE_URL", () => {
    const result = envSchema.safeParse({ ...validEnv, DATABASE_URL: undefined });
    expect(result.success).toBe(false);
  });

  it("uses 8000 when PORT is missing", () => {
    const result = envSchema.safeParse({ ...validEnv, PORT: undefined });
    expect(result.success).toBe(true);
    expect(result.data?.PORT).toBe(8000);
  });
});
