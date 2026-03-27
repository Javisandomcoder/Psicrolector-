import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
content = content.replace(
  /Menu,\n  X\n} from 'lucide-react';/,
  "Menu,\n  X,\n  Moon,\n  Sun\n} from 'lucide-react';"
);

// State
content = content.replace(
  /const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\);/,
  "const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [theme, setTheme] = useState<'light' | 'dark'>('light');"
);

// useEffect
content = content.replace(
  /localStorage\.setItem\('psicrometria_readings', JSON\.stringify\(\[\]\)\);\n    }\n  }, \[\]\);/,
  `localStorage.setItem('psicrometria_readings', JSON.stringify([]));
    }
    
    // Theme setup
    const savedTheme = localStorage.getItem('psicrometria_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('psicrometria_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };`
);

// Sidebar footer
content = content.replace(
  /<div className="p-4 text-xs text-slate-500 border-t border-slate-800">\n          &copy; {new Date\(\)\.getFullYear\(\)} Facility Manager\n        <\/div>/,
  `<div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Facility Manager</span>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>`
);

// Global replacements for dark mode classes
content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-900');
content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-800');
content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-50');
content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100');
content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-200');
content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-700');
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
content = content.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-slate-700');
content = content.replace(/hover:bg-slate-100/g, 'hover:bg-slate-100 dark:hover:bg-slate-700');
content = content.replace(/bg-slate-50\/50/g, 'bg-slate-50/50 dark:bg-slate-800/50');
content = content.replace(/bg-slate-50\/80/g, 'bg-slate-50/80 dark:bg-slate-800/80');

// Fix double dark classes if any
content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');

// Fix the Recharts colors to be dynamic based on theme.
// We need to pass theme to DashboardView or just use CSS variables.
// Since we are using Recharts, we can use CSS variables or pass the theme.
// Let's pass theme to DashboardView.
content = content.replace(
  /function DashboardView\(\{ zones, readings, onDeleteReading, onDeleteAllReadings \}: \{ zones: Zone\[\], readings: Reading\[\], onDeleteReading: \(id: string\) => void, onDeleteAllReadings: \(\) => void \}\) \{/,
  "function DashboardView({ zones, readings, onDeleteReading, onDeleteAllReadings, theme }: { zones: Zone[], readings: Reading[], onDeleteReading: (id: string) => void, onDeleteAllReadings: () => void, theme: 'light' | 'dark' }) {"
);

content = content.replace(
  /<DashboardView zones=\{zones\} readings=\{readings\} onDeleteReading=\{confirmDeleteReading\} onDeleteAllReadings=\{confirmDeleteAllReadings\} \/>/,
  "<DashboardView zones={zones} readings={readings} onDeleteReading={confirmDeleteReading} onDeleteAllReadings={confirmDeleteAllReadings} theme={theme} />"
);

// Update Recharts colors
content = content.replace(
  /stroke="#e2e8f0"/g,
  "stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}"
);
content = content.replace(
  /stroke="#64748b"/g,
  "stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}"
);
content = content.replace(
  /contentStyle=\{\{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb\(0 0 0 \/ 0\.1\)' \}\}/g,
  "contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}"
);
content = content.replace(
  /labelStyle=\{\{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' \}\}/g,
  "labelStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}"
);

// Fix the overlay background which shouldn't be dark:bg-slate-900
content = content.replace(
  /className="fixed inset-0 bg-slate-900\/50 z-40 md:hidden backdrop-blur-sm transition-opacity"/,
  'className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"'
);

// Fix the sidebar background which was bg-slate-900 and got replaced
content = content.replace(
  /bg-slate-900 text-slate-300/g,
  'bg-slate-900 text-slate-300'
);

// We need to be careful with the sidebar, it was already dark.
// Let's revert any accidental replacements in the sidebar.
// Wait, bg-slate-900 wasn't replaced, bg-slate-50 was replaced with bg-slate-50 dark:bg-slate-900.
// So the sidebar is fine.

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated for dark mode');
