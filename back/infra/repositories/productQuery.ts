export interface ProductQueryFilters {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export function buildProductQuery(filters: ProductQueryFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const parameter = `$${values.length}`;
    conditions.push(`(name ILIKE ${parameter} OR description ILIKE ${parameter})`);
  }

  if (filters.category) {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = filters.sort === "price" ? "price ASC" : "name ASC";
  const limit = Math.max(Number(filters.limit ?? 100), 1);
  const offset = Math.max(Number(filters.offset ?? 0), 0);
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  return {
    sql: `SELECT id, name, description, category, price, stock FROM products ${where} ORDER BY ${orderBy} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values: [...values, limit, offset]
  };
}
