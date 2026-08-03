import { Router, Request, Response, NextFunction } from 'express';
import { RoleController } from '../controllers/RoleController';
import { PermissionController } from '../controllers/PermissionController';
import { validateRequest } from '../../../middlewares/validateRequest';
import { RbacValidators } from '../validators/RbacValidators';
import { DomainEventDispatcher } from '../../../infrastructure/events/DomainEventDispatcher';
import { PrismaRoleRepository } from '../repositories/PrismaRoleRepository';
import { PrismaPermissionRepository } from '../repositories/PrismaPermissionRepository';
import { CreateRoleService } from '../services/CreateRoleService';
import { AssignPermissionService } from '../services/AssignPermissionService';
import { RemovePermissionService } from '../services/RemovePermissionService';
import { CreatePermissionService } from '../services/CreatePermissionService';
import { prisma } from '../../../infrastructure/database/client';

export const rbacRouter = Router();

// We need to inject these but for route initialization we can instantiate locally or pass them
// Assuming they are passed or instantiated here:
const roleRepo = new PrismaRoleRepository(prisma);
const permRepo = new PrismaPermissionRepository(prisma);
const eventDispatcher = new DomainEventDispatcher();

const createRoleService = new CreateRoleService(roleRepo, eventDispatcher);
const assignPermService = new AssignPermissionService(roleRepo, permRepo, eventDispatcher);
const removePermService = new RemovePermissionService(roleRepo, eventDispatcher);
const createPermService = new CreatePermissionService(permRepo, eventDispatcher);

const roleController = new RoleController(createRoleService, assignPermService, removePermService, roleRepo);
const permController = new PermissionController(createPermService, permRepo);

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Assuming tokenService is somehow globally available or we construct it.
// In a real DI framework this is easier. For now, this is a placeholder
// for where the router would be initialized in the app.

// Roles
rbacRouter.post('/roles', validateRequest(RbacValidators.createRole), asyncHandler(roleController.create.bind(roleController)));
rbacRouter.get('/roles', asyncHandler(roleController.getAll.bind(roleController)));
rbacRouter.get('/roles/:id', asyncHandler(roleController.getById.bind(roleController)));
rbacRouter.put('/roles/:id', validateRequest(RbacValidators.updateRole), asyncHandler(roleController.update.bind(roleController)));
rbacRouter.delete('/roles/:id', asyncHandler(roleController.delete.bind(roleController)));

// Role Permissions
rbacRouter.post('/roles/:id/permissions', validateRequest(RbacValidators.assignPermission), asyncHandler(roleController.assignPermission.bind(roleController)));
rbacRouter.delete('/roles/:id/permissions/:permissionId', asyncHandler(roleController.removePermission.bind(roleController)));

// Permissions
rbacRouter.post('/permissions', validateRequest(RbacValidators.createPermission), asyncHandler(permController.create.bind(permController)));
rbacRouter.get('/permissions', asyncHandler(permController.getAll.bind(permController)));
