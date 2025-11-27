import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPatientAppointments } from '../services/db';
import { Appointment } from '../types';
import { MOCK_DOCTORS } from '../constants';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'patient') {
      const data = getPatientAppointments(user.id);
      setAppointments(data);
    }
    setLoading(false);
  }, [user]);

  // Helper to get doctor details for display
  const getDoctorDetails = (id: string) => {
    return MOCK_DOCTORS.find(d => d.id === id) || { name: 'Unknown Doctor', specialization: 'Specialist', imageUrl: 'https://via.placeholder.com/50' };
  };

  if (!user || user.role !== 'patient') {
    return (
        <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
             <div className="bg-red-50 p-6 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
            <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
            <p className="text-slate-500 mt-2">This dashboard is for patients only.</p>
        </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'confirmed');
  const history = appointments.filter(a => a.status !== 'confirmed');

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">My Health Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your appointments and view history.</p>
        </div>
        <a 
            href="#/analyze" 
            className="flex items-center gap-2 px-6 py-3 bg-medical-600 text-white font-semibold rounded-full shadow-lg hover:bg-medical-700 hover:-translate-y-0.5 transition-all"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Symptom Check
        </a>
      </div>

      <div className="space-y-8">
        
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Upcoming Appointments
                </h3>
            </div>
            
            {loading ? (
                 <div className="flex justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-medical-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 </div>
            ) : upcoming.length === 0 ? (
                <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-lg font-medium text-slate-700">No upcoming appointments</p>
                    <p className="text-sm mt-1">Use the symptom checker to find a specialist.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {upcoming.map((apt) => {
                        const doctor = getDoctorDetails(apt.doctor_id);
                        return (
                            <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center">
                                {/* Date Box */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                                    <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-grow">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                        <h4 className="text-lg font-bold text-slate-900">{doctor.name}</h4>
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 uppercase tracking-wide border border-green-200 mt-2 md:mt-0 w-fit">
                                            {apt.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-medical-600 mb-1">{doctor.specialization}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                        2.1 km away • In-person Visit
                                    </p>
                                </div>

                                {/* Condition Summary */}
                                <div className="md:w-1/3 bg-slate-100 p-3 rounded-lg text-sm text-slate-600 border border-slate-200">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Reason for Visit</span>
                                    {apt.condition_summary}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Past History */}
        {history.length > 0 && (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-90">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-md font-bold text-slate-600">Past Appointments</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {history.map((apt) => {
                         const doctor = getDoctorDetails(apt.doctor_id);
                         return (
                            <div key={apt.id} className="p-4 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-slate-800">{doctor.name}</span>
                                    <span className="text-slate-500 mx-2">-</span>
                                    <span className="text-slate-500">{new Date(apt.date).toLocaleDateString()}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {apt.status}
                                </span>
                            </div>
                         )
                    })}
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;