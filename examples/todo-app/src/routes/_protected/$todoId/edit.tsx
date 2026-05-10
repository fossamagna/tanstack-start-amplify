import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { client } from "../../../lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "../../../lib/amplifyServerUtils";

type UpdateTodoInput = { id: string; content: string; isDone: boolean };

const fetchTodo = createServerFn({ method: "GET" })
  .inputValidator((id: unknown) => id as string)
  .handler(async ({ data: id }) => {
    const { data: todo, errors } = await runWithAmplifyServerContext({
      operation: (contextSpec) => client.models.Todo.get(contextSpec, { id }),
    });
    return { todo, error: errors?.map((e) => e.message).join(", ") };
  });

const updateTodo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as UpdateTodoInput)
  .handler(async ({ data }) => {
    await runWithAmplifyServerContext({
      operation: (contextSpec) => client.models.Todo.update(contextSpec, data),
    });
  });

export const Route = createFileRoute("/_protected/$todoId/edit")({
  loader: ({ params }) => fetchTodo({ data: params.todoId }),
  component: EditTodo,
});

function EditTodo() {
  const { todo, error } = Route.useLoaderData();
  const navigate = useNavigate();

  if (error) return <div>Error: {error}</div>;
  if (!todo) return <div>Todo not found</div>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await updateTodo({
      data: {
        id: todo.id,
        content: formData.get("content") as string,
        isDone: formData.get("isDone") === "true",
      },
    });
    await navigate({ to: "/" });
  };

  return (
    <div className="flex flex-col gap-y-3 my-4 mx-2">
      <h1 className="text-2xl font-bold">Edit Todo</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="content"
          defaultValue={todo.content ?? ""}
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
            defaultChecked={!!todo.isDone}
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
          Save
        </button>
      </form>
    </div>
  );
}
