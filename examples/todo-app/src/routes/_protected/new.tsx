import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { client } from "../../lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "../../lib/amplifyServerUtils";

type CreateTodoInput = { content: string; isDone: boolean };

const createTodo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as CreateTodoInput)
  .handler(async ({ data }) => {
    await runWithAmplifyServerContext({
      operation: (contextSpec) => client.models.Todo.create(contextSpec, data),
    });
  });

export const Route = createFileRoute("/_protected/new")({
  component: NewTodo,
});

function NewTodo() {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    const isDone = formData.get("isDone") === "true";
    await createTodo({ data: { content, isDone } });
    await navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col gap-y-3 my-4 mx-2">
      <h1 className="text-2xl font-bold">New Todo</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="content"
          placeholder="Content"
          className="w-full h-32 p-2 border border-gray-300 rounded"
          required
        />
        <div className="flex items-center mb-4">
          <input
            id="isDone"
            name="isDone"
            type="checkbox"
            value="true"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="isDone" className="ms-2 font-medium">
            Done
          </label>
        </div>
        <button
          type="submit"
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
}
