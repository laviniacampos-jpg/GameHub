import { db } from "../database/db";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";
import type { Product } from "../../src/model/Product";
import { buildProductQuery } from "./productQuery";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock)
  };
}

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<Product[]> {
    const { sql, values } = buildProductQuery({
      search: filters.search,
      category: filters.category,
      sort: filters.sort,
      limit: filters.limit,
      offset: filters.offset
    });

    const result = await db.query(sql, values);
    return result.rows.map(mapProduct);
  }

  async create(input: CreateProductDTO): Promise<Product> {
    const result = await db.query(
      `INSERT INTO products (name, description, category, price, stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, category, price, stock`,
      [input.name, input.description, input.category, input.price, input.stock]
    );
    return mapProduct(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
  }

  async getDashboard() {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS low_stock,
        COALESCE(SUM(price * stock), 0) AS inventory_value,
        COUNT(DISTINCT category) AS categories
      FROM products
    `);

    const row = result.rows[0];
    return {
      totalProducts: Number(row.total_products),
      lowStock: Number(row.low_stock),
      inventoryValue: Number(row.inventory_value),
      categories: Number(row.categories)
    };
  }
}
