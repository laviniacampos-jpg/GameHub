import type { AppProps } from "next/app";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppHeader />
      <main>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}