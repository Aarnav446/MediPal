
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getPatientAppointments, getAllDoctors } from '../services/db';
import { Appointment } from '../types';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  useEffect(() => {
    if (user?.role === 'patient') {
      setAppointments(getPatientAppointments(user.id));
    }
  }, [user]);

  const upcoming = appointments.filter(a => a.status === 'confirmed');
  const recent = appointments.filter(a => a.status !== 'confirmed')[0]; // Most recent past appt

  const bookAgain = (apt: Appointment) => {
      const allDocs = getAllDoctors();
      const doc = allDocs.find(d => d.id === apt.doctor_id);
      if (doc) {
          addToCart({
              id: Date.now().toString(),
              doctor: doc,
              date: new Date().toISOString().split('T')[0], // Default today/tomorrow
              time: '10:00',
              type: apt.type,
              fee: 50,
              condition: apt.condition_summary
          });
          window.location.hash = '#/checkout';
      }
  };

  if (!user || user.role !== 'patient') return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Health Dashboard</h1>
      
      {/* Recent Condition Summary */}
      {recent && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Last Condition Analyzed</h3>
                  <p className="text-xl font-bold text-slate-800">{recent.condition_summary}</p>
                  <p className="text-sm text-slate-500 mt-1">Treated by Dr. {recent.patient_name} (placeholder logic) on {recent.date}</p>
              </div>
              <button onClick={() => bookAgain(recent)} className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                  Book Follow-up
              </button>
          </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Upcoming Appointments</div>
          {upcoming.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No upcoming visits.</div>
          ) : (
              upcoming.map(apt => (
                  <div key={apt.id} className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <div>
                          <p className="font-bold text-lg">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                          <p className="text-slate-500 text-sm">{apt.type} Consultation</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">CONFIRMED</span>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default PatientDashboard;
