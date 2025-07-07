import request from 'supertest'
import express from 'express'
import cors from 'cors'
import users from '../user.js'

// Create a test app
const app = express()
app.use(cors())
app.use(express.json())
app.use('/user', users)

describe('User Routes', () => {
  describe('POST /user/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/user/signup')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('message', 'User created successfully')
      expect(response.body).toHaveProperty('userId')
    })

    it('should return 400 when required fields are missing', async () => {
      const userData = {
        username: 'testuser'
        // missing email and password
      }

      const response = await request(app)
        .post('/user/signup')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('message', 'All fields are required')
    })

    it('should return 400 when user already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      }

      // First request should succeed
      await request(app)
        .post('/user/signup')
        .send(userData)
        .expect(201)

      // Second request with same data should fail
      const response = await request(app)
        .post('/user/signup')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('message', 'User already exists')
    })
  })

  describe('POST /user/login', () => {
    it('should login user with valid credentials', async () => {
      // First create a user
      const userData = {
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123'
      }

      await request(app)
        .post('/user/signup')
        .send(userData)
        .expect(201)

      // Then try to login
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Login successful')
      expect(response.body).toHaveProperty('userId')
      expect(response.body).toHaveProperty('username', 'logintest')
    })

    it('should return 400 when email or password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
        // missing password
      }

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(400)

      expect(response.body).toHaveProperty('message', 'Email and password are required')
    })

    it('should return 401 with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/user/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('message', 'Invalid credentials')
    })
  })
}) 