import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatBDT } from '../../utils/pdfGenerator';
import { Project } from '../../types/erp';
import { 
  Building, MapPin, Layers, CheckCircle2, TrendingUp, Plus, 
  Edit3, Trash2, X, Sparkles, FolderPlus, Compass, DollarSign, Calendar 
} from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const { projects, plots, language, setCurrentTab, addProject, updateProject, deleteProject, showConfirm, showToast } = useERP();
  const isBn = language === 'bn';

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [totalLandAreaDecimal, setTotalLandAreaDecimal] = useState<number>(100);
  const [totalPlots, setTotalPlots] = useState<number>(30);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Ongoing');
  const [launchDate, setLaunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2028-12-31');
  const [projectManager, setProjectManager] = useState('Engr. Tayeebur Rahman');
  const [developmentBudget, setDevelopmentBudget] = useState<number>(50000000);

  const resetForm = () => {
    setName('');
    setCode('');
    setLocation('');
    setTotalLandAreaDecimal(100);
    setTotalPlots(30);
    setDescription('');
    setStatus('Ongoing');
    setLaunchDate(new Date().toISOString().split('T')[0]);
    setExpectedCompletionDate('2028-12-31');
    setProjectManager('Engr. Tayeebur Rahman');
    setDevelopmentBudget(50000000);
    setEditingProject(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setCode(p.code);
    setLocation(p.location);
    setTotalLandAreaDecimal(p.totalLandAreaDecimal);
    setTotalPlots(p.totalPlots);
    setDescription(p.description);
    setStatus(p.status);
    setLaunchDate(p.launchDate);
    setExpectedCompletionDate(p.expectedCompletionDate);
    setProjectManager(p.projectManager);
    setDevelopmentBudget(p.developmentBudget);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !location.trim()) {
      showToast('Please fill in all required fields (Name, Code, Location)', 'warning');
      return;
    }

    if (editingProject) {
      updateProject({
        ...editingProject,
        name,
        code: code.toUpperCase(),
        location,
        totalLandAreaDecimal: Number(totalLandAreaDecimal),
        totalPlots: Number(totalPlots),
        description,
        status,
        launchDate,
        expectedCompletionDate,
        projectManager,
        developmentBudget: Number(developmentBudget)
      });
    } else {
      addProject({
        name,
        code: code.toUpperCase(),
        location,
        totalLandAreaDecimal: Number(totalLandAreaDecimal),
        totalPlots: Number(totalPlots),
        description,
        status,
        launchDate,
        expectedCompletionDate,
        projectManager,
        developmentBudget: Number(developmentBudget)
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (p: Project) => {
    showConfirm({
      title: 'Delete Housing Project?',
      message: `Are you sure you want to delete '${p.name}' (${p.code})?`,
      subtext: 'This will also remove any plots associated with this project.',
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        deleteProject(p.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-black text-white">
              {isBn ? "প্রজেক্ট ম্যানেজমেন্ট ও রিয়েল এস্টেট পোর্টফোলিও" : "Housing Project Portfolio Management"}
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-extrabold uppercase">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isBn ? "প্রজেক্ট কাঠামো: প্রজেক্ট → ব্লক → জোন → রোড → প্লট ইনভেন্টরি" : "Organize housing estates, plot inventory layouts, budgets and milestone handovers."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 transition transform active:scale-95 text-xs flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? "+ নতুন প্রজেক্ট তৈরি করুন" : "+ Add New Project"}</span>
        </button>
      </div>

      {/* Empty State when 0 Projects */}
      {projects.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-5 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">No Housing Projects Created Yet</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Your system is in a clean slate state. Start by creating your first housing estate (e.g. Tayeeba Smart City) to begin registering blocks, plots, leads, and customer bookings.
            </p>
          </div>
          <div>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-xl shadow-emerald-950/50 inline-flex items-center space-x-2 transition transform active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Project</span>
            </button>
          </div>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => {
            const prjPlots = plots.filter(pl => pl.projectId === p.id);
            const avail = prjPlots.filter(pl => pl.status === 'Available').length;
            const booked = prjPlots.filter(pl => pl.status === 'Booked').length;
            const sold = prjPlots.filter(pl => pl.status === 'Sold').length;

            return (
              <div key={p.id} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                      {p.code}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                        p.status === 'Ongoing' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                        p.status === 'Completed' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
                        'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-slate-400 hover:text-white transition rounded"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-black text-white text-base leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{p.description || 'Modern residential development project.'}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-700/60 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block font-medium">Land Area</span>
                      <strong className="text-white font-bold">{p.totalLandAreaDecimal} Decimals</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block font-medium">Total Plots</span>
                      <strong className="text-white font-bold">{p.totalPlots} Plots</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
                    <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20">
                      Avail: {avail}
                    </div>
                    <div className="bg-amber-500/10 text-amber-400 p-1.5 rounded-lg border border-amber-500/20">
                      Booked: {booked}
                    </div>
                    <div className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20">
                      Sold: {sold}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Budget: <strong className="text-emerald-400 font-bold">{formatBDT(p.developmentBudget)}</strong></span>
                    <span>Manager: <strong className="text-slate-300">{p.projectManager}</strong></span>
                  </div>

                  <button
                    onClick={() => setCurrentTab('inventory')}
                    className="w-full bg-slate-900 hover:bg-slate-700 text-emerald-300 font-bold py-2 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>View Plot Map & Inventory</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  {editingProject ? 'Edit Housing Project' : 'Create New Housing Project'}
                </h3>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-bold">Project Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tayeeba Smart City Phase 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Project Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSC-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-bold">Location & Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Savar Extension, Dhaka (Near Dhaka-Aricha Highway)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Total Land Area (Decimal)</label>
                  <input
                    type="number"
                    min="1"
                    value={totalLandAreaDecimal}
                    onChange={(e) => setTotalLandAreaDecimal(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Total Planned Plots</label>
                  <input
                    type="number"
                    min="1"
                    value={totalPlots}
                    onChange={(e) => setTotalPlots(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Development Budget (BDT ৳)</label>
                  <input
                    type="number"
                    value={developmentBudget}
                    onChange={(e) => setDevelopmentBudget(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Project Manager</label>
                  <input
                    type="text"
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Launch Date</label>
                  <input
                    type="date"
                    value={launchDate}
                    onChange={(e) => setLaunchDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Expected Completion</label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-300 font-bold">Description & Masterplan Highlights</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Premier eco-friendly smart township with 60ft wide avenues, central mosque, lake, and commercial zone."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 transition"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
