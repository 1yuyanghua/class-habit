"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initializeData, sessionStore } from "@/lib/store";
import { DataInitializer } from "@/components/data-initializer";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initializeData();
    const session = sessionStore.get();
    if (!session || session.role !== "teacher") {
      router.push("/login?type=teacher");
      return;
    }
    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <DataInitializer>{children}</DataInitializer>;
}
