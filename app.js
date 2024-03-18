// app.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

// Create user table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    if (!row) {
      return res.redirect('/');
    }

    // Fetch all users from the database
    db.all('SELECT * FROM users', (err, users) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      res.render('main', { username, users });
    });
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});


// Route to delete user data
app.post('/delete/:id', (req, res) => {
  const userId = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', userId, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// db.get('SELECT id FROM users WHERE username = ?', 'shay1', (err, row) => {
//     if (err) {
//       console.error(err);
//       // Handle error appropriately
//     }
//     if (!row) {
//       console.log('User not found');
//       // Handle user not found case
//     } else { 
//       const userId = row.id;
//       // Delete the user with the obtained ID
//       db.run('DELETE FROM users WHERE id = ?', userId, (err) => {
//         if (err) {
//           console.error(err);
//           // Handle error appropriately
//         } else {
//           console.log('User deleted successfully');
//           // Redirect or send response as needed
//         }
//       });
//     }
//   });