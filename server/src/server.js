import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
