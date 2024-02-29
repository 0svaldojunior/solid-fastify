import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { app } from '@/app'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-users'
import request from 'supertest'

describe('Search gym (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search a gym', async () => {
    const { token } = await createAndAuthenticateUser(app, true)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'TypeScript Gym',
        description: 'The best gym for TypeScript developers.',
        phone: '11123456789',
        latitude: -27.2092052,
        longitude: -49.6401092,
      })

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'JavaScript Gym',
        description: 'The best gym for TypeScript developers.',
        phone: '11123456789',
        latitude: -27.2092052,
        longitude: -49.6401092,
      })

    const response = await request(app.server)
      .get('/gyms/search')
      .query({
        query: 'TypeScript',
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(201)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms[0]).toEqual(
      expect.objectContaining({
        title: 'TypeScript Gym',
      }),
    )
  })
})
