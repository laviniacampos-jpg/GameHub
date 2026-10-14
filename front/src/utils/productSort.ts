export interface ProductLike {
  name: string;
  price: number;
}

export function compareProducts(a: ProductLike, b: ProductLike, sort: string) {
  if (sort === "price") {
    return a.price - b.price;
  }

  return a.name.localeCompare(b.name);
}

export function sortProducts<T extends ProductLike>(items: T[], sort: string) {
  return [...items].sort((a, b) => compareProducts(a, b, sort));
}
