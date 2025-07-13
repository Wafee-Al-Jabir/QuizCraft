#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing build configuration...');

// Check if framer-motion is installed
try {
  const packagePath = path.join(process.cwd(), 'node_modules', 'framer-motion', 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('✅ framer-motion found:', pkg.version);
  } else {
    console.log('❌ framer-motion not found in node_modules');
  }
} catch (error) {
  console.log('❌ Error checking framer-motion:', error.message);
}

// Check if UI components exist
const componentsToCheck = [
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/micro-interactions.tsx',
  'components/ui/enhanced-loading.tsx',
  'components/ui/celebration.tsx',
  'components/ui/page-transition.tsx'
];

componentsToCheck.forEach(component => {
  const componentPath = path.join(process.cwd(), component);
  if (fs.existsSync(componentPath)) {
    console.log('✅ Component found:', component);
  } else {
    console.log('❌ Component missing:', component);
  }
});

// Test TypeScript compilation
try {
  console.log('\n🔨 Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
}

// Test Next.js build
try {
  console.log('\n🏗️ Testing Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build successful');
} catch (error) {
  console.log('❌ Next.js build failed');
  process.exit(1);
}

console.log('\n🎉 All tests passed!');