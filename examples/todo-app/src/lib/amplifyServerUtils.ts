import { createServerRunner } from "amplify-adapter-tanstack-start";
import outputs from "../../amplify_outputs.json";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});
