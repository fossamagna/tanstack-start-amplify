import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const CDK_PACKAGES = [
  "aws-cdk-lib",
  "aws-cdk",
  "constructs",
  "@aws-amplify/backend",
  "@aws-amplify/backend-cli",
];

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    // CDK packages are devDependencies used only for backend deployment (ampx pipeline-deploy).
    // They must not be analyzed during the SSR build to prevent excessive memory usage.
    external: CDK_PACKAGES,
  },
  plugins: [
    // @ts-expect-error awsAmplify is a valid nitro preset option but missing from NitroConfig types
    nitro({ config: { preset: "aws_amplify", awsAmplify: { runtime: "nodejs24.x" } } }),
    tailwindcss(),
    tanstackStart({
      router: {
        quoteStyle: "double",
        semicolons: true,
      },
    }),
    viteReact(),
  ],
});

export default config;
