"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState } from "@/components/ErrorState";
import type { ProductDTO } from "@/dto/ProductDTO";
import { createProduct, deleteProduct, getProducts } from "@/fetch/productRequests";
import { sortProducts } from "@/utils/productSort";
import { useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 80;

function ProductSkeletonList() {
  return (
    <div className="product-grid" aria-live="polite" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <article key={index} className="product-card" style={{ opacity: 0.7 }}>
          <div className="product-card__top">
            <span className="category-pill" style={{ background: "#2a2a2a", color: "transparent" }}>loading</span>
            <span className="stock" style={{ background: "#2a2a2a", color: "transparent" }}>loading</span>
          </div>
          <h2 style={{ background: "#2a2a2a", color: "transparent" }}>loading</h2>
          <p style={{ background: "#2a2a2a", color: "transparent" }}>loading</p>
          <div className="product-card__bottom">
            <strong style={{ background: "#2a2a2a", color: "transparent" }}>loading</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const loadProducts = useCallback(async (nextOffset = 0, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const result = await getProducts({
        search,
        category,
        sort,
        limit: PAGE_SIZE,
        offset: nextOffset
      });

      setProducts((currentProducts) => append ? [...currentProducts, ...result] : result);
      setHasMore(result.length === PAGE_SIZE);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadProducts(0, false);
  }, [loadProducts]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setCreating(true);
    setCreateMessage("");
    setError("");

    try {
      const createdProduct = await createProduct({
        name: String(data.get("name") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        category: String(data.get("category") ?? "Jogos") as ProductDTO["category"],
        price: Number(data.get("price")),
        stock: Number(data.get("stock"))
      });

      setProducts((currentProducts) => [createdProduct, ...currentProducts].slice(0, PAGE_SIZE));
      setCreateMessage("Produto cadastrado. Catálogo atualizado.");
      form.reset();
      setHasMore(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível cadastrar o produto.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir este produto?")) return;

    try {
      await deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir.");
    }
  }

  async function handleLoadMore() {
    await loadProducts(products.length, true);
  }

  const visibleProducts = sortProducts(products, sort);

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h1>Produtos</h1>
          <p>Pesquise e consulte o estoque da loja.</p>
        </div>
        <span className="result-count">{visibleProducts.length} produtos • carregados</span>
      </div>

      {isAdmin && (
        <form className="product-create-form" onSubmit={handleCreate}>
          <h2>Cadastrar produto</h2>
          <div className="product-create-form__grid">
            <label>Nome<input name="name" required minLength={2} maxLength={100} placeholder="Nome do produto" /></label>
            <label>Descrição<input name="description" required minLength={3} maxLength={500} placeholder="Descrição curta" /></label>
            <label>Categoria<select name="category" defaultValue="Jogos"><option value="Consoles">Consoles</option><option value="Jogos">Jogos</option><option value="Acessórios">Acessórios</option></select></label>
            <label>Preço<input name="price" type="number" min="0.01" step="0.01" required defaultValue="199.90" /></label>
            <label>Estoque<input name="stock" type="number" min="0" step="1" required defaultValue="10" /></label>
            <button className="button" disabled={creating}>{creating ? "Cadastrando..." : "Cadastrar produto"}</button>
          </div>
          {createMessage && <p className="form-success" role="status">{createMessage}</p>}
        </form>
      )}

      <div className="filters">
        <label>
          Buscar
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nome do produto..." />
        </label>
        <label>
          Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todas</option>
            <option value="Consoles">Consoles</option>
            <option value="Jogos">Jogos</option>
            <option value="Acessórios">Acessórios</option>
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Nome</option>
            <option value="price">Preço</option>
          </select>
        </label>
      </div>

      {loading ? <ProductSkeletonList /> : error ? <ErrorState message={error} onRetry={() => loadProducts(0, false)} /> : (
        <>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDelete} />
            ))}
            {visibleProducts.length === 0 && (
              <div>
                <p>Nenhum produto encontrado.</p>
                <button className="button button--secondary" onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setCategory("");
                  setSort("name");
                }}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {hasMore && visibleProducts.length > 0 && (
            <div className="load-more-wrapper">
              <button className="button button--secondary" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductsPage;
