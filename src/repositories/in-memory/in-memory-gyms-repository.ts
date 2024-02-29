import { FindManyNearbyParams, GymsRepository } from '../gyms-repository'
import { Gym, Prisma } from '@prisma/client'

import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'
import { randomUUID } from 'crypto'

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = []

  async findById(id: string) {
    const gym = this.items.find((item) => item.id === id)

    if (!gym) {
      return null
    }

    return gym
  }

  async findManyNearby(params: FindManyNearbyParams) {
    return this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: params.latitude, longitude: params.longitude },
        {
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
        },
      )

      const MAX_DISTANCE_KILOMETERS = 10
      return distance < MAX_DISTANCE_KILOMETERS
    })
  }

  async searchMany(query: string, page: number): Promise<Gym[]> {
    return this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20)
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()).toString(),
      longitude: new Prisma.Decimal(data.longitude.toString()).toString(),
      created_at: new Date(),
    }

    this.items.push(gym)

    return gym
  }
}
