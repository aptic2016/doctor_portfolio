import { ProfileRepository } from "@/repositories/profile/profile.repository"
import { Profile, Prisma } from "@prisma/client"

export class ProfileService {
  private repository = new ProfileRepository()

  async getPublicProfile(): Promise<Profile | null> {
    const profile = await this.repository.getProfile()
    if (!profile) return null

    // Return only public fields if needed, or filter based on isVisible
    if (!profile.isVisible) return null

    return profile
  }

  async getProfileForAdmin(): Promise<Profile | null> {
    return this.repository.getProfile()
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    return this.repository.updateProfile(id, data)
  }

  async initializeProfile(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return this.repository.createProfile(data)
  }
}

export const profileService = new ProfileService()
