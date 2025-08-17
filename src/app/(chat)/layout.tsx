"use client";

import { MobileSidebar } from "@/components/sidebar";
import UserAvatarDropdown from "@/components/UserAvatarDropdown";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <div className="absolute top-4 right-8  z-[9999] shadow-2xl">
        <UserAvatarDropdown />
      </div>
      {/* Mobile sidebar button only */}
      <div className="fixed top-2 left-2 z-50 shadow-2xl">
        {session?.user && <MobileSidebar user={session.user} />}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
