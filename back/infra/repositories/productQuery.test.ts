import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildProductQuery } from "./productQuery";

describe("buildProductQuery", () => {
  it("filtra pela coluna de categoria e não pelo nome", () => {
    const result = buildProductQuery({ category: "Acessórios" });

    assert.match(result.sql, /category = \$1/);
    assert.doesNotMatch(result.sql, /name = \$1/);
    assert.deepEqual(result.values.slice(0, 1), ["Acessórios"]);
    assert.equal(result.values.at(-2), 100);
    assert.equal(result.values.at(-1), 0);
  });

  it("ordena por preço com comparação numérica", () => {
    const result = buildProductQuery({ sort: "price" });
    assert.match(result.sql, /ORDER BY price ASC/);
  });
});
