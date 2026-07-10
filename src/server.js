import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import genomeRoutes from './routes/genomeRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', genomeRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
