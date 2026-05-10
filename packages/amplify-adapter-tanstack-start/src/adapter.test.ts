import {
  type AmplifyServer,
  type CookieStorage,
  createAWSCredentialsAndIdentityIdProvider,
  createKeyValueStorageFromCookieStorageAdapter,
  createUserPoolsTokenProvider,
  runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";
import { deleteCookie, getCookie, getCookies, setCookie } from "@tanstack/react-start/server";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createServerRunner } from "./adapter.ts";

vi.mock("@tanstack/react-start/server", () => ({
  getCookies: vi.fn(),
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

vi.mock("aws-amplify/adapter-core", () => ({
  runWithAmplifyServerContext: vi.fn(),
  createKeyValueStorageFromCookieStorageAdapter: vi.fn(),
  createUserPoolsTokenProvider: vi.fn(),
  createAWSCredentialsAndIdentityIdProvider: vi.fn(),
}));

vi.mock("aws-amplify/utils", () => ({
  parseAmplifyConfig: vi.fn(),
}));

const mockAuthConfig = {
  Auth: { Cognito: { userPoolId: "us-east-1_test", userPoolClientId: "test-client-id" } },
};

describe("createServerRunner", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("runWithAmplifyServerContext", () => {
    test("calls operation and returns its result", async () => {
      vi.mocked(parseAmplifyConfig).mockReturnValue({});
      vi.mocked(runWithAmplifyServerContextCore).mockImplementation(async (_, __, op) =>
        op({} as AmplifyServer.ContextSpec),
      );

      const { runWithAmplifyServerContext } = createServerRunner({ config: {} as any });
      const result = await runWithAmplifyServerContext({
        operation: async () => "expected-result",
      });

      expect(result).toBe("expected-result");
    });

    test("does not set up cookie storage when Auth is not configured", async () => {
      vi.mocked(parseAmplifyConfig).mockReturnValue({});
      vi.mocked(runWithAmplifyServerContextCore).mockResolvedValue(undefined);

      const { runWithAmplifyServerContext } = createServerRunner({ config: {} as any });
      await runWithAmplifyServerContext({ operation: vi.fn() });

      expect(createKeyValueStorageFromCookieStorageAdapter).not.toHaveBeenCalled();
    });
  });

  describe("cookie storage adapter (with Auth)", () => {
    let capturedAdapter: CookieStorage.Adapter;

    beforeEach(async () => {
      vi.mocked(parseAmplifyConfig).mockReturnValue(mockAuthConfig);
      vi.mocked(createKeyValueStorageFromCookieStorageAdapter).mockImplementation((adapter) => {
        capturedAdapter = adapter;
        return {} as any;
      });
      vi.mocked(createUserPoolsTokenProvider).mockReturnValue({} as any);
      vi.mocked(createAWSCredentialsAndIdentityIdProvider).mockReturnValue({} as any);
      vi.mocked(runWithAmplifyServerContextCore).mockImplementation(async (_, __, op) =>
        op({} as AmplifyServer.ContextSpec),
      );

      const { runWithAmplifyServerContext } = createServerRunner({ config: {} as any });
      await runWithAmplifyServerContext({ operation: vi.fn() });
    });

    describe("getAll", () => {
      test("returns all cookies from getCookies()", () => {
        vi.mocked(getCookies).mockReturnValue({
          "CognitoIdentityServiceProvider.xxx.idToken": "token-value",
          "other-cookie": "other-value",
        });

        expect(capturedAdapter.getAll()).toEqual([
          { name: "CognitoIdentityServiceProvider.xxx.idToken", value: "token-value" },
          { name: "other-cookie", value: "other-value" },
        ]);
      });

      test("returns empty array when no cookies exist", () => {
        vi.mocked(getCookies).mockReturnValue({});

        expect(capturedAdapter.getAll()).toEqual([]);
      });
    });

    describe("get", () => {
      test("returns cookie when found", () => {
        vi.mocked(getCookie).mockReturnValue("token-value");

        const result = capturedAdapter.get("CognitoIdentityServiceProvider.xxx.idToken");

        expect(getCookie).toHaveBeenCalledWith("CognitoIdentityServiceProvider.xxx.idToken");
        expect(result).toEqual({
          name: "CognitoIdentityServiceProvider.xxx.idToken",
          value: "token-value",
        });
      });

      test("returns undefined when cookie is not found", () => {
        vi.mocked(getCookie).mockReturnValue(undefined);

        expect(capturedAdapter.get("nonexistent")).toBeUndefined();
      });

      test("encodes cookie name before lookup", () => {
        vi.mocked(getCookie).mockReturnValue("value");

        capturedAdapter.get("cookie name");

        expect(getCookie).toHaveBeenCalledWith("cookie%20name");
      });
    });

    describe("set", () => {
      test("calls setCookie with encoded name, value and options", () => {
        const options = { secure: true, httpOnly: true, path: "/" };

        capturedAdapter.set("cookie name", "value", options);

        expect(setCookie).toHaveBeenCalledWith("cookie%20name", "value", options);
      });

      test("calls setCookie without options when options is undefined", () => {
        capturedAdapter.set("cookie name", "value");

        expect(setCookie).toHaveBeenCalledWith("cookie%20name", "value", undefined);
      });
    });

    describe("delete", () => {
      test("calls deleteCookie with encoded name", () => {
        capturedAdapter.delete("cookie name");

        expect(deleteCookie).toHaveBeenCalledWith("cookie%20name");
      });
    });
  });
});
