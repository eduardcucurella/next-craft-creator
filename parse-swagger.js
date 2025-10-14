const fs = require('fs');

// Read and parse the swagger file
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('=== ROLES ENDPOINTS (/rols) ===\n');
Object.keys(swagger.paths).forEach(path => {
  if (path.includes('/rols')) {
    console.log(`Path: ${path}`);
    Object.keys(swagger.paths[path]).forEach(method => {
      const endpoint = swagger.paths[path][method];
      console.log(`  ${method.toUpperCase()}: ${endpoint.summary || endpoint.description || 'No description'}`);
      if (endpoint.parameters) {
        console.log('  Parameters:', endpoint.parameters.map(p => `${p.name} (${p.in})`).join(', '));
      }
    });
    console.log('');
  }
});

console.log('\n=== USERS ENDPOINTS (/usuaris) ===\n');
Object.keys(swagger.paths).forEach(path => {
  if (path.includes('/usuaris')) {
    console.log(`Path: ${path}`);
    Object.keys(swagger.paths[path]).forEach(method => {
      const endpoint = swagger.paths[path][method];
      console.log(`  ${method.toUpperCase()}: ${endpoint.summary || endpoint.description || 'No description'}`);
      if (endpoint.parameters) {
        console.log('  Parameters:', endpoint.parameters.map(p => `${p.name} (${p.in})`).join(', '));
      }
    });
    console.log('');
  }
});

// Find definitions
console.log('\n=== RELEVANT DEFINITIONS ===\n');
if (swagger.definitions) {
  ['Rol', 'Usuari', 'User', 'Role'].forEach(defName => {
    if (swagger.definitions[defName]) {
      console.log(`${defName}:`, JSON.stringify(swagger.definitions[defName], null, 2));
    }
  });
}
