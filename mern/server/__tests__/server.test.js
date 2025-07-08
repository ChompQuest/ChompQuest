import request from 'supertest'
import express from 'express'
import cors from 'cors'
import users from '../routes/user.js'

// Create test app
const app = express()
app.use(cors())
app.use(express.json())
app.use('/user', users)

describe('Server Integration Tests', () => {
  describe('CORS', () => {
    it('should allow CORS requests', async () => {
      const response = await request(app)
        .options('/user/signup')
        .set('Origin', 'http://localhost:3000')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBe('*')
    })
  })

  describe('JSON Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const userData = {
        username: 'integrationtest',
        email: 'integration@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/user/signup')
        .send(userData)
        .set('Content-Type', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('message', 'User created successfully')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/user/signup')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)
    })

    it('should handle missing routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404)
    })
  })
}) 