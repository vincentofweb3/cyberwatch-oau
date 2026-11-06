import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCharacters(length: number) {
  const bytes = randomBytes(length);
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += REFERENCE_ALPHABET[bytes[index] % REFERENCE_ALPHABET.length];
  }

  return result;
}

export function createId() {
  return randomUUID();
}

export function createReferenceCode(now = new Date()) {
  return `CW-${now.getUTCFullYear()}-${randomCharacters(7)}`;
}

export function createTrackingKey() {
  const raw = randomCharacters(16);
  return raw.match(/.{1,4}/g)?.join("-") ?? raw;
}

export function hashTrackingKey(key: string) {
  return createHash("sha256").update(normalizeTrackingKey(key)).digest("hex");
}

export function verifyTrackingKey(key: string, expectedHash: string) {
  const actual = Buffer.from(hashTrackingKey(key), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function normalizeTrackingKey(key: string) {
  return key.trim().toUpperCase();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}
