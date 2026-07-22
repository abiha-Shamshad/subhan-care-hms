import 'dotenv/config';
import { validateEnv } from './src/config/validateEnv.js';

validateEnv();

const { default: app } = await import('./src/app.js');
const { connectDB } = await import('./src/config/db.js');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`SubhanHMS API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    // Not `err.message` — some driver errors echo the connection string (with
    // its embedded password) back in the message text. Name alone is enough
    // to point someone at their MONGO_URI without risking a credential in logs.
    console.error(`Failed to connect to MongoDB (${err.name}). Check MONGO_URI in backend/.env.`);
    process.exit(1);
  });
