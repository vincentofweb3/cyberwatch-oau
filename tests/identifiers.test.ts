import { describe, expect, it } from "vitest";
import {
  createReferenceCode,
  createTrackingKey,
  hashTrackingKey,
  normalizeTrackingKey,
  slugify,
  verifyTrackingKey,
} from "@/lib/identifiers";

describe("privacy-preserving identifiers", () => {
  it("creates non-sequential references in the documented format", () => {
    const reference = createReferenceCode(new Date("2026-01-01T00:00:00Z"));
    expect(reference).toMatch(/^CW-2026-[A-HJ-NP-Z2-9]{7}$/);
  });

  it("creates and verifies a one-time tracking key without storing the key", () => {
    const key = createTrackingKey();
    const hash = hashTrackingKey(key);
    expect(key).toMatch(/^[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}$/);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain(key);
    expect(verifyTrackingKey(key.toLowerCase(), hash)).toBe(true);
    expect(verifyTrackingKey("AAAA-BBBB-CCCC-DDDD", hash)).toBe(false);
  });

  it("normalizes keys and safe alert slugs", () => {
    expect(normalizeTrackingKey("  abcd-efgh-jkmn-pqrs ")).toBe("ABCD-EFGH-JKMN-PQRS");
    expect(slugify("Fake Clearance & Fee Alert!")).toBe("fake-clearance-fee-alert");
  });
});
