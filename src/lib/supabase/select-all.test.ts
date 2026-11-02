import { describe, expect, it } from "vitest";
import { selectAll } from "./select-all";

describe("selectAll", () => {
  it("keeps requesting pages until one comes back short", async () => {
    const table = Array.from({ length: 2_500 }, (_, id) => ({ id }));
    const ranges: Array<[number, number]> = [];
    const result = await selectAll(async (from, to) => { ranges.push([from, to]); return { data: table.slice(from, to + 1), error: null }; });
    expect(result.data).toHaveLength(2_500);
    expect(ranges).toEqual([[0, 999], [1_000, 1_999], [2_000, 2_999]]);
  });
  it("makes one extra request when the table size is an exact multiple of the page size, and returns errors", async () => {
    const table = Array.from({ length: 2_000 }, (_, id) => ({ id }));
    let calls = 0;
    expect((await selectAll(async (from, to) => { calls += 1; return { data: table.slice(from, to + 1), error: null }; })).data).toHaveLength(2_000);
    expect(calls).toBe(3);
    expect(await selectAll(async () => ({ data: null, error: { message: "boom" } }))).toEqual({ data: null, error: { message: "boom" } });
  });
});
