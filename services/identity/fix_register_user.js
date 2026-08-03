const fs = require('fs');

let content = fs.readFileSync('src/modules/auth/services/RegisterUserService.ts', 'utf8');
content = content.replace(
  /const user = new User\([\s\S]*?\);/,
  "const user = new User(\n      this.randomGenerator.generateUUID(),\n      normalizedEmail,\n      passwordHash,\n      false,\n      0,\n      false,\n      true\n    );"
);
content = content.replace(
  /await this\.userRepository\.save\(user\);/,
  "await this.userRepository.save(user);\n    await this.userRepository.assignRole(user.id, defaultRole.name);"
);
fs.writeFileSync('src/modules/auth/services/RegisterUserService.ts', content);
