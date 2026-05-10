import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { signOut } from "aws-amplify/auth";
import { TodoList } from "../../components/TodoList";
import { client } from "../../lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "../../lib/amplifyServerUtils";

const fetchTodos = createServerFn({ method: "GET" }).handler(async () => {
  const { data: todos, errors } = await runWithAmplifyServerContext({
    operation: (contextSpec) => client.models.Todo.list(contextSpec),
  });
  return {
    todos: todos ?? [],
    error: errors?.map((e) => e.message).join(", "),
  };
});

export const Route = createFileRoute("/_protected/")({
  loader: () => fetchTodos(),
  component: Home,
});

function Home() {
  const { todos } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-y-3 my-4 mx-2">
      <h1 className="text-2xl font-bold">Todo List</h1>
      <TodoList items={todos} />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/new" })}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Add Todo
        </button>
        <button
          type="button"
          className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
          onClick={async () => {
            await signOut();
            await navigate({ to: "/login" });
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
