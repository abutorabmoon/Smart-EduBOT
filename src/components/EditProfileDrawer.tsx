"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
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
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditProfileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDrawer({
  isOpen,
  onOpenChange,
}: EditProfileDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  async function handleUpdateProfile() {
    startTransition(async () => {
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
          onOpenChange(false);
          toast.success("Profile updated successfully");
          // Reset form
          setGender("");
          setAge("");
          setSkillLevel("");
          setEducationLevel("");
        } else {
          toast.error("Failed to update profile");
        }
      } catch (error) {
        console.error("Update failed:", error);
        toast.error("An error occurred");
      }
    });
  }

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setGender("");
    setAge("");
    setSkillLevel("");
    setEducationLevel("");
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
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
              <Select onValueChange={setGender} value={gender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
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
              <label className="text-sm font-medium">Skill Level (C/C++)</label>
              <Select onValueChange={setSkillLevel} value={skillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectGroup>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Education Level</label>
              <Select onValueChange={setEducationLevel} value={educationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  <SelectGroup>
                    <SelectItem value="First Year">First Year</SelectItem>
                    <SelectItem value="Second Year">Second Year</SelectItem>
                    <SelectItem value="Third Year">Third Year</SelectItem>
                    <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DrawerFooter className="mt-4">
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
              onClick={handleClose}
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
