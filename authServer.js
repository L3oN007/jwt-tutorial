import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5500;

const users = [
  {
    id: 1,
    username: 'user',
    password: '123',
    role: 'user',
  },
  {
    id: 2,
    username: 'staff',
    password: '123',
    role: 'staff',
  },
  {
    id: 3,
    username: 'admin',
    password: '123',
    role: 'admin',
  },
]; // Store user data in-memory (for demonstration purposes)

app.use(express.json());

app.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if the username already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user object
    const newUser = { username, password, role };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Check the password
    if (password !== user.password) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate a random ID (for demonstration purposes)


    // Generate an access token
    const accessToken = jwt.sign({ id: user.id, username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '10s', // Set the expiration time as desired
    });

    // Generate a refresh token
    const refreshToken = jwt.sign({ id: user.id, username }, process.env.REFRESH_TOKEN_SECRET);

    // Response data
    const responseData = {
      id: user.id,
      username,
      role: user.role,
      accessToken,
      refreshToken,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/auth/refreshToken', (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    // Verify the refreshToken
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Find the user by username
      const user = users.find((user) => user.username === data.username);
      if (!user) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Generate a new access token
      const accessToken = jwt.sign({ username: data.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1m', // Set the expiration time as desired
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout', (req, res) => {
  // For demonstration purposes, we don't need to do anything here
  res.status(200).json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
