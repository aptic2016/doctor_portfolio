import { Prisma, Profile } from "@prisma/client"
import { prisma } from "@/lib/db"

export class ProfileRepository {
  async getProfile(): Promise<Profile | null> {
    return prisma.profile.findFirst()
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    return prisma.profile.update({ where: { id }, data })
  }

  async createProfile(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return prisma.profile.create({ data })
  }
}
