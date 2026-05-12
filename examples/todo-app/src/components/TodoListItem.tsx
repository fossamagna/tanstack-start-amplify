import { Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { client } from "../lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "../lib/amplifyServerUtils";

type Todo = Schema["Todo"]["type"];

const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => id as string)
  .handler(async ({ data: id }) => {
    await runWithAmplifyServerContext({
      operation: (contextSpec) => client.models.Todo.delete(contextSpec, { id }),
    });
  });

export function TodoListItem({ item }: { item: Todo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    await deleteTodo({ data: item.id });
    await router.invalidate();
    setBusy(false);
  };

  return (
    <li className="flex py-3">
      <div className="flex min-w-0 gap-x-4 px-3">
        <Link to="/$todoId/edit" params={{ todoId: item.id }}>
          <span className="text-sm/6 font-semibold text-white-900">{item.content}</span>
        </Link>
        {item.isDone && <span>☑️</span>}
      </div>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="py-1 px-3 mr-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
        >
          x
        </button>
      </div>
    </li>
  );
}
