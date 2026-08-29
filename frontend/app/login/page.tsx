"use client";

import StarField from "@/components/trip-planner/StarField";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
      <StarField />
      <div className="nebula-1" />
      <div className="nebula-2" />

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4 py-8">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
