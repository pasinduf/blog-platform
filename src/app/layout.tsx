import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";


export const metadata: Metadata = {
  title: "Blog Hub",
  description: "Blog Hub",
};

const inter = Inter({ subsets: ["latin"] });

import { AuthProvider } from "@/lib/auth-context";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { prisma } from "@/lib/prisma";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getSession();

  let sessionWithProfile = session;
  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { profileImage: true, firstName: true, lastName: true }
    });

    if (dbUser) {
      sessionWithProfile = {
        ...session,
        profileImage: dbUser.profileImage,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName
      };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider session={sessionWithProfile}>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
