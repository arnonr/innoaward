import { test, expect, describe } from "bun:test";
import { hashPassword, verifyPassword } from "../src/lib/auth-utils";
import { generateTrackingCode } from "../src/lib/tracking";

describe("Core Auth & Tracking Utilities", () => {
  test("hashPassword produces valid Argon2id hash and verifyPassword matches correctly", async () => {
    const rawPassword = "InnovatorSecret2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeString();
    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$argon2id$")).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isMismatch = await verifyPassword("WrongPassword123!", hash);
    expect(isMismatch).toBe(false);
  });

  test("generateTrackingCode generates uppercase tracking code with correct prefix and 4 digits", () => {
    const code2569 = generateTrackingCode(2569);
    expect(code2569).toMatch(/^KMUTNB-2569-\d{4}$/);

    const codeDefault = generateTrackingCode();
    expect(codeDefault).toMatch(/^KMUTNB-2569-\d{4}$/);
  });
});
