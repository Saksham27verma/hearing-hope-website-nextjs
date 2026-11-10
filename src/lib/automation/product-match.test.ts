import { describe, expect, it } from "vitest";
import { suggestProduct } from "./product-match";

const product = (name: string) => ({ id: name, name, slug: name.toLowerCase().replaceAll(" ", "-") });
const catalog = [
  product("Widex Moment MBB2 330"),
  product("Widex Moment MBB2 440"),
  product("Widex Magnify MBR3D 100"),
  product("Widex Magnify MBR3D 100 Kit"),
  product("Widex Moment M CIC M 330"),
  product("Widex Moment M CIC 330"),
];

describe("suggestProduct", () => {
  it("matches a product whose every word is in the title", () => {
    expect(suggestProduct({ title: "Widex Moment MBB2 330 BTE Hearing Aid Review", slug: "widex-moment-mbb2-330-bte-hearing-aid-ear" }, catalog)?.name).toBe("Widex Moment MBB2 330");
  });

  it("prefers the more specific name, using words from the slug too", () => {
    expect(suggestProduct({ title: "Widex Magnify MBR3D 100 Rechargeable BTE Guide", slug: "widex-magnify-kit-mbr3d-100-rechargeable-bte" }, catalog)?.name).toBe("Widex Magnify MBR3D 100 Kit");
    expect(suggestProduct({ title: "Widex Magnify MBR3D 100 Rechargeable BTE Guide", slug: "widex-magnify-mbr3d-100" }, catalog)?.name).toBe("Widex Magnify MBR3D 100");
  });

  it("does not guess when two products match equally well", () => {
    expect(suggestProduct({ title: "Widex Moment M CIC M 330 Hearing Aid", slug: "widex-moment-m-cic-m-330" }, catalog)).toBeNull();
  });

  it("does not match a different model or a product missing from the catalog", () => {
    expect(suggestProduct({ title: "Widex Moment MBB2 220 Review", slug: "widex-moment-mbb2-220" }, catalog)).toBeNull();
    expect(suggestProduct({ title: "Starkey Genesis AI 16 RIC Overview", slug: "starkey-genesis-ai-16" }, catalog)).toBeNull();
  });
});
