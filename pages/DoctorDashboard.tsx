import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus } from '../services/db';
import { Appointment } from '../types';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    if (user && user.role === 'doctor' && user.doctorId) {
      const data = getDoctorAppointments(user.doctorId);
      setAppointments(data);
    }
  };

  useEffect(() => {
    fetchAppointments();
    setLoading(false);
  }, [user]);

  const handleStatusUpdate = (id: number, status: 'completed' | 'cancelled') => {
      updateAppointmentStatus(id, status);
      fetchAppointments();
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, <span className="text-medical-600 font-semibold">{user.name}</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm">
            <span className="text-slate-500">Pending Appointments:</span> 
            <span className="ml-2 font-bold text-slate-900">{upcoming.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <svg className="animate-spin h-8 w-8 text-medical-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      ) : (
        <div className="space-y-8">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Condition Summary</th>
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
                                            {new Date(apt.date).toLocaleDateString()} <span className="text-xs text-slate-400">at 10:00 AM</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 max-w-xs truncate">{apt.condition_summary}</div>
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
      )}
    </div>
  );
};

export default DoctorDashboard;