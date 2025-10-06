import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { checkAuthStatus } from "@/store/slices/authSlice";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AppContent
          router={router}
          Component={Component}
          pageProps={pageProps}
        />
        <Toaster position="top-right" />
      </LanguageProvider>
    </Provider>
  );
}

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    // Dispatch the checkAuthStatus action when the app loads
    store
      .dispatch(checkAuthStatus())
      .unwrap()
      .catch(() => {
        // If not authenticated and trying to access a protected route, redirect to login
        if (!isPublicRoute) {
          router.push("/login");
        }
      });
  }, [router, isPublicRoute]);

  return <Component {...pageProps} />;
}
