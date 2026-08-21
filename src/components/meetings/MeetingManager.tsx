import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Meeting, MeetingActionItem } from '../../types/erp';
import { 
  Users, Calendar, Clock, MapPin, CheckCircle2, 
  AlertCircle, Plus, Search, FileText, CheckSquare, 
  Send, ShieldCheck, Award, ChevronRight, X, UserCheck
} from 'lucide-react';

export const MeetingManager: React.FC = () => {
  const { 
    meetings, createMeeting, updateMeeting, publishMeetingMinutes,
    meetingActionItems, addMeetingActionItem, updateActionItemStatus,
    language, currentUser, showToast 
  } = useERP();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ec' | 'board' | 'action-items'>('dashboard');

  // Modals State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [mtgType, setMtgType] = useState<Meeting['meetingType']>('EC_MEETING');
  const [mtgTitle, setMtgTitle] = useState('');
  const [mtgDate, setMtgDate] = useState(new Date().toISOString().split('T')[0]);
  const [mtgTime, setMtgTime] = useState('11:00 AM');
  const [mtgLocation, setMtgLocation] = useState('Conference Room, Level 8, Gulshan Tower, Dhaka');
  const [mtgChairperson, setMtgChairperson] = useState('Al-Haj Engr. Tayeebur Rahman (Chairman)');
  const [mtgSecretary, setMtgSecretary] = useState('Md. Reazul Islam (Company Secretary)');
  const [mtgAgendas, setMtgAgendas] = useState('1. Review Q3 Project Progress\n2. Approval of Site Land Acquisition\n3. Financial Budget Allocations');

  // Minutes Modal State
  const [selectedMeetingForMinutes, setSelectedMeetingForMinutes] = useState<Meeting | null>(null);
  const [minutesContent, setMinutesContent] = useState('');
  const [resolutionsContent, setResolutionsContent] = useState('');

  // Action Item Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionPerson, setActionPerson] = useState('');
  const [actionDept, setActionDept] = useState('Project & Site');
  const [actionDueDate, setActionDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionPriority, setActionPriority] = useState<MeetingActionItem['priority']>('HIGH');

  // Stats
  const ecMeetings = meetings.filter(m => m.meetingType === 'EC_MEETING');
  const boardMeetings = meetings.filter(m => m.meetingType === 'BOARD_MEETING');
  const pendingMinutes = meetings.filter(m => m.minutesStatus !== 'PUBLISHED').length;
  const pendingActions = meetingActionItems.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length;
  const completedActions = meetingActionItems.filter(a => a.status === 'COMPLETED').length;

  // Submit Meeting
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtgTitle) {
      showToast('Please enter meeting title', 'warning');
      return;
    }

    createMeeting({
      meetingType: mtgType,
      title: mtgTitle,
      meetingDate: mtgDate,
      meetingTime: mtgTime,
      location: mtgLocation,
      chairperson: mtgChairperson,
      secretary: mtgSecretary,
      agendaSummary: mtgAgendas,
      status: 'SCHEDULED',
      minutesStatus: 'DRAFT',
      members: [
        { id: '1', memberName: mtgChairperson, designation: 'Chairman', roleInMeeting: 'Chairperson', attendanceStatus: 'PRESENT' },
        { id: '2', memberName: mtgSecretary, designation: 'Company Secretary', roleInMeeting: 'Secretary', attendanceStatus: 'PRESENT' }
      ],
      agendas: mtgAgendas.split('\n').map((a, idx) => ({ id: `ag-${idx}`, itemNumber: idx + 1, title: a })),
      actionItems: []
    });

    setShowScheduleModal(false);
    setMtgTitle('');
  };

  // Submit Minutes
  const handleSaveMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingForMinutes) return;

    publishMeetingMinutes(selectedMeetingForMinutes.id, minutesContent, resolutionsContent);
    setSelectedMeetingForMinutes(null);
  };

  // Submit Action Item
  const handleSaveActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle || !actionPerson) return;

    addMeetingActionItem({
      meetingId: meetings[0]?.id || 'GENERAL',
      title: actionTitle,
      responsiblePerson: actionPerson,
      department: actionDept,
      dueDate: actionDueDate,
      priority: actionPriority,
      status: 'PENDING'
    });

    setShowActionModal(false);
    setActionTitle('');
    setActionPerson('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isBn ? "মিটিং ও কার্যবিবরণী ম্যানেজমেন্ট" : "Meeting & Minutes Governance"}
            </h1>
            <p className="text-xs text-slate-400">
              {isBn ? "ইসি মিটিং, বোর্ড মিটিং, রেজুলিউশন ও অ্যাকশন আইটেম ট্র্যাকিং" : "Executive Committee, Board Meetings, Formal Resolutions & Action Item Tracking"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setMtgType('EC_MEETING'); setShowScheduleModal(true); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {isBn ? "+ ইসি মিটিং শিডিউল" : "+ Schedule EC Meeting"}
          </button>
          <button
            onClick={() => { setMtgType('BOARD_MEETING'); setShowScheduleModal(true); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {isBn ? "+ বোর্ড মিটিং শিডিউল" : "+ Schedule Board Meeting"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'dashboard', label: isBn ? "মিটিং ড্যাশবোর্ড" : "Meeting Dashboard", icon: Calendar },
          { id: 'ec', label: isBn ? "ইসি মিটিং (EC Meetings)" : "EC Meetings", icon: UserCheck },
          { id: 'board', label: isBn ? "বোর্ড মিটিং (Board Meetings)" : "Board Meetings", icon: Award },
          { id: 'action-items', label: isBn ? "অ্যাকশন আইটেম ট্র্যাকিং" : "Action Items Tracking", icon: CheckSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MEETING DASHBOARD VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meetings Held</span>
                <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Calendar className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-white mt-3">{meetings.length} Meetings</div>
              <div className="text-[11px] text-slate-400 mt-2">{ecMeetings.length} EC • {boardMeetings.length} Board</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Minutes</span>
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Clock className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-3">{pendingMinutes} Drafts</div>
              <div className="text-[11px] text-slate-400 mt-2">Awaiting formal board signature</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Action Items</span>
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><CheckSquare className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-cyan-400 mt-3">{pendingActions} Tasks</div>
              <div className="text-[11px] text-slate-400 mt-2">In progress across departments</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-3">{completedActions} Done</div>
              <div className="text-[11px] text-emerald-400 mt-2">Resolutions implemented</div>
            </div>
          </div>

          {/* Upcoming & Recent Meetings List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Scheduled & Recent Meetings
              </h3>
            </div>

            {meetings.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No meetings recorded yet. Use the buttons above to schedule an EC Meeting or Board Meeting.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {meetings.map(m => (
                  <div key={m.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.meetingType === 'BOARD_MEETING' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {m.meetingType === 'BOARD_MEETING' ? 'Board Meeting' : 'EC Meeting'}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">{m.meetingNo}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm">{m.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {m.meetingDate} at {m.meetingTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.location}</span>
                        <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Chair: {m.chairperson}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        m.minutesStatus === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {m.minutesStatus === 'PUBLISHED' ? 'Minutes Approved & Signed' : 'Minutes Pending'}
                      </span>
                      {m.minutesStatus !== 'PUBLISHED' && (
                        <button
                          onClick={() => {
                            setSelectedMeetingForMinutes(m);
                            setMinutesContent(m.minutesText || '');
                            setResolutionsContent(m.resolutionsText || '');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg"
                        >
                          Formalize Minutes
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. EC MEETINGS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ec' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-indigo-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Meeting No</th>
                  <th className="py-3 px-4">Title & Agenda</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Chairperson</th>
                  <th className="py-3 px-4">Minutes Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ecMeetings.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">No EC meetings scheduled.</td></tr>
                ) : (
                  ecMeetings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{m.meetingNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">{m.title}</td>
                      <td className="py-3 px-4 text-slate-400">{m.meetingDate} ({m.meetingTime})</td>
                      <td className="py-3 px-4 text-slate-400">{m.location}</td>
                      <td className="py-3 px-4 text-indigo-300">{m.chairperson}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">{m.minutesStatus}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. BOARD MEETINGS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-purple-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Board Meeting No</th>
                  <th className="py-3 px-4">Subject / Title</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Chairperson</th>
                  <th className="py-3 px-4">Resolutions Passed</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {boardMeetings.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">No Board meetings recorded.</td></tr>
                ) : (
                  boardMeetings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{m.meetingNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">{m.title}</td>
                      <td className="py-3 px-4 text-slate-400">{m.meetingDate} ({m.meetingTime})</td>
                      <td className="py-3 px-4 text-purple-300">{m.chairperson}</td>
                      <td className="py-3 px-4 text-slate-400">{m.resolutionsText ? 'Formalized' : 'In Discussion'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400">{m.minutesStatus}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ACTION ITEMS TRACKING TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'action-items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Meeting Directives & Action Items Tracker</h3>
              <p className="text-xs text-slate-400">Track assigned tasks with responsible officer and deadlines</p>
            </div>
            <button
              onClick={() => setShowActionModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Create Action Item
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Directive / Task</th>
                  <th className="py-3 px-4">Responsible Person</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {meetingActionItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No action items logged. Click <strong>+ Create Action Item</strong> to add tasks.
                    </td>
                  </tr>
                ) : (
                  meetingActionItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{item.actionCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{item.title}</td>
                      <td className="py-3 px-4 text-indigo-300 font-bold">{item.responsiblePerson}</td>
                      <td className="py-3 px-4 text-slate-400">{item.department}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{item.dueDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400' :
                          item.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => updateActionItemStatus(item.id, 'COMPLETED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Schedule {mtgType === 'BOARD_MEETING' ? 'Board Meeting' : 'EC Meeting'}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Meeting Title / Agenda Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14th Executive Committee Meeting on Land Development"
                  value={mtgTitle}
                  onChange={(e) => setMtgTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Date</label>
                  <input
                    type="date"
                    required
                    value={mtgDate}
                    onChange={(e) => setMtgDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Time</label>
                  <input
                    type="text"
                    required
                    value={mtgTime}
                    onChange={(e) => setMtgTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Meeting Location</label>
                <input
                  type="text"
                  required
                  value={mtgLocation}
                  onChange={(e) => setMtgLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Chairperson</label>
                  <input
                    type="text"
                    required
                    value={mtgChairperson}
                    onChange={(e) => setMtgChairperson(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Secretary</label>
                  <input
                    type="text"
                    required
                    value={mtgSecretary}
                    onChange={(e) => setMtgSecretary(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Agendas & Discussion Points</label>
                <textarea
                  rows={3}
                  value={mtgAgendas}
                  onChange={(e) => setMtgAgendas(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMALIZE MINUTES MODAL */}
      {selectedMeetingForMinutes && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Formalize Minutes: {selectedMeetingForMinutes.meetingNo}</h3>
              <button onClick={() => setSelectedMeetingForMinutes(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMinutes} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Meeting Minutes Discussion</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record formal discussion points..."
                  value={minutesContent}
                  onChange={(e) => setMinutesContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-bold">Formal Resolutions Adopted</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Unanimously resolved that..."
                  value={resolutionsContent}
                  onChange={(e) => setResolutionsContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setSelectedMeetingForMinutes(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">Approve & Publish Minutes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ACTION ITEM MODAL */}
      {showActionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Create Action Item Directive</h3>
              <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveActionItem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold">Directive / Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete soil test for Block C"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Responsible Officer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    value={actionPerson}
                    onChange={(e) => setActionPerson(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Department</label>
                  <select
                    value={actionDept}
                    onChange={(e) => setActionDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="Project & Site">Project & Site</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Legal & Land">Legal & Land</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={actionDueDate}
                    onChange={(e) => setActionDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold">Priority</label>
                  <select
                    value={actionPriority}
                    onChange={(e) => setActionPriority(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white mt-1"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowActionModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold">Assign Action Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
