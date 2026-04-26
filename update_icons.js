const fs = require('fs');
const path = require('path');

const directory = './frontend';

const iconMap = {
  'Zap': 'Wrench',
  'BarChart3': 'AlertTriangle', // Bias Evaluation / Detection
  'Database': 'Database',
  'Upload': 'FilePlus', // Upload -> FilePlus
  'CheckCircle': 'ShieldCheck', // Fairness -> ShieldCheck maybe? Or keep CheckCircle
  // add more as needed
};

// We will find all files importing from lucide-react.
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const files = walk(directory);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('lucide-react')) continue;

  // 1. Parse imports from lucide-react
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
  let match;
  let importedIcons = new Set();
  
  while ((match = importRegex.exec(content)) !== null) {
    const icons = match[1].split(',').map(i => i.trim()).filter(i => i);
    icons.forEach(i => importedIcons.add(i));
  }

  if (importedIcons.size === 0) continue;

  let modified = false;

  // Apply mappings and add strokeWidth={1.5}
  importedIcons.forEach(iconName => {
    const newIconName = iconMap[iconName] || iconName;
    
    // add strokeWidth={1.5} to JSX elements of this icon
    // <IconName ... /> or <IconName>...</IconName>
    const jsxRegex = new RegExp(`<(${iconName})([^>]*?)(\/?>)`, 'g');
    content = content.replace(jsxRegex, (m, name, props, end) => {
      let newProps = props;
      if (!newProps.includes('strokeWidth=')) {
        newProps = newProps + ' strokeWidth={1.5}';
      }
      modified = true;
      return `<${newIconName}${newProps}${end}`;
    });

    // Also handle dynamic usages like c.icon (when they are passed as references)
    // Actually, for dynamic usage, the component itself won't have <IconName> in the regex, it will have <c.icon />
    // We should handle <c.icon ... />
    
    // Update the import if we renamed it
    if (newIconName !== iconName) {
      content = content.replace(new RegExp(`\\b${iconName}\\b`, 'g'), newIconName);
      modified = true;
    }
  });

  // Handle generic dynamic icons <Icon ... />, <step.icon ... />, <c.icon ... />
  const dynamicIconRegex = /<([a-zA-Z0-9_.]*icon[a-zA-Z0-9_.]*)([^>]*?)(\/?>)/gi;
  content = content.replace(dynamicIconRegex, (m, name, props, end) => {
    let newProps = props;
    if (!newProps.includes('strokeWidth=')) {
      newProps = newProps + ' strokeWidth={1.5}';
      modified = true;
    }
    return `<${name}${newProps}${end}`;
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated ' + file);
  }
}
