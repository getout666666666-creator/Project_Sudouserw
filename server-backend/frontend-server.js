import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, '..')));

// Redirect root to -Main_.html
app.get('/', (req, res) => {
  res.redirect('/-Main_.html');
});

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}/-Main_.html`);
});
