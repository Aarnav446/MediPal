
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus, getDoctorProfile, createVerificationRequest, getVerificationRequests } from '../services/db';
import { Appointment, Doctor } from '../types';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  
  // Verification State
  const [uploadDocs, setUploadDocs] = useState({ license: null, degree: null, certs: null });
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending'>('none');

  useEffect(() => {
    if (user?.role === 'doctor' && user.doctorId) {
      setAppointments(getDoctorAppointments(user.doctorId));
      setDoctorProfile(getDoctorProfile(user.doctorId));
      
      // Check if a pending request exists
      const reqs = getVerificationRequests();
      const myReq = reqs.find(r => r.doctor_id === user.doctorId && r.status === 'pending');
      if (myReq) setRequestStatus('pending');
    }
  }, [user]);

  const handleFileChange = (e: any, type: string) => {
      if (e.target.files[0]) setUploadDocs(prev => ({ ...prev, [type]: e.target.files[0].name }));
  };

  const submitVerification = () => {
      if (!user?.doctorId || !uploadDocs.license) {
          alert("License is required.");
          return;
      }
      // Create request for Admin
      createVerificationRequest(user.doctorId, user.name, {
          license: uploadDocs.license || '',
          degree: uploadDocs.degree || '',
          certs: uploadDocs.certs || ''
      });
      setRequestStatus('pending');
      alert("Documents submitted for Admin review.");
  };

  const handleStatusUpdate = (id: number, status: 'completed' | 'cancelled') => {
    updateAppointmentStatus(id, status);
    if (user?.doctorId) setAppointments(getDoctorAppointments(user.doctorId));
  };

  if (!user || user.role !== 'doctor') return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dr. {user.name}</h1>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 rounded ${activeTab === 'appointments' ? 'bg-medical-600 text-white' : 'bg-slate-100'}`}>Appointments</button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-medical-600 text-white' : 'bg-slate-100'}`}>Verification</button>
        </div>
      </div>

      {activeTab === 'appointments' ? (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {appointments.map(apt => (
                        <tr key={apt.id}>
                            <td className="px-6 py-4">{apt.patient_name}</td>
                            <td className="px-6 py-4">{apt.date} {apt.time}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{apt.status}</span></td>
                            <td className="px-6 py-4">
                                {apt.status === 'confirmed' && (
                                    <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="text-green-600 font-bold mr-2">Complete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
          <div className="bg-white rounded-xl shadow border border-slate-200 p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Verification Status</h2>
              
              <div className={`p-4 rounded-lg mb-6 border ${doctorProfile?.verified ? 'bg-green-50 border-green-200' : (requestStatus === 'pending' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200')}`}>
                  {doctorProfile?.verified ? (
                      <div className="flex items-center text-green-700 font-bold"><span className="text-2xl mr-2">✓</span> Account Verified</div>
                  ) : requestStatus === 'pending' ? (
                      <div className="flex items-center text-blue-700 font-bold"><span className="text-2xl mr-2">⧗</span> Pending Admin Review</div>
                  ) : (
                      <div className="flex items-center text-amber-700 font-bold"><span className="text-2xl mr-2">!</span> Unverified</div>
                  )}
              </div>

              {!doctorProfile?.verified && requestStatus !== 'pending' && (
                  <div className="space-y-4">
                      <div className="border p-4 rounded-lg border-dashed">
                          <label className="block text-sm font-bold mb-1">Medical License</label>
                          <input type="file" onChange={(e) => handleFileChange(e, 'license')} />
                      </div>
                      <button onClick={submitVerification} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold">Submit for Review</button>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
