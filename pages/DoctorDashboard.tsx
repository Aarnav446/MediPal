import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus, getDoctorSettings, saveDoctorSettings } from '../services/db';
import { Appointment } from '../types';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [modes, setModes] = useState({ online: true, clinic: true });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchAppointments = () => {
    if (user && user.role === 'doctor' && user.doctorId) {
      const data = getDoctorAppointments(user.doctorId);
      setAppointments(data);
    }
  };

  const fetchSettings = () => {
      if (user && user.role === 'doctor' && user.doctorId) {
          const settings = getDoctorSettings(user.doctorId);
          setModes(settings.modes);
          setTimeSlots(settings.timeSlots);
      }
  }

  useEffect(() => {
    if (user?.role === 'doctor') {
        fetchAppointments();
        fetchSettings();
        setLoading(false);
    }
  }, [user]);

  const handleStatusUpdate = (id: number, status: 'completed' | 'cancelled') => {
      updateAppointmentStatus(id, status);
      fetchAppointments();
  };

  const handleSaveSettings = () => {
      if (user?.doctorId) {
          setSavingSettings(true);
          // Simulate simple delay
          setTimeout(() => {
              saveDoctorSettings(user.doctorId!, modes, timeSlots);
              setSavingSettings(false);
              alert("Settings saved successfully.");
          }, 600);
      }
  };

  const toggleTimeSlot = (slot: string) => {
      if (timeSlots.includes(slot)) {
          setTimeSlots(timeSlots.filter(s => s !== slot));
      } else {
          setTimeSlots([...timeSlots, slot].sort());
      }
  };

  const POSSIBLE_SLOTS = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
      '15:30', '16:00', '16:30', '17:00'
  ];

  if (!user || user.role !== 'doctor') {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl text-red-600">Access Denied. Doctor privileges required.</h2>
        </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'confirmed');
  const past = appointments.filter(a => a.status !== 'confirmed');

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, <span className="text-medical-600 font-semibold">{user.name}</span></p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Appointments
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Availability Settings
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <svg className="animate-spin h-8 w-8 text-medical-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      ) : activeTab === 'appointments' ? (
        <div className="space-y-8 animate-fade-in">
            {/* Upcoming Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Upcoming Appointments</h3>
                    <span className="bg-medical-100 text-medical-700 text-xs px-2 py-1 rounded-full">{upcoming.length}</span>
                </div>
                
                {upcoming.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <p>No upcoming appointments scheduled.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Condition</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {upcoming.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {apt.patient_name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{apt.patient_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(apt.date).toLocaleDateString()} <span className="text-xs text-slate-400">at {apt.time}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded font-semibold capitalize ${apt.type === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                {apt.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 max-w-xs truncate" title={apt.condition_summary}>{apt.condition_summary}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="text-green-600 hover:text-green-900 mr-4">Complete</button>
                                            <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Past Section */}
            {past.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-80">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-600">Past History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <tbody className="bg-white divide-y divide-slate-200">
                                {past.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{apt.patient_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(apt.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{apt.condition_summary}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-fade-in max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Availability Management</h2>
              
              <div className="space-y-8">
                  {/* Modes */}
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Consultation Modes</label>
                      <div className="flex gap-4">
                          <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${modes.online ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                checked={modes.online} 
                                onChange={(e) => setModes({...modes, online: e.target.checked})}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className={`font-medium ${modes.online ? 'text-indigo-900' : 'text-slate-600'}`}>Online Video Consult</span>
                          </label>
                          <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${modes.clinic ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                checked={modes.clinic} 
                                onChange={(e) => setModes({...modes, clinic: e.target.checked})}
                                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <span className={`font-medium ${modes.clinic ? 'text-emerald-900' : 'text-slate-600'}`}>In-Clinic Visit</span>
                          </label>
                      </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Available Time Slots (Daily)</label>
                      <p className="text-xs text-slate-500 mb-4">Select the hours you are available to accept bookings.</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {POSSIBLE_SLOTS.map(slot => (
                              <button
                                key={slot}
                                onClick={() => toggleTimeSlot(slot)}
                                className={`px-2 py-2 text-sm rounded border transition-colors ${
                                    timeSlots.includes(slot) 
                                    ? 'bg-medical-600 text-white border-medical-600' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-medical-300'
                                }`}
                              >
                                  {slot}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
                          {savingSettings ? (
                               <>
                                 <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Saving...
                               </>
                          ) : 'Save Changes'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DoctorDashboard;