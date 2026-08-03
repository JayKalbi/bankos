import { IRoleRepository } from '../interfaces/IRoleRepository';
import { Role } from '../../../core/domain/Role';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { RoleCreated } from '../../../core/events/RoleCreated';
import { randomUUID } from 'crypto';

export interface CreateRoleDTO {
  name: string;
  description?: string;
  systemRole?: boolean;
  parentId?: string;
}

export class CreateRoleService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(dto: CreateRoleDTO): Promise<string> {
    const existingRole = await this.roleRepository.findByName(dto.name);
    if (existingRole) {
      throw new Error("Role " + dto.name + " already exists");
    }

    if (dto.parentId) {
      const parent = await this.roleRepository.findById(dto.parentId);
      if (!parent) {
        throw new Error("Parent role " + dto.parentId + " not found");
      }
    }

    const id = randomUUID();
    const role = new Role(
      id,
      dto.name,
      dto.description || null,
      dto.systemRole || false,
      dto.parentId || null,
      new Date(),
      new Date()
    );

    await this.roleRepository.create(role);

    await this.eventDispatcher.dispatch([new RoleCreated(role.id, role.name)]);

    return id;
  }
}
