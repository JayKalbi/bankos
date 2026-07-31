import SwaggerParser from '@apidevtools/swagger-parser';
import { swaggerSpec } from '../../src/docs/swagger';

describe('OpenAPI 3.1 Specification', () => {
  it('should generate a valid OpenAPI 3.1 document', async () => {
    const spec = JSON.parse(JSON.stringify(swaggerSpec));

    // Validate the specification using SwaggerParser
    const result = await SwaggerParser.validate(spec);

    expect(result).toBeDefined();
    expect(result.openapi).toBe('3.1.0');
    expect(result.info.title).toBe('BankOS Identity Service API');
    expect(result.paths).toBeDefined();
  });
});
