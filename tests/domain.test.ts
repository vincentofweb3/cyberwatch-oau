import { describe, expect, it } from "vitest";
import { isValidStatusTransition, severityFromImpact } from "@/lib/domain";

describe("incident lifecycle", () => {
  it("allows documented forward transitions and no-op updates", () => {
    expect(isValidStatusTransition("NEW", "TRIAGED")).toBe(true);
    expect(isValidStatusTransition("INVESTIGATING", "CONTAINED")).toBe(true);
    expect(isValidStatusTransition("RESOLVED", "INVESTIGATING")).toBe(true);
    expect(isValidStatusTransition("TRIAGED", "TRIAGED")).toBe(true);
  });

  it("rejects invalid lifecycle jumps", () => {
    expect(isValidStatusTransition("NEW", "CLOSED")).toBe(false);
    expect(isValidStatusTransition("CONTAINED", "NEW")).toBe(false);
    expect(isValidStatusTransition("REJECTED", "CLOSED")).toBe(false);
  });

  it("maps reporter impact to initial severity", () => {
    expect(severityFromImpact("LOW")).toBe("LOW");
    expect(severityFromImpact("MODERATE")).toBe("MEDIUM");
    expect(severityFromImpact("HIGH")).toBe("HIGH");
    expect(severityFromImpact("CRITICAL")).toBe("CRITICAL");
  });
});
