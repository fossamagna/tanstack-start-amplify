import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function AuthRedirect() {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      void navigate({ to: "/" });
    }
  }, [user, navigate]);

  return null;
}

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Authenticator>
        <AuthRedirect />
      </Authenticator>
    </div>
  );
}
