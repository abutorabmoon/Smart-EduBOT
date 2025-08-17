"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProfileDrawer from "@/components/EditProfileDrawer";

export default function UserAvatarDropdown() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is inside a drawer overlay or content
      const target = event.target as Element;
      if (
        target.closest("[data-vaul-drawer]") ||
        target.closest("[data-vaul-overlay]")
      ) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (drawerOpen) {
          setDrawerOpen(false);
        } else {
          setDropdownOpen(false);
        }
      }
    }

    if (dropdownOpen || drawerOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dropdownOpen, drawerOpen]);

  const handleEditProfile = () => {
    setDropdownOpen(false); // Close dropdown first
    // Use setTimeout to ensure dropdown closes before drawer opens
    setTimeout(() => {
      setDrawerOpen(true);
    }, 0);
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    signOut();
  };

  if (!session?.user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt="Avatar"
            width={40}
            height={40}
            className="border-blue-600 border-2 rounded-full  cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          />
        ) : (
          <User
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="border-2 rounded-full text-text h-10 w-10  cursor-pointer"
          />
        )}

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-29 bg-stone-200 rounded-xl p-2 sm:p-4 z-[9999]">
            <div className="flex flex-col items-center space-x-4 mb-4 border-b border-blue-600 pb-2">
              <p className="font-medium text-text text-lg">
                {session.user.name || "User"}
              </p>
              <p className="text-sm text-text">{session.user.email}</p>
            </div>

            <Button
              variant="outline"
              className="w-full bg-blue-600 text-white mb-2"
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>

            <button
              onClick={handleSignOut}
              className="w-full py-2 mt-2 text-sm font-medium text-center bg-blue-600 rounded-md text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Separate drawer component */}
      <EditProfileDrawer isOpen={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
