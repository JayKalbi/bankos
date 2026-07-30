import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export const otelSdk = new NodeSDK({
  serviceName: 'identity-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
