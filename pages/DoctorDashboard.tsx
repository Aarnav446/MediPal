
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDoctorAppointments, updateAppointmentStatus, getDoctorSettings, saveDoctorSettings, getDoctorProfile, updateDoctorProfile, createVerificationRequest, getDoctorVerificationStatus, getDoctorCompetencyHistory } from '../services/db';
import { Appointment, Doctor, CompetencyResult } from '../types';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'profile'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [competencyHistory, setCompetencyHistory] = useState<CompetencyResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [modes, setModes] = useState({ online: true, clinic: true });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // Verification State
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>('none');
  const [uploadDocs, setUploadDocs] = useState<{license: File | null, degree: File | null}>({ license: null, degree: null });

  // Missing Survey State
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);

  useEffect(() => {
    if (user?.role === 'doctor' && user.doctorId) {
        setAppointments(getDoctorAppointments(user.doctorId));
        
        const settings = getDoctorSettings(user.doctorId);
        setModes(settings.modes);
        setTimeSlots(settings.timeSlots);
        
        const profile = getDoctorProfile(user.doctorId);
        setDoctorProfile(profile);
        
        if (profile && (!profile.specialties || profile.specialties.length <= 1)) {
            setShowSurveyPrompt(true);
        }

        setVerificationStatus(getDoctorVerificationStatus(user.doctorId));
        setCompetencyHistory(getDoctorCompetencyHistory(user.doctorId));
        
        setLoading(false);
    }
  }, [user]);

  const handleStatusUpdate = (id: number, status: 'completed' | 'cancelled') => {
      updateAppointmentStatus(id, status);
      if(user?.doctorId) setAppointments(getDoctorAppointments(user.doctorId));
  };

  const handleSaveSettings = () => {
      if (user?.doctorId) {
          saveDoctorSettings(user.doctorId!, modes, timeSlots);
          alert("Settings saved.");
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'degree') => {
      if (e.target.files && e.target.files[0]) {
          setUploadDocs(prev => ({ ...prev, [type]: e.target.files![0] }));
      }
  };

  const handleSubmitVerification = () => {
      if (!user?.doctorId) return;
      if (!uploadDocs.license || !uploadDocs.degree) {
          alert("Please upload both License and Degree.");
          return;
      }
      
      createVerificationRequest(user.doctorId, user.name, uploadDocs.license.name, uploadDocs.degree.name);
      setVerificationStatus('pending');
      alert("Verification request submitted to Admin.");
  };

  const toggleTimeSlot = (slot: string) => {
      if (timeSlots.includes(slot)) {
          setTimeSlots(timeSlots.filter(s => s !== slot));
      } else {
          setTimeSlots([...timeSlots, slot].sort());
      }
  };

  const POSSIBLE_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  if (!user || user.role !== 'doctor') return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="text-slate-600">Welcome, {user.name}</p>
        </div>
        
        {showSurveyPrompt && (
            <a 
                href="#/join-doctor" 
                className="px-6 py-3 bg-amber-500 text-white rounded-lg shadow-md hover:bg-amber-600 animate-pulse font-bold text-sm flex items-center gap-2"
                title="Your profile is incomplete"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Start Competency Survey
            </a>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200">
          {['appointments', 'settings', 'profile'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-medical-600 text-medical-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                      {appointments.map(apt => (
                          <tr key={apt.id}>
                              <td className="px-6 py-4 whitespace-nowrap">{apt.patient_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(apt.date).toLocaleDateString()} {apt.time}</td>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">{apt.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${apt.status==='confirmed'?'bg-green-100 text-green-800':'bg-slate-100'}`}>{apt.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  {apt.status === 'confirmed' && (
                                      <div className="flex gap-2">
                                          <button onClick={() => handleStatusUpdate(apt.id, 'completed')} className="text-green-600 hover:text-green-800 text-sm font-medium">Complete</button>
                                          <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="text-red-600 hover:text-red-800 text-sm font-medium">Cancel</button>
                                      </div>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {appointments.length === 0 && <div className="p-8 text-center text-slate-500">No appointments found.</div>}
          </div>
      )}

      {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Consultation Modes</h3>
              <div className="flex gap-6 mb-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={modes.online} onChange={e => setModes({...modes, online: e.target.checked})} className="w-5 h-5 text-medical-600 rounded" />
                      <span>Online Video</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={modes.clinic} onChange={e => setModes({...modes, clinic: e.target.checked})} className="w-5 h-5 text-medical-600 rounded" />
                      <span>In-Clinic</span>
                  </label>
              </div>

              <h3 className="font-bold text-lg mb-4">Time Slots</h3>
              <div className="grid grid-cols-4 gap-3 mb-8">
                  {POSSIBLE_SLOTS.map(slot => (
                      <button 
                        key={slot} 
                        onClick={() => toggleTimeSlot(slot)}
                        className={`py-2 rounded border ${timeSlots.includes(slot) ? 'bg-medical-600 text-white border-medical-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                          {slot}
                      </button>
                  ))}
              </div>

              <button onClick={handleSaveSettings} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Save Changes</button>
          </div>
      )}

      {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                      <img src={doctorProfile?.imageUrl} className="w-24 h-24 rounded-full mb-3 object-cover shadow-sm" alt="Profile" />
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {doctorProfile?.name}
                          {doctorProfile?.verified && <span className="text-blue-500" title="Verified">✓</span>}
                      </h2>
                      <p className="text-slate-500">{doctorProfile?.specialization}</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                          <span className="text-slate-500">Experience</span>
                          <span className="font-medium">{doctorProfile?.experience}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                          <span className="text-slate-500">Rating</span>
                          <span className="font-medium flex items-center gap-1">
                              {doctorProfile?.rating} 
                              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                           <span className="text-slate-500">Status</span>
                           <span className={`font-bold ${doctorProfile?.verified ? 'text-green-600' : 'text-slate-500'}`}>
                               {doctorProfile?.verified ? 'Verified' : 'Unverified'}
                           </span>
                      </div>
                  </div>
              </div>

              {/* Right Column: Details & Actions */}
              <div className="md:col-span-2 space-y-6">
                  
                   {/* Verification Action */}
                   <div className={`p-4 rounded-lg border flex items-center justify-between ${
                        doctorProfile?.verified ? 'bg-green-50 border-green-200 text-green-800' :
                        verificationStatus === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                        <div>
                             <div className="font-bold text-lg">
                                {doctorProfile?.verified ? '✓ Profile Verified' : 
                                    verificationStatus === 'pending' ? '⧖ Verification Pending' : '⚠ Action Required'}
                            </div>
                            <div className="text-sm">
                                {doctorProfile?.verified ? 'Your documents have been approved.' : 
                                    verificationStatus === 'pending' ? 'Admin is reviewing your documents.' : 'Please upload your License & Degree to get verified.'}
                            </div>
                        </div>
                    </div>

                    {!doctorProfile?.verified && verificationStatus !== 'pending' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-lg mb-4">Submit Verification Documents</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                                    <label className="block text-sm font-bold mb-1">Medical License</label>
                                    <input type="file" onChange={e => handleFileChange(e, 'license')} className="text-sm w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-medical-50 file:text-medical-700 hover:file:bg-medical-100" />
                                </div>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                                    <label className="block text-sm font-bold mb-1">Degree Certificate</label>
                                    <input type="file" onChange={e => handleFileChange(e, 'degree')} className="text-sm w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-medical-50 file:text-medical-700 hover:file:bg-medical-100" />
                                </div>
                            </div>
                            <button onClick={handleSubmitVerification} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Submit for Review</button>
                        </div>
                    )}

                  {/* Competency */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-lg text-slate-900">Clinical Competency</h3>
                          
                          {/* New Prominent Update Button */}
                          <a 
                            href="#/join-doctor" 
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors text-sm font-bold"
                          >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Update Profile & Competency
                          </a>
                      </div>
                      
                      <div className="mb-4">
                          <p className="text-sm text-slate-500 mb-1">Specialties</p>
                          <div className="flex flex-wrap gap-2">
                                {doctorProfile?.specialties.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">{s}</span>
                                ))}
                          </div>
                      </div>

                      <div className="space-y-2">
                           <p className="text-sm text-slate-500">Test History</p>
                           {competencyHistory.length > 0 ? (
                               competencyHistory.map((res, i) => (
                                  <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                                      <div>
                                          <span className="font-bold text-sm text-slate-800">{res.specialty}</span>
                                          <span className="text-xs text-slate-500 ml-2">({res.level})</span>
                                      </div>
                                      <span className={`text-sm font-bold ${res.passed ? 'text-green-600' : 'text-red-600'}`}>
                                          {Math.round(res.score)}%
                                      </span>
                                  </div>
                               ))
                           ) : (
                               <p className="text-sm text-slate-400 italic">No assessment history.</p>
                           )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
