import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RbacValidators {
  public static readonly createRole = z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(1024).optional(),
      systemRole: z.boolean().optional(),
      parentId: z.string().uuid().optional()
    }).strict()
  });

  public static readonly updateRole = z.object({
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(1024).optional(),
      systemRole: z.boolean().optional(),
      parentId: z.string().uuid().optional()
    }).strict(),
    params: z.object({
      id: z.string().uuid()
    })
  });

  public static readonly assignPermission = z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      permissionId: z.string().uuid()
    }).strict()
  });

  public static readonly createPermission = z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      resource: z.string().min(1).max(255),
      action: z.string().min(1).max(255),
      description: z.string().max(1024)
    }).strict()
  });

  public static readonly assignRoleToUser = z.object({
    params: z.object({
      id: z.string().uuid()
    }),
    body: z.object({
      roleName: z.string().min(1)
    }).strict()
  });
}
