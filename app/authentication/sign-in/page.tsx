import { AppLogo } from "@/components/app-logo";
import { Card } from "flowbite-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { hasUserSession } from "@/lib/slb/has-user-session";
import { SignInActions } from "./sign-in-actions";

function displayAppName(): string {
  return (
    process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Edge Devices Dashboard"
  );
}

export default async function SignInPage() {
  const jar = await cookies();
  if (hasUserSession((name) => jar.get(name))) {
    redirect("/");
  }

  const appName = displayAppName();

  return (
    <div className="mx-auto flex flex-col items-center justify-center px-6 pt-8 md:h-screen">
      <Link
        href="/"
        className="mb-8 flex items-center justify-center text-2xl font-semibold lg:mb-10 dark:text-white"
      >
        <AppLogo size="md" className="mr-4" />
        <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
          {appName}
        </span>
      </Link>
      <Card
        horizontal
        imgAlt=""
        imgSrc="/images/authentication/login.jpg"
        className="w-full md:max-w-screen-lg"
        theme={{
          root: {
            children: "my-auto w-full gap-0 space-y-8 p-6 sm:p-8 lg:p-16",
          },
          img: {
            horizontal: {
              on: "hidden w-2/3 rounded-l-lg md:w-96 md:p-0 lg:block",
            },
          },
        }}
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
              Sign in with SLB
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Use your SLB corporate account. You will be redirected to CSI
              SAuth to approve access, then returned to this app.
            </p>
          </div>
          <SignInActions />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign-out is available from the dashboard header after you sign in.
          </p>
        </div>
      </Card>
    </div>
  );
}
