import { app } from "./app";

// Temporary: the env-config ticket replaces this with validated config.
const port = Number(process.env.PORT ?? 8000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
