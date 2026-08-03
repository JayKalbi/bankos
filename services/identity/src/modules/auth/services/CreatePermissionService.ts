import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { Permission } from '../../../core/domain/Permission';
import { IDomainEventDispatcher } from '../interfaces/IDomainEventDispatcher';
import { PermissionCreated } from '../../../core/events/PermissionCreated';
import { randomUUID } from 'crypto';

export interface CreatePermissionDTO {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export class CreatePermissionService {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  public async execute(dto: CreatePermissionDTO): Promise<string> {
    const existing = await this.permissionRepository.findByName(dto.name);
    if (existing) {
      throw new Error("Permission " + dto.name + " already exists");
    }

    const id = randomUUID();
    const permission = new Permission(
      id,
      dto.name,
      dto.resource,
      dto.action,
      dto.description,
      new Date(),
      new Date()
    );

    await this.permissionRepository.create(permission);

    await this.eventDispatcher.dispatch([new PermissionCreated(permission.id, permission.name, permission.description)]);

    return id;
  }
}
