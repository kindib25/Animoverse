"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { OnboardingLayout } from "@/app/onboarding/page";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Loader2, PenLine } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useNewInfiniteGroups } from "@/lib/hooks/use-groups";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/appwrite/database";
import { clientGetCurrentUser } from "@/lib/appwrite/client-auth";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayedGroups, setDisplayedGroups] = useState<any[]>([]);
  const router = useRouter();

  // ✅ Extract subjects and studyPreferences from profile
  const subjects = useMemo(() => profile?.subjects ?? [], [profile]);
  const studyPreferences = useMemo(
    () => profile?.studyPreferences ?? [],
    [profile]
  );

  // ✅ Updated hook call to include studyPreferences
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNewInfiniteGroups(subjects, studyPreferences, 6);

  // ✅ Flatten pages
  const groups = useMemo(
    () => data?.pages.flatMap((page) => page.groups) ?? [],
    [data]
  );

  // ✅ Load profile
  useEffect(() => {
    async function loadProfile() {
      const userResult = await clientGetCurrentUser();
      if (!userResult.success || !userResult.user) return router.push("/login");

      const profileResult = await getUserProfile(userResult.user.$id);
      if (profileResult.success) setProfile(profileResult.profile);
    }
    loadProfile();
  }, [router]);

  // ✅ Update displayed groups when data changes
  useEffect(() => {
    if (groups.length > 0 && displayedGroups.length === 0) {
      setDisplayedGroups(groups);
    }
  }, [groups]);

  // ✅ Infinite scroll observer (looping logic)
  useEffect(() => {
    if (!loaderRef.current) return;
    const node = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingNextPage) {
          if (hasNextPage) {
            fetchNextPage();
          } else if (displayedGroups.length > 0) {
            // ✅ Loop: duplicate list to continue scrolling infinitely
            setDisplayedGroups((prev) => [...prev, ...groups]);
          }
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, groups, displayedGroups]);

  const handleClick = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-white h-20 w-20" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <div className="flex h-screen bg-[url('/bgDefault.svg')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="float-end">
          <Button className="shad-button_showAll" onClick={handleClick}>
            Skip
          </Button>
        </div>
        <div className="pt-10 text-black md:px-50">
          <div className="flex justify-center items-center text-center mt-6 md:mt-0">
            <h1 className="text-2xl font-mono mb-6">
              Hey{" "}
              <span className="font-bold">
                {profile?.name?.split(" ")[0] || "there"}
              </span>
              , you've matched with some amazing study groups!
              <br />
              <span className="text-base text-muted-foreground">
                Select a group to join and get started.
              </span>
            </h1>
          </div>

          {displayedGroups.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-2 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No groups yet</h3>
              <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                {profile
                  ? `No groups found for your subjects or study preferences. Try exploring others.`
                  : "Start your learning journey by creating your first study group or explore existing ones."}
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer bg-accent py-8 text-black hover:bg-green hover:text-black transition font-mono"
                >
                  <Link href="/dashboard/create-group">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Group
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer py-8 gap-2 text-white hover:bg-green hover:text-black transition font-mono"
                >
                  <Link href="/dashboard/explore">Explore Groups</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-1">
                <AnimatePresence>
                  {displayedGroups.map((group, index) => (
                    <motion.div
                      key={`${group.$id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href={`/dashboard/groups/${group.$id}`}
                        className="block rounded-lg border border-transparent bg-gradient-to-br from-[#4ec66a] to-green p-6 transition-colors hover:border-black"
                      >
                        <div className="relative text-center space-y-4">
                          <div className="absolute top-4 left-4 flex items-center justify-start gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            <p className="font-bold">
                              {group.memberCount}/{group.maxMembers}
                            </p>
                          </div>
                          <div className="absolute top-4 right-4 text-sm">
                            {group.schedule}
                          </div>
                          <div className="flex justify-center pt-15">
                            <img
                              src={group.imageUrl || "/placeholder.svg"}
                              alt={group.name}
                              className="h-32 w-32 object-contain rounded-full"
                            />
                          </div>
                          <h3 className="font-semibold text-2xl">
                            {group.name}
                          </h3>
                          <p className="text-sm px-10 md:px-30">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-center gap-3 flex-col md:flex-row">
                            <Badge className="text-sm" variant={"secondary"}>
                              {group.subject}
                            </Badge>

                            <Badge
                              className="text-black border-black text-sm"
                              variant={"outline"}
                            >
                              {Array.isArray(group.studyPreferences) &&
                              group.studyPreferences.length === 2
                                ? group.studyPreferences.join(" / ")
                                : group.studyPreferences}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 justify-center">
                            <PenLine className="h-4 w-4" />
                            <span>{group.creator?.name || "Unknown"}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div
                ref={loaderRef}
                className="py-10 text-center text-muted-foreground"
              >
                {isFetchingNextPage ? (
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                    <span>Loading more groups...</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    🎉 You’ve reached the end — looping again!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
