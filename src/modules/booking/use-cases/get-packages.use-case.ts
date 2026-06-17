import { PackageRepository } from "../repositories/package.repository";

export class GetPackagesUseCase {
  constructor(private packageRepository: PackageRepository) {}

  async execute() {
    return this.packageRepository.findAll();
  }
}
