
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPatientAppointments } from '../services/db';
import { Appointment } from '../types';
import { useCart } from '../context/CartContext';
import { MOCK_DOCTORS } from '../constants'; // Fallback

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'patient') {
      const data = getPatientAppointments(user.id);
      setAppointments(data);
    }
    setLoading(false);
  }, [user]);

  const upcoming = appointments.filter(a => a.status === 'confirmed');
  const lastAppointment = appointments.length > 0 ? appointments[0] : null;

  const handleRebook = () => {
      if(!lastAppointment) return;
      // In a real app we'd fetch the full doctor object from DB using doctor_id
      // For now we mock the re-add to cart flow or redirect to analyze
      window.location.hash = '#/analyze';
  };

  if (!user || user.role !== 'patient') return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
            <p className="text-slate-600">Health Overview for {user.name}</p>
        </div>
        <a href="#/analyze" className="px-6 py-3 bg-medical-600 text-white font-bold rounded-full shadow hover:bg-medical-700">
            + New Symptom Check
        </a>
      </div>

      {/* Recent Health Snapshot */}
      {lastAppointment && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-8 animate-fade-in">
              <div className="flex justify-between items-start">
                  <div>
                      <h2 className="text-lg font-bold opacity-90 uppercase tracking-wide mb-1">Recent Health Snapshot</h2>
                      <p className="text-2xl font-bold mb-2">{lastAppointment.condition_summary}</p>
                      <p className="text-indigo-100 text-sm">Consulted with Dr. (ID: {lastAppointment.doctor_id}) on {new Date(lastAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={handleRebook}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
                  >
                      Check Again / Rebook
                  </button>
              </div>
          </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-700">Appointment History</div>
            {loading ? <div className="p-6">Loading...</div> : (
                <div className="divide-y divide-slate-100">
                    {appointments.map(apt => (
                        <div key={apt.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {new Date(apt.date).getDate()}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{apt.condition_summary}</div>
                                    <div className="text-sm text-slate-500">{new Date(apt.date).toDateString()} • {apt.time}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${apt.status==='confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {apt.status}
                            </span>
                        </div>
                    ))}
                    {appointments.length === 0 && <div className="p-8 text-center text-slate-500">No history found.</div>}
                </div>
            )}
      </div>
    </div>
  );
};

export default PatientDashboard;
