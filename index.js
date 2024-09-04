require("dotenv").config();
const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL) 

const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());


app.post('/api/flavors', async(req, res, next) => {
    try {
        const SQL = /* SQL */ `
        INSERT INTO flavors(txt)
        VALUES($1)
        RETURNING *
        `;

        const response = await client.query(SQL, [req.body.txt])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = /* SQL */ `
      SELECT * from flavors
      WHERE id=${req.params.id}
      `;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });

app.put('/api/flavors/:id', async(req, res, next) => {
    try {
       const SQL = /* SQL */ `
       UPDATE flavors
       SET txt=$1, updated_at=now()
       WHERE id=$2 RETURNING *
       `;
       
       const response = await client.query(SQL, [
        req.body.txt, 
        req.params.id
    ]);
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})
  
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = /* SQL */ `
        DELETE from flavors
        WHERE id = $1
      `
      const response = await client.query(SQL, [req.params.id])
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  })


const init = async() => {
    await client.connect()
    console.log('connected to database');

    let SQL = /* SQL */ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      txt VARCHAR(255),
      is_favorite BOOLEAN DEFAULT FALSE NOT NULL
    );
    INSERT INTO flavors(txt, is_favorite) VALUES('Cookies n Cream', true);
    INSERT INTO flavors(txt) VALUES('Vanilla');
    INSERT INTO flavors(txt) VALUES('Buttered Pecan');
    `;

    await client.query(SQL);
    console.log('data seeded');
    
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`)
    );
}

init();