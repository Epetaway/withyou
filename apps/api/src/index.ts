import { app } from './app.js';
import { env } from './config/env.js';

const port = env.port ?? 3000;

app.listen(port, () => {
  // Simple startup log to confirm server boot
  console.log(`API listening on port ${port}`);
});
