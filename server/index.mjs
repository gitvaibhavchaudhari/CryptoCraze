import { createApp } from "./src/app.mjs";
import { connectDatabase } from "./src/config/database.mjs";
import { env } from "./src/config/env.mjs";

const app = createApp();

await connectDatabase();

app.listen(env.port, () => {
  console.log(`CryptoCraze API running on http://localhost:${env.port}`);
});
