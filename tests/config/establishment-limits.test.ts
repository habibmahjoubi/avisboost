import { describe, it, expect } from "vitest";
import {
  getEstablishmentLimit,
  getMembersPerEstablishment,
  ESTABLISHMENT_LIMIT,
  MEMBERS_PER_ESTABLISHMENT,
} from "@/config/plan-features";

describe("ESTABLISHMENT_LIMIT constants", () => {
  it("free plan allows 1 establishment", () => {
    expect(ESTABLISHMENT_LIMIT.free).toBe(1);
  });

  it("pro plan allows 5 establishments", () => {
    expect(ESTABLISHMENT_LIMIT.pro).toBe(5);
  });

  it("business plan allows 50 establishments", () => {
    expect(ESTABLISHMENT_LIMIT.business).toBe(50);
  });
});

describe("MEMBERS_PER_ESTABLISHMENT constants", () => {
  it("free plan allows 1 member", () => {
    expect(MEMBERS_PER_ESTABLISHMENT.free).toBe(1);
  });

  it("pro plan allows 3 members", () => {
    expect(MEMBERS_PER_ESTABLISHMENT.pro).toBe(3);
  });

  it("business plan allows 999 members", () => {
    expect(MEMBERS_PER_ESTABLISHMENT.business).toBe(999);
  });
});

describe("getEstablishmentLimit", () => {
  it("returns correct limit for each plan", () => {
    expect(getEstablishmentLimit("free")).toBe(1);
    expect(getEstablishmentLimit("pro")).toBe(5);
    expect(getEstablishmentLimit("business")).toBe(50);
  });

  it("returns 1 for unknown plan", () => {
    expect(getEstablishmentLimit("unknown")).toBe(1);
    expect(getEstablishmentLimit("")).toBe(1);
  });
});

describe("getMembersPerEstablishment", () => {
  it("returns correct limit for each plan", () => {
    expect(getMembersPerEstablishment("free")).toBe(1);
    expect(getMembersPerEstablishment("pro")).toBe(3);
    expect(getMembersPerEstablishment("business")).toBe(999);
  });

  it("returns 1 for unknown plan", () => {
    expect(getMembersPerEstablishment("unknown")).toBe(1);
    expect(getMembersPerEstablishment("")).toBe(1);
  });
});
