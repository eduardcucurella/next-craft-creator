// Utility to parse swagger.json and extract endpoint information
import swaggerData from '../../swagger.json';

interface SwaggerEndpoint {
  path: string;
  method: string;
  summary: string;
  parameters: any[];
  responses: any;
}

export const extractEndpoints = (pathPrefix: string): SwaggerEndpoint[] => {
  const endpoints: SwaggerEndpoint[] = [];
  
  Object.entries(swaggerData.paths).forEach(([path, methods]: [string, any]) => {
    if (path.startsWith(pathPrefix)) {
      Object.entries(methods).forEach(([method, details]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: details.summary || '',
          parameters: details.parameters || [],
          responses: details.responses || {}
        });
      });
    }
  });
  
  return endpoints;
};

// Extract roles endpoints
export const rolesEndpoints = extractEndpoints('/rols');

// Extract users endpoints  
export const usersEndpoints = extractEndpoints('/usuaris');

// Log for debugging
console.log('Roles endpoints:', rolesEndpoints);
console.log('Users endpoints:', usersEndpoints);
