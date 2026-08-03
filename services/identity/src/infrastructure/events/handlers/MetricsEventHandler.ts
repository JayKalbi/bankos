import { IDomainEventHandler } from '../../../modules/auth/interfaces/IDomainEventHandler';
import { IDomainEvent } from '../../../core/domain/IDomainEvent';
import {
  rolesCreatedTotal,
  permissionsCreatedTotal,
  roleAssignmentsTotal,
  permissionDeniedTotal
} from '../../../observability/metrics';

export class MetricsEventHandler implements IDomainEventHandler {
  public async handle(event: IDomainEvent): Promise<void> {
    switch (event.eventName) {
      case 'RoleCreated':
        rolesCreatedTotal.inc();
        break;
      case 'PermissionCreated':
        permissionsCreatedTotal.inc();
        break;
      case 'RoleAssignedToUser':
      case 'PermissionAssigned':
        roleAssignmentsTotal.inc();
        break;
      case 'AuthorizationDenied':
        permissionDeniedTotal.inc();
        break;
    }
  }
}
