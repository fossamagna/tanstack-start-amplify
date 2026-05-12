import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fetchUserAttributes } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "../lib/amplifyServerUtils";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await runWithAmplifyServerContext({
      operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });
  } catch {
    throw redirect({ to: "/login" });
  }
});

export const Route = createFileRoute("/_protected")({
  loader: () => checkAuth(),
  component: () => <Outlet />,
});
