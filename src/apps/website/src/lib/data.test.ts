import { describe, test, expect } from "bun:test";
import { SponsorData, PreasidiumYearsData } from "../../../data";

describe("SponsorData", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(SponsorData)).toBe(true);
    expect(SponsorData.length).toBeGreaterThan(0);
  });

  test("every year entry has startYear, endYear, and a list", () => {
    for (const entry of SponsorData) {
      expect(typeof entry.startYear).toBe("number");
      expect(typeof entry.endYear).toBe("number");
      expect(entry.endYear).toBeGreaterThan(entry.startYear);
      expect(Array.isArray(entry.list)).toBe(true);
    }
  });

  test("every sponsor has required string fields", () => {
    for (const entry of SponsorData) {
      for (const sponsor of entry.list) {
        expect(typeof sponsor.name).toBe("string");
        expect(sponsor.name.length).toBeGreaterThan(0);
        expect(typeof sponsor.image).toBe("string");
        expect(typeof sponsor.url).toBe("string");
        expect(Array.isArray(sponsor.content)).toBe(true);
      }
    }
  });
});

describe("PreasidiumYearsData", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(PreasidiumYearsData)).toBe(true);
    expect(PreasidiumYearsData.length).toBeGreaterThan(0);
  });

  test("every year entry has id, startDate, endDate and a members list", () => {
    for (const year of PreasidiumYearsData) {
      expect(typeof year.id).toBe("number");
      expect(typeof year.startDate).toBe("string");
      expect(typeof year.endDate).toBe("string");
      expect(Array.isArray(year.PreasidiumLeden)).toBe(true);
    }
  });

  test("every member has firstName, lastName and at least one role", () => {
    for (const year of PreasidiumYearsData) {
      for (const lid of year.PreasidiumLeden) {
        expect(typeof lid.firstName).toBe("string");
        expect(lid.firstName.length).toBeGreaterThan(0);
        expect(typeof lid.lastName).toBe("string");
        expect(Array.isArray(lid.preasidiumRols)).toBe(true);
        expect(lid.preasidiumRols.length).toBeGreaterThan(0);
      }
    }
  });
});
