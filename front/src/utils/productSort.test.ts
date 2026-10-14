import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareProducts } from "./productSort";

describe("compareProducts", () => {
  it("ordena por preço em ordem crescente numérica", () => {
    const products = [
      { name: "BBB - Produto de R$ 100,00", price: 100 },
      { name: "AAA - Produto de R$ 9,90", price: 9.9 },
      { name: "CCC - Produto de R$ 1.200,00", price: 1200 }
    ];

    const sorted = [...products].sort((a, b) => compareProducts(a, b, "price"));

    assert.deepEqual(sorted.map((item) => item.price), [9.9, 100, 1200]);
  });
});
