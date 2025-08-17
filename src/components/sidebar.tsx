"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogOut, SquarePen, SquarePlus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface SidebarProps {
  user: Session["user"];
}

interface SessionListItem {
  id: string;
  sessionId: string;
  title: string;
  preview: string;
  createdAt: Date;
}

export function MobileSidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="mt-3 ml-3 text-white shrink-0 bg-primary   border-2  shadow-2xl"
        >
          <span className="sr-only">Toggle navigation menu</span>
          <svg className="text-black  h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col bg-primary transition-all duration-300"
      >
        <SidebarContent user={user} onSessionClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function DesktopSidebar({ user }: SidebarProps) {
  return (
    <div className="hidden border-r bg-muted/40 md:block h-screen sticky top-0">
      <SidebarContent user={user} />
    </div>
  );
}

function SidebarContent({
  user,
  onSessionClick,
}: {
  user: Session["user"];
  onSessionClick?: () => void;
}) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const currentSessionId = pathname.split("/").pop() || "";
  const [editingSessionId, setEditingSessionId] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data: SessionListItem[] = await response.json();

      // Sort by createdAt descending (newest first)
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setSessions(sorted);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async (sessionId: string) => {
    try {
      await fetch("/api/session/update-title", {
        method: "POST",
        body: JSON.stringify({ sessionId, title: editTitle }),
      });
      setEditingSessionId("");
      fetchSessions();
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };
  const handleDelete = async (sessionId: string) => {
    try {
      await fetch("/api/session/delete", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      const updated = sessions.filter((s) => s.sessionId !== sessionId);
      setSessions(updated);

      if (sessionId === currentSessionId) {
        if (updated.length > 0) {
          router.push(`/chat/${updated[0].sessionId}`);
        } else {
          router.push("/chat"); // fallback
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewSession = async () => {
    try {
      const response = await fetch("/api/new-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to create session");

      const { sessionId } = await response.json();
      // console.log("🚀 Created Session ID:", sessionId);
      router.push(`/chat/${sessionId}`);
      router.refresh();
      setTimeout(() => {
        router.push(`/chat/${sessionId}`);
        onSessionClick?.(); // Close sidebar if on mobile
      }, 100);
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 ">
      {/* Header */}
      <div className="flex h-16 justify-center border-b px-4 ">
        <button
          onClick={() => {
            router.push("/chat");
            onSessionClick?.();
          }}
          className="flex items-center gap-2 font-bold"
        >
          <span className="text-lg font-bold tracking-wider text-text">
            Smart EduBot
          </span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm text-text font-medium">Your Sessions</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-black "
            onClick={handleNewSession}
          >
            <SquarePlus />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {loading ? (
            <div className="space-y-2 px-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group cursor-pointer relative flex flex-col gap-1 rounded-lg max-w-[310px] px-3 py-2 text-sm transition-all ${
                    session.sessionId === currentSessionId
                      ? "bg-blue-200 text-lg tracking-wider font-bold text-text border-b]"
                      : "hover:bg-blue-200 hover:text-black text-text border-b-4 border-transparent"
                  }`}
                  onClick={() => {
                    if (!editingSessionId) {
                      router.push(`/chat/${session.sessionId}`);
                      onSessionClick?.();
                    }
                  }}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between  w-full">
                      {editingSessionId === session.id ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(session.sessionId)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleSaveTitle(session.sessionId)
                          }
                          className="text-lg bg-transparent border-b border-gray-500 outline-none w-full"
                          autoFocus
                          onClick={(e) => e.stopPropagation()} // Prevent nav
                        />
                      ) : (
                        <div className="flex items-center gap-1 w-full  min-w-0">
                          {editingSessionId === session.id ? (
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleSaveTitle(session.sessionId)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleSaveTitle(session.sessionId)
                              }
                              className="text-sm bg-transparent border-b border-gray-500 outline-none flex-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()} // prevent navigation
                            />
                          ) : (
                            <>
                              <span className="font-medium truncate flex-1 max-w-[250px]">
                                {session.title}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSessionId(session.id);
                                  setEditTitle(session.title);
                                }}
                                title="Edit title"
                              >
                                <SquarePen className="w-4 h-4 text-muted-foreground hover:text-black" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(session.sessionId);
                                }}
                                title="Delete session"
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      )}

               
                    </div>
                  </div>
                  <span className=" text-text  truncate">
                    {session.preview}
                  </span>
                  <span className="text-text self-end">
                    {new Date(session.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                      timeZone: "Asia/Dhaka",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="mt-auto  shadow-2xl rounded-xl">
        <div className="flex items-center gap-3 bg-blue-200 rounded-xl p-5">
          {user?.image ? (
            <Image
              src={user?.image}
              alt="Avatar"
              width={40}
              height={40}
              className="border-blue-600 border-2 rounded-full  shadow cursor-pointer"
            />
          ) : (
            <User className="border-border border-2 rounded-full text-text h-10 w-10  shadow cursor-pointer" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-md text-text  font-medium truncate">
              {user?.name}
            </p>
            <p className="text-sm text-text  text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="h-8 w-8 text-text hover:bg-white hover:text-text"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  );
}
