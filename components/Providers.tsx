"use client";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <div className="dark min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1e2020",
              color: "#f0efea",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-syne)"
            }
          }}
        />
      </div>
    </HeroUIProvider>
  );
}
