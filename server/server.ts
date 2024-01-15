/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

type Entry = {
  entryId: number;
  title: string;
  notes: string;
  photoUrl: string;
};

type Data = {
  nextEntryId: number;
  entries: Entry[];
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `select *
      from "entries"
      order by "entryId" desc;`;

    const result = await db.query<Entry>(sql);
    res.status(201).json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:id', async (req, res, next) => {
  try {
    const sql = `select *
    from "entries"
    where "entryId" = $1`;
    const params = [+req.params.id];
    const result = await db.query<Entry>(sql, params);

    const temp = result.rows[0];
    if (!temp) {
      throw new ClientError(404, 'Not found.');
    } else {
      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    next(err);
  }
});
// try {
//   const id = +req.params.id;
//   const data = await read();
//   if (!(id in data.notes)) {
//     res.status(404).json({ error: `${id} not found` });
//     return;
//   }
//   res.json(data.notes[id]);
// } catch (err) {
//   console.error(err);
//   res.status(500).json({ error: 'Unexpected error' });
// }

// app.post('/api/notes', async (req, res) => {
//   try {
//     const content: string = req.body.content;
//     if (!content) {
//       res.status(400).json({ error: 'Hey dummy, send some content!' });
//       return;
//     }
//     const data = await read();
//     const note = { id: data.nextId, content };
//     data.notes[data.nextId] = note;
//     data.nextId++;
//     await write(data);
//     res.status(201).json(note);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Unexpected error' });
//   }
// });

// app.put('/api/notes/:id', async (req, res) => {
//   try {
//     const content: string = req.body.content;
//     if (!content) {
//       res.status(400).json({ error: 'Hey dummy, send some content!' });
//       return;
//     }
//     const data = await read();
//     const id = +req.params.id;
//     if (!(id in data.notes)) {
//       res.status(404).json({ error: `${id} not found` });
//       return;
//     }
//     data.notes[id].content = content;
//     await write(data);
//     res.status(201).json(data.notes[id]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Unexpected error' });
//   }
// });

// app.delete('/api/notes/:id', async (req, res) => {
//   try {
//     const data = await read();
//     const id = +req.params.id;
//     if (!(id in data.notes)) {
//       res.status(404).json({ error: `${id} not found` });
//       return;
//     }
//     delete data.notes[id];
//     await write(data);
//     res.sendStatus(204);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Unexpected error' });
//   }
// });

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
