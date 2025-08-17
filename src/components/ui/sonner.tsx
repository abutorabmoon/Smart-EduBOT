"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-blue-800 group-[.toaster]:text-gray-200 group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-400",
          actionButton: "group-[.toast]:bg-blue-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-blue-700 group-[.toast]:text-gray-300",
          error:
            "group-[.toaster]:bg-red-900/20 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-200",
        },
      }}
      {...props}
    />
  );
}
