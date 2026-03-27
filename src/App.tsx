import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ThermometerSun, 
  Settings2, 
  Droplets,
  Plus,
  Save,
  Trash2,
  Activity,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import { Zone, Reading, ViewState } from './types';
import { cn, calculateRH } from './lib/utils';

// --- Initial Mock Data ---
const INITIAL_ZONES: Zone[] = [
  { id: '1', name: 'Almacén Principal', description: 'Zona de almacenamiento de materias primas', createdAt: new Date().toISOString() },
  { id: '2', name: 'Cámara Frigorífica A', description: 'Productos perecederos', createdAt: new Date().toISOString() },
  { id: '3', name: 'Sala de Producción', description: 'Área de manufactura', createdAt: new Date().toISOString() },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // State
  const [zones, setZones] = useState<Zone[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  
  // Load data
  useEffect(() => {
    const savedZones = localStorage.getItem('psicrometria_zones');
    const savedReadings = localStorage.getItem('psicrometria_readings');
    
    if (savedZones) {
      setZones(JSON.parse(savedZones));
    } else {
      setZones(INITIAL_ZONES);
      localStorage.setItem('psicrometria_zones', JSON.stringify(INITIAL_ZONES));
    }
    
    if (savedReadings) {
      setReadings(JSON.parse(savedReadings));
    } else {
      setReadings([]);
      localStorage.setItem('psicrometria_readings', JSON.stringify([]));
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
  };

  // Save data wrappers
  const saveZones = (newZones: Zone[]) => {
    setZones(newZones);
    localStorage.setItem('psicrometria_zones', JSON.stringify(newZones));
  };

  const saveReadings = (newReadings: Reading[]) => {
    setReadings(newReadings);
    localStorage.setItem('psicrometria_readings', JSON.stringify(newReadings));
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Psicrometría</h1>
              <p className="text-xs text-teal-400 font-medium tracking-wider uppercase">Pro Dashboard</p>
            </div>
          </div>
          <button 
            className="md:hidden p-1 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<ThermometerSun className="w-5 h-5" />} 
            label="Nueva Lectura" 
            active={currentView === 'new-reading'} 
            onClick={() => { setCurrentView('new-reading'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<Settings2 className="w-5 h-5" />} 
            label="Configuración" 
            active={currentView === 'settings'} 
            onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }} 
          />
        </nav>
        
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Facility Manager</span>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-teal-500 p-1.5 rounded-lg">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-slate-900 dark:text-slate-50">Psicrometría Pro</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView 
                zones={zones} 
                readings={readings} 
                onDeleteReading={(id) => saveReadings(readings.filter(r => r.id !== id))}
                onDeleteAllReadings={() => saveReadings([])}
                theme={theme}
              />
            )}
            {currentView === 'new-reading' && (
              <NewReadingView 
                zones={zones} 
                onSave={(reading) => {
                  saveReadings([reading, ...readings]);
                  setCurrentView('dashboard');
                }} 
              />
            )}
            {currentView === 'settings' && (
              <SettingsView 
                zones={zones} 
                onUpdateZones={saveZones} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Components ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
        active 
          ? "bg-teal-500/10 text-teal-400" 
          : "hover:bg-slate-800 hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function DashboardView({ 
  zones, 
  readings, 
  onDeleteReading, 
  onDeleteAllReadings,
  theme
}: { 
  zones: Zone[], 
  readings: Reading[],
  onDeleteReading: (id: string) => void,
  onDeleteAllReadings: () => void,
  theme: 'light' | 'dark'
}) {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [readingToDelete, setReadingToDelete] = useState<Reading | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Filter readings
  const filteredReadings = selectedZone === 'all' 
    ? readings 
    : readings.filter(r => r.zoneId === selectedZone);

  // Sort by date ascending for charts
  const chartData = [...filteredReadings]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      ...r,
      dateFormatted: format(parseISO(r.timestamp), 'dd MMM', { locale: es }),
      zoneName: zones.find(z => z.id === r.zoneId)?.name || 'Desconocida'
    }));

  // Stats
  const latestReadings = [...filteredReadings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const avgHumidity = latestReadings.length > 0 
    ? latestReadings.reduce((acc, curr) => acc + curr.relativeHumidity, 0) / latestReadings.length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen de condiciones ambientales</p>
        </div>
        
        <div className="flex items-center gap-3">
          {readings.length > 0 && (
            <button
              onClick={() => setIsDeletingAll(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Borrar Todas</span>
            </button>
          )}
          <select 
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todas las zonas</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Lecturas" 
          value={filteredReadings.length.toString()} 
          icon={<Activity className="w-6 h-6 text-blue-500" />} 
          trend="+12 esta semana"
        />
        <StatCard 
          title="Humedad Promedio" 
          value={`${avgHumidity.toFixed(1)}%`} 
          icon={<Droplets className="w-6 h-6 text-teal-500" />} 
          trend="Últimos 30 días"
        />
        <StatCard 
          title="Zonas Activas" 
          value={zones.length.toString()} 
          icon={<LayoutDashboard className="w-6 h-6 text-purple-500" />} 
          trend="Configuradas"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 shrink-0">Humedad Relativa (%)</h3>
          <div className="w-full overflow-x-auto pb-2 chart-scroll flex-1">
            <div style={{ minWidth: `${Math.max(100, chartData.length * 45)}px`, width: '100%' }} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                  labelStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="relativeHumidity" name="Humedad Relativa" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 shrink-0">Temperaturas (°C)</h3>
          <div className="w-full overflow-x-auto pb-2 chart-scroll flex-1">
            <div style={{ minWidth: `${Math.max(100, chartData.length * 45)}px`, width: '100%' }} className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="dateFormatted" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="dryBulb" name="Bulbo Seco" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="wetBulb" name="Bulbo Húmedo" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Lecturas Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                <th className="px-6 py-4 font-medium">Zona</th>
                <th className="px-6 py-4 font-medium">Bulbo Seco</th>
                <th className="px-6 py-4 font-medium">Bulbo Húmedo</th>
                <th className="px-6 py-4 font-medium">Humedad Rel.</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {latestReadings.slice(0, 10).map((reading) => (
                <tr key={reading.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-colors">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {format(parseISO(reading.timestamp), "d MMM yyyy, HH:mm", { locale: es })}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                    {zones.find(z => z.id === reading.zoneId)?.name || 'Desconocida'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{reading.dryBulb} °C</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{reading.wetBulb} °C</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                      {reading.relativeHumidity}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setReadingToDelete(reading)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar lectura"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {latestReadings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No hay lecturas registradas para esta zona.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Reading Modal */}
      {readingToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Eliminar Lectura</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta lectura del <strong className="text-slate-700 dark:text-slate-200">{format(parseISO(readingToDelete.timestamp), "d MMM yyyy, HH:mm", { locale: es })}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setReadingToDelete(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeleteReading(readingToDelete.id);
                  setReadingToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Readings Modal */}
      {isDeletingAll && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Eliminar Todas las Lecturas</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar <strong className="text-slate-700 dark:text-slate-200">todas las lecturas registradas</strong>? Esta acción vaciará completamente el historial y no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeletingAll(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeleteAllReadings();
                  setIsDeletingAll(false);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Sí, eliminar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</h4>
        <p className="text-xs text-slate-400 mt-2">{trend}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
        {icon}
      </div>
    </div>
  );
}

function NewReadingView({ zones, onSave }: { zones: Zone[], onSave: (r: Reading) => void }) {
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [dryBulb, setDryBulb] = useState<string>('');
  const [wetBulb, setWetBulb] = useState<string>('');
  const [timestamp, setTimestamp] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState('');

  const dry = parseFloat(dryBulb);
  const wet = parseFloat(wetBulb);
  const isValid = !isNaN(dry) && !isNaN(wet) && zoneId !== '' && wet <= dry;
  
  const currentRH = isValid ? calculateRH(dry, wet) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const newReading: Reading = {
      id: Math.random().toString(36).substr(2, 9),
      zoneId,
      timestamp: new Date(timestamp).toISOString(),
      dryBulb: dry,
      wetBulb: wet,
      relativeHumidity: currentRH!,
      notes
    };

    onSave(newReading);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Nueva Lectura</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Registra los datos del psicrómetro</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Zona de Medición</label>
              <select 
                required
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              >
                <option value="" disabled>Selecciona una zona...</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Fecha y Hora</label>
              <input 
                type="datetime-local" 
                required
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Temp. Bulbo Seco (°C)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  placeholder="Ej: 22.5"
                  value={dryBulb}
                  onChange={(e) => setDryBulb(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Temp. Bulbo Húmedo (°C)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  placeholder="Ej: 18.2"
                  value={wetBulb}
                  onChange={(e) => setWetBulb(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                {!isNaN(dry) && !isNaN(wet) && wet > dry && (
                  <p className="text-red-500 text-xs mt-2">El bulbo húmedo no puede ser mayor al seco.</p>
                )}
              </div>
            </div>

            {/* Live Calculation Result */}
            <div className="mt-6 p-6 bg-slate-900 rounded-xl text-white flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Humedad Relativa Calculada</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {currentRH !== null ? currentRH : '--'}
                  </span>
                  <span className="text-xl text-slate-400">%</span>
                </div>
              </div>
              <Droplets className={cn("w-12 h-12", currentRH !== null ? "text-teal-400" : "text-slate-700 dark:text-slate-200")} />
            </div>

            <div className="pt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Notas (Opcional)</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones adicionales..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <button 
              type="submit"
              disabled={!isValid}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors"
            >
              <Save className="w-5 h-5" />
              Guardar Lectura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsView({ zones, onUpdateZones }: { zones: Zone[], onUpdateZones: (z: Zone[]) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newZone: Zone = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      description: newDesc.trim(),
      createdAt: new Date().toISOString()
    };

    onUpdateZones([...zones, newZone]);
    setNewName('');
    setNewDesc('');
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (zoneToDelete) {
      onUpdateZones(zones.filter(z => z.id !== zoneToDelete.id));
      setZoneToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Configuración</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Administra las zonas de medición de tu instalación</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Zonas Configuradas</h3>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-sm bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Zona
            </button>
          )}
        </div>

        {isAdding && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
            <form onSubmit={handleAddZone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nombre de la Zona</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Invernadero B"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descripción</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Guardar
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {zones.map(zone => (
            <li key={zone.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-50">{zone.name}</h4>
                {zone.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{zone.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Añadida el {format(parseISO(zone.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              <button 
                onClick={() => setZoneToDelete(zone)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar zona"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
          {zones.length === 0 && !isAdding && (
            <li className="p-8 text-center text-slate-500 dark:text-slate-400">
              No hay zonas configuradas. Añade una para comenzar.
            </li>
          )}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {zoneToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Eliminar Zona</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar la zona <strong className="text-slate-700 dark:text-slate-200">"{zoneToDelete.name}"</strong>? Las lecturas asociadas podrían quedar huérfanas o perderse. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setZoneToDelete(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
