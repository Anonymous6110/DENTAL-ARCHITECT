import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings as SettingsIcon, Users, Database, 
  Tag, Palette, Save, Download, Upload, 
  Plus, Trash2, Shield, Bell, Globe,
  RefreshCw, HardDrive, ShieldCheck, Edit, X
} from "lucide-react";
import { User, RateList, Shade } from "../types";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Settings() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') as any;
  
  const [activeTab, setActiveTab] = useState<'general' | 'company' | 'users' | 'rates' | 'shades'>(
    (initialTab && ['general', 'company', 'users', 'rates', 'shades'].includes(initialTab)) ? initialTab : 'general'
  );
  
  const [rates, setRates] = useState<any[]>([]);
  const [shades, setShades] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{type: 'rates' | 'shades' | 'users', id: any} | null>(null);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/rate-list");
      if (res.ok) setRates(await res.json());
    } catch (err) {
      console.error("Failed to fetch rates", err);
    }
  };

  const fetchShades = async () => {
    try {
      const res = await fetch("/api/shades");
      if (res.ok) setShades(await res.json());
    } catch (err) {
      console.error("Failed to fetch shades", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setAppSettings(await res.json());
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      if (res.ok) setDoctors(await res.json());
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  const [user, setUser] = useState<any>(null);

  const fetchData = async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    setLoading(true);
    await Promise.all([
      fetchRates(),
      fetchShades(),
      fetchSettings(),
      fetchUsers(),
      fetchDoctors()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Form states
  const [userForm, setUserForm] = useState({ username: "", password: "", role: "Staff" as "Staff" | "Admin" | "Doctor" | "Manager", doctor_id: "" });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ username: "", password: "", role: "Staff" as any, doctor_id: "" });
  const [rateForm, setRateForm] = useState({ case_type: "", material: "", price: "" });
  const [shadeForm, setShadeForm] = useState({ name: "" });

  useEffect(() => {
    const tab = queryParams.get('tab') as any;
    if (tab && ['general', 'company', 'users', 'rates', 'shades'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleSaveSettings = async (newSettings: any) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      toast.success("Settings updated");
      fetchSettings();
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        username: userForm.username,
        password: userForm.password,
        role: userForm.role,
      };
      
      let endpoint = "/api/users";
      if (userForm.role === 'Doctor') {
        if (!userForm.doctor_id) {
          toast.error("Please select a doctor");
          return;
        }
        payload.doctor_id = userForm.doctor_id;
        endpoint = "/api/users/doctor";
      }
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add user");
      }
      
      toast.success("User added");
      setUserForm({ username: "", password: "", role: "Staff", doctor_id: "" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add user");
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserForm({
      username: user.username,
      password: "", // Don't show hashed password
      role: user.role,
      doctor_id: user.doctor_id || ""
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUserForm),
      });
      
      if (!res.ok) throw new Error("Failed to update user");
      
      toast.success("User updated");
      setIsEditUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rate-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_type: rateForm.case_type,
          material: rateForm.material,
          price: parseFloat(rateForm.price)
        }),
      });
      if (!res.ok) throw new Error("Failed to add rate");
      toast.success("Rate added");
      setRateForm({ case_type: "", material: "", price: "" });
      fetchRates();
    } catch (err) {
      toast.error("Failed to add rate");
    }
  };

  const handleAddShade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/shades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: shadeForm.name }),
      });
      if (!res.ok) throw new Error("Failed to add shade");
      toast.success("Shade added");
      setShadeForm({ name: "" });
      fetchShades();
    } catch (err) {
      toast.error("Failed to add shade");
    }
  };

  const handleDelete = (type: 'rates' | 'shades' | 'users', id: any) => {
    setDeleteConfig({ type, id });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfig) return;
    const { type, id } = deleteConfig;
    try {
      let endpoint = "";
      if (type === 'rates') endpoint = `/api/rate-list/${id}`;
      else if (type === 'shades') endpoint = `/api/shades/${id}`;
      else endpoint = `/api/users/${id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      
      if (type === 'rates') fetchRates();
      else if (type === 'shades') fetchShades();
      else fetchUsers();
      
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setDeleteConfig(null);
    }
  };

  const handleBackup = () => {
    const data = {
      users,
      rates,
      shades,
      settings: appSettings,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental_architect_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success("Backup downloaded");
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!confirm("This will overwrite your current settings. Are you sure?")) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) {
          await handleSaveSettings(data.settings);
        }
        toast.success("Settings restored (partial restore)");
      } catch (err) {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your lab configuration, users, and data backups.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 space-y-2">
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'general' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <SettingsIcon size={20} className="mr-3" /> App Settings
            </button>
          )}
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'company' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Globe size={20} className="mr-3" /> Company Profile
          </button>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <Users size={20} className="mr-3" /> User Management
            </button>
          )}
          <button 
            onClick={() => setActiveTab('rates')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'rates' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Tag size={20} className="mr-3" /> Rate List
          </button>
          <button 
            onClick={() => setActiveTab('shades')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'shades' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Palette size={20} className="mr-3" /> Shade Management
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'company' && (
              <motion.div 
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center">
                    <Globe size={24} className="mr-3 text-emerald-500" /> Company Profile
                  </h2>
                  <button 
                    onClick={() => handleSaveSettings(appSettings)}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center"
                  >
                    <Save size={18} className="mr-2" /> Save Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Company Name</label>
                      <input 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={appSettings.company_name || ""}
                        onChange={(e) => setAppSettings({...appSettings, company_name: e.target.value})}
                        placeholder="e.g. Dental Architect Lab"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Business Address</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        value={appSettings.company_address || ""}
                        onChange={(e) => setAppSettings({...appSettings, company_address: e.target.value})}
                        placeholder="Full business address..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                        <input 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          value={appSettings.company_phone || ""}
                          onChange={(e) => setAppSettings({...appSettings, company_phone: e.target.value})}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                        <input 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          value={appSettings.company_email || ""}
                          onChange={(e) => setAppSettings({...appSettings, company_email: e.target.value})}
                          placeholder="lab@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tax ID / VAT Number</label>
                      <input 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={appSettings.company_tax_id || ""}
                        onChange={(e) => setAppSettings({...appSettings, company_tax_id: e.target.value})}
                        placeholder="NTN or VAT registration..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Website URL</label>
                      <input 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={appSettings.company_website || ""}
                        onChange={(e) => setAppSettings({...appSettings, company_website: e.target.value})}
                        placeholder="https://www.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Logo URL</label>
                      <div className="flex gap-4">
                        <input 
                          className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          value={appSettings.company_logo || ""}
                          onChange={(e) => setAppSettings({...appSettings, company_logo: e.target.value})}
                          placeholder="https://path-to-your-logo.png"
                        />
                        {appSettings.company_logo && (
                          <div className="w-12 h-12 rounded-xl border border-zinc-200 overflow-hidden bg-white flex items-center justify-center p-1">
                            <img src={appSettings.company_logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Currency Symbol</label>
                      <input 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={appSettings.currency_symbol || "$"}
                        onChange={(e) => setAppSettings({...appSettings, currency_symbol: e.target.value})}
                        placeholder="$"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <section className="space-y-6">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center">
                    <RefreshCw size={24} className="mr-3 text-emerald-500" /> Backup Preferences
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-900">Auto-Backup</p>
                        <p className="text-xs text-zinc-500">Automatically backup data daily</p>
                      </div>
                      <button 
                        onClick={() => handleSaveSettings({ auto_backup: appSettings.auto_backup === 'true' ? 'false' : 'true' })}
                        className={`w-12 h-6 rounded-full transition-all relative ${appSettings.auto_backup === 'true' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.auto_backup === 'true' ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-900">Backup on Exit</p>
                        <p className="text-xs text-zinc-500">Prompt for backup when closing app</p>
                      </div>
                      <button 
                        onClick={() => handleSaveSettings({ backup_on_exit: appSettings.backup_on_exit === 'true' ? 'false' : 'true' })}
                        className={`w-12 h-6 rounded-full transition-all relative ${appSettings.backup_on_exit === 'true' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.backup_on_exit === 'true' ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-6 pt-8 border-t border-zinc-100">
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center">
                    <HardDrive size={24} className="mr-3 text-emerald-500" /> Data Management
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={handleBackup}
                      className="flex items-center px-6 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                    >
                      <Download size={20} className="mr-2" /> Download Backup (.json)
                    </button>
                    <label className="flex items-center px-6 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-50 transition-all cursor-pointer shadow-sm">
                      <Upload size={20} className="mr-2 text-emerald-500" /> 
                      Restore from Backup
                      <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    * Restoring a backup will overwrite all current data in the database. Please be careful.
                  </p>
                </section>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">User Accounts</h2>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{users.length} Total Users</span>
                </div>

                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <input 
                    required
                    placeholder="Username"
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={userForm.username}
                    onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  />
                  <input 
                    required
                    type="password"
                    placeholder="Password"
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  />
                  <select 
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as any})}
                  >
                    <option value="Staff">Staff (View Only)</option>
                    <option value="Manager">Manager (Operations)</option>
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Doctor">Doctor (Specific Doctor)</option>
                  </select>
                  {userForm.role === 'Doctor' && (
                    <select
                      className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={userForm.doctor_id}
                      onChange={(e) => setUserForm({...userForm, doctor_id: e.target.value})}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc: any) => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))}
                    </select>
                  )}
                  <button type="submit" className={`bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center ${userForm.role === 'Doctor' ? 'md:col-span-4' : ''}`}>
                    <Plus size={20} className="mr-2" /> Add User
                  </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-zinc-100">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-zinc-900">{user.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : user.role === 'Doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.role}
                            </span>
                            {user.role === 'Doctor' && user.doctor_name && (
                              <span className="ml-2 text-xs text-zinc-500">
                                ({user.doctor_name})
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete('users' as any, user.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              disabled={user.username === 'admin'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center">
                    <Shield size={18} className="mr-2 text-emerald-500" /> Role Permissions Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-zinc-200">
                      <p className="font-bold text-xs text-zinc-900 mb-2">Staff</p>
                      <ul className="text-[10px] text-zinc-500 space-y-1">
                        <li>• View cases & doctors</li>
                        <li>• View reports</li>
                        <li>• Cannot edit financial data</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-zinc-200">
                      <p className="font-bold text-xs text-zinc-900 mb-2">Doctor</p>
                      <ul className="text-[10px] text-zinc-500 space-y-1">
                        <li>• View own cases only</li>
                        <li>• View own invoices</li>
                        <li>• Request new cases</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-zinc-200">
                      <p className="font-bold text-xs text-zinc-900 mb-2">Manager</p>
                      <ul className="text-[10px] text-zinc-500 space-y-1">
                        <li>• Manage all cases</li>
                        <li>• Manage invoices & payments</li>
                        <li>• Manage rate list & shades</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-zinc-200">
                      <p className="font-bold text-xs text-zinc-900 mb-2">Admin</p>
                      <ul className="text-[10px] text-zinc-500 space-y-1">
                        <li>• Everything in Manager</li>
                        <li>• User management</li>
                        <li>• Backup & Restore</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rates' && (
              <motion.div 
                key="rates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">Rate List</h2>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{rates.length} Items</span>
                </div>

                <form onSubmit={handleAddRate} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <input 
                    required
                    placeholder="Case Type (e.g. Crown)"
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={rateForm.case_type}
                    onChange={(e) => setRateForm({...rateForm, case_type: e.target.value})}
                  />
                  <input 
                    required
                    placeholder="Material (e.g. Zirconia)"
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={rateForm.material}
                    onChange={(e) => setRateForm({...rateForm, material: e.target.value})}
                  />
                  <input 
                    required
                    type="number"
                    placeholder="Price ($)"
                    className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={rateForm.price}
                    onChange={(e) => setRateForm({...rateForm, price: e.target.value})}
                  />
                  <button type="submit" className="bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center">
                    <Plus size={20} className="mr-2" /> Add Rate
                  </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-zinc-100">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Case Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {rates.map((rate: any) => (
                        <tr key={rate.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-zinc-900">{rate.case_type}</td>
                          <td className="px-6 py-4 text-zinc-600">{rate.material}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">${rate.price.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDelete('rates', rate.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'shades' && (
              <motion.div 
                key="shades"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">Available Shades</h2>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{shades.length} Shades</span>
                </div>

                <form onSubmit={handleAddShade} className="flex gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <input 
                    required
                    placeholder="Shade Name (e.g. A1, B2)"
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={shadeForm.name}
                    onChange={(e) => setShadeForm({...shadeForm, name: e.target.value})}
                  />
                  <button type="submit" className="px-8 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center">
                    <Plus size={20} className="mr-2" /> Add Shade
                  </button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {shades.map((shade: any) => (
                    <div key={shade.id} className="group relative p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                      <span className="font-bold text-zinc-900">{shade.name}</span>
                      <button 
                        onClick={() => handleDelete('shades', shade.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditUserModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900">Edit User</h2>
                <button onClick={() => setIsEditUserModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Username</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({...editUserForm, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">New Password (leave blank to keep current)</label>
                  <input 
                    type="password"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm({...editUserForm, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Role</label>
                  <select 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value as any})}
                    disabled={editingUser?.username === 'admin'}
                  >
                    <option value="Staff">Staff (View Only)</option>
                    <option value="Manager">Manager (Operations)</option>
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Doctor">Doctor (Specific Doctor)</option>
                  </select>
                </div>
                {editUserForm.role === 'Doctor' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">Linked Doctor</label>
                    <select
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={editUserForm.doctor_id}
                      onChange={(e) => setEditUserForm({...editUserForm, doctor_id: e.target.value})}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc: any) => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Update User</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
