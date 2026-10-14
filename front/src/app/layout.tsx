import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameHub | Gestão de produtos",
  description: "Catálogo didático para uma loja de games."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <AuthProvider>
            <AppHeader />
            <main>{children}</main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
