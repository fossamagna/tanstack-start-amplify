import { createFileRoute } from "@tanstack/react-router";
import { Authenticator } from "@aws-amplify/ui-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator />
      </div>
    </div>
  );
}
