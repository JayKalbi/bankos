import { Request, Response } from 'express';
import { CreatePermissionService } from '../services/CreatePermissionService';
import { IPermissionRepository } from '../interfaces/IPermissionRepository';

export class PermissionController {
  constructor(
    private readonly createPermissionService: CreatePermissionService,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  public async create(req: Request, res: Response): Promise<void> {
    const id = await this.createPermissionService.execute(req.body);
    res.status(201).json({ id });
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    const permissions = await this.permissionRepository.findAll();
    res.json(permissions);
  }
}
