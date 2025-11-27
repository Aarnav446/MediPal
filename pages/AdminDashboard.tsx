import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { VerificationRequest } from '../types';
import { getVerificationRequests, verifyDoctor } from '../services/db';
import { validateDocumentWithAI } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // AI Scan State
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Simple hardcoded check for admin in this demo. 
  // In real app, role would be checked securely.
  const isAdmin = user?.email === 'admin@medimatch.com' || user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
        setRequests(getVerificationRequests());
    }
  }, [user]);

  const handleApprove = (reqId: number, docId: string) => {
      if (confirm("Are you sure you want to verify this doctor?")) {
        verifyDoctor(reqId, docId, true);
        setRequests(prev => prev.filter(r => r.id !== reqId));
        setScanResult(null);
      }
  };

  const handleRejectClick = (reqId: number) => {
      setRejectingId(reqId);
      setRejectReason('');
      setScanResult(null);
  };

  const submitRejection = (reqId: number, docId: string) => {
      if (!rejectReason.trim()) {
          alert("Please provide a reason for rejection.");
          return;
      }
      verifyDoctor(reqId, docId, false, rejectReason);
      setRequests(prev => prev.filter(r => r.id !== reqId));
      setRejectingId(null);
  };

  const handleAIScan = async (req: VerificationRequest) => {
      setScanningId(req.id);
      setScanResult(null);
      
      try {
          // Simulate analyzing the license file
          const result = await validateDocumentWithAI("Medical License", req.license_file, req.doctor_name);
          setScanResult(result);
      } catch (e) {
          alert("AI Scan failed");
      } finally {
          setScanningId(null);
      }
  };

  if (!isAdmin) {
      return (
        <div className="p-12 text-center">
            <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
      <p className="text-slate-600 mb-8">Manage doctor verifications and platform oversight.</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              Pending Verification Requests ({requests.length})
          </div>
          
          {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">All caught up! No pending requests.</div>
          ) : (
              <div className="divide-y divide-slate-200">
                  {requests.map(req => (
                      <div key={req.id} className="p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                              
                              {/* Doctor Info */}
                              <div className="flex-1">
                                  <h3 className="text-lg font-bold text-slate-900">{req.doctor_name}</h3>
                                  <p className="text-sm text-slate-500 mb-2">ID: {req.doctor_id}</p>
                                  <p className="text-xs text-slate-400">Submitted: {new Date(req.submitted_at).toLocaleDateString()}</p>
                              </div>

                              {/* Documents Preview */}
                              <div className="flex-1 space-y-2">
                                  <div className="font-semibold text-sm text-slate-700 mb-1">Documents Submitted:</div>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      {req.license_file} (Preview)
                                  </a>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                      {req.degree_file} (Preview)
                                  </a>
                                  
                                  {/* AI Scan Button */}
                                  <button 
                                      onClick={() => handleAIScan(req)}
                                      disabled={scanningId === req.id}
                                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-900 transition-colors"
                                  >
                                      {scanningId === req.id ? (
                                           <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      ) : (
                                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      )}
                                      AI Security Scan
                                  </button>
                              </div>

                              {/* Actions */}
                              <div className="flex-1 flex flex-col items-end gap-2">
                                  {rejectingId === req.id ? (
                                      <div className="w-full max-w-xs animate-fade-in">
                                          <textarea 
                                              className="w-full p-2 text-sm border border-red-300 rounded focus:ring-red-500 mb-2"
                                              placeholder="Reason for rejection..."
                                              rows={2}
                                              value={rejectReason}
                                              onChange={(e) => setRejectReason(e.target.value)}
                                          />
                                          <div className="flex gap-2 justify-end">
                                              <button onClick={() => setRejectingId(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                              <button 
                                                  onClick={() => submitRejection(req.id, req.doctor_id)} 
                                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                              >
                                                  Confirm Reject
                                              </button>
                                          </div>
                                      </div>
                                  ) : (
                                      <>
                                        <button 
                                            onClick={() => handleApprove(req.id, req.doctor_id)}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleRejectClick(req.id)}
                                            className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                      </>
                                  )}
                              </div>
                          </div>
                          
                          {/* Scan Result Display */}
                          {scanResult && scanningId !== req.id && (
                              <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200 animate-fade-in">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold text-sm text-slate-800">AI Analysis Report</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                          scanResult.verdict === 'Authentic' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                          {scanResult.verdict}
                                      </span>
                                      <span className="text-xs text-slate-500 ml-auto">Score: {scanResult.authenticity_score}/100</span>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{scanResult.reasoning}</p>
                                  {scanResult.flags && scanResult.flags.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                          {scanResult.flags.map((flag: string, i: number) => (
                                              <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                                                  {flag}
                                              </span>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default AdminDashboard;
