import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/Providers/SessionProvider";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import "./globals.css";
import "./loader.css";
import { getServerSession } from "next-auth";
export const metadata = {
  title: "Effective Learning Platform, AI-Powered Chatbot",
  description:
    "A platform for effective learning powered by effective prompts and AI.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}
