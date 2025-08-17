"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
export default function UserAvatarDropdown() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dropdownOpen]);

  async function handleUpdateProfile() {
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender,
          age: Number(age),
          skillLevel,
          educationLevel,
        }),
      });

      if (res.ok) {
        setDropdownOpen(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("An error occurred");
    }
  }

  // Close dropdown after sign out
  const handleSignOut = () => {
    setDropdownOpen(false);
    signOut();
  };
  if (!session?.user) return null;

  return (
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
        <div className="absolute right-0 mt-2 w-29 bg-stone-200 rounded-xl p-2 sm:p-4 z-[9999]  ">
          <div className="flex flex-col  items-center space-x-4 mb-4 border-b border-blue-600 pb-2">
            <p className="font-medium text-text text-lg">
              {session.user.name || "User"}
            </p>
            <p className="text-sm  text-text">{session.user.email}</p>
          </div>
          {/* Drawer for Edit Profile */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-blue-600 text-white mb-2 "
              >
                Edit Profile
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Edit Profile</DrawerTitle>
                <DrawerDescription>
                  Update your profile information below.
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 space-y-6">
                {/* Row 1: Gender & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Gender</label>
                    <Select onValueChange={setGender} defaultValue={gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black ">
                        <SelectGroup>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Age</label>
                    <Input
                      type="number"
                      placeholder="Enter age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-white text-black"
                    />
                  </div>
                </div>

                {/* Row 2: Skill Level & Education Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Skill Level (C/C++)
                    </label>
                    <Select
                      onValueChange={setSkillLevel}
                      defaultValue={skillLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black ">
                        <SelectGroup>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Education Level
                    </label>
                    <Select
                      onValueChange={setEducationLevel}
                      defaultValue={educationLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black ">
                        <SelectGroup>
                          <SelectItem value="First Year">First Year</SelectItem>
                          <SelectItem value="Second Year">
                            Second Year
                          </SelectItem>
                          <SelectItem value="Third Year">Third Year</SelectItem>
                          <SelectItem value="Fourth Year">
                            Fourth Year
                          </SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DrawerFooter className="mt-4 ">
                <Button
                  className="bg-blue-600 tracking-wider text-md text-white"
                  onClick={handleUpdateProfile}
                  disabled={isPending}
                  variant={"outline"}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>

                <DrawerClose asChild>
                  <Button
                    className="text-text tracking-wider text-md border-none"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <button
            onClick={() => signOut()}
            className="w-full py-2 mt-2 text-sm font-medium text-center bg-blue-600  rounded-md text-white"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
