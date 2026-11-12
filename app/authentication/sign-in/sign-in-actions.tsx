"use client";

import { Button } from "flowbite-react";
import Link from "next/link";

export function SignInActions() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Button
        as={Link}
        href="/api/auth/login"
        size="lg"
        color="blue"
        className="w-full sm:w-auto"
      >
        Continue to SLB sign-in
      </Button>
      <Button
        as={Link}
        href="/"
        color="light"
        size="lg"
        className="w-full sm:w-auto"
      >
        Back to dashboard
      </Button>
    </div>
  );
}
