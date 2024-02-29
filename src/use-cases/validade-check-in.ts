import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { LateCheckInValidationError } from './errors/late-check-in-validate-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import dayjs from 'dayjs'

interface ValidadeCheckinUseCaseRequest {
  checkInId: string
}

interface ValidadeCheckinUseCaseResponse {
  checkIn: CheckIn
}

export class ValidadeCheckinUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    checkInId,
  }: ValidadeCheckinUseCaseRequest): Promise<ValidadeCheckinUseCaseResponse> {
    const checkIn = await this.checkInsRepository.findById(checkInId)

    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_at,
      'minutes',
    )

    if (distanceInMinutesFromCheckInCreation > 20) {
      throw new LateCheckInValidationError()
    }

    checkIn.validated_at = new Date()
    await this.checkInsRepository.save(checkIn)

    return {
      checkIn,
    }
  }
}
