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
  
  // AI Scan State - Stores the request ID alongside the data to ensure correct display
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<{ id: number; data: any } | null>(null);

  // Simple hardcoded check for admin in this demo. 
  const isAdmin = user?.email === 'admin@gmail.com' || user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
        setRequests(getVerificationRequests());
    }
  }, [user, isAdmin]);

  const handleApprove = (reqId: number, docId: string) => {
      if (window.confirm("Are you sure you want to verify this doctor?")) {
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
          setScanResult({ id: req.id, data: result });
      } catch (e) {
          alert("AI Scan failed");
          console.error(e);
      } finally {
          setScanningId(null);
      }
  };

  if (!isAdmin) {
      return (
        <div className="p-12 text-center">
            <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
            <p className="text-slate-500 mt-2">You must be logged in as an administrator to view this page.</p>
        </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
      <p className="text-slate-600 mb-8">Manage doctor verifications and platform oversight.</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
              <span>Pending Verification Requests</span>
              <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs">{requests.length}</span>
          </div>
          
          {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  All caught up! No pending requests.
              </div>
          ) : (
              <div className="divide-y divide-slate-200">
                  {requests.map(req => (
                      <div key={req.id} className="p-6 transition-colors hover:bg-slate-50/50">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                              
                              {/* Doctor Info */}
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-lg font-bold text-slate-900">{req.doctor_name}</h3>
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">Pending</span>
                                  </div>
                                  <p className="text-sm text-slate-500 mb-2 font-mono">ID: {req.doctor_id}</p>
                                  <p className="text-xs text-slate-400">Submitted: {new Date(req.submitted_at).toLocaleDateString()}</p>
                              </div>

                              {/* Documents Preview */}
                              <div className="flex-1 space-y-2">
                                  <div className="font-semibold text-sm text-slate-700 mb-1">Documents Submitted:</div>
                                  <div className="flex gap-2">
                                      <a href="#/admin-dashboard" onClick={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors" title={req.license_file}>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                          <span className="truncate max-w-[100px]">License</span>
                                      </a>
                                      <a href="#/admin-dashboard" onClick={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors" title={req.degree_file}>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                          <span className="truncate max-w-[100px]">Degree</span>
                                      </a>
                                  </div>
                                  
                                  {/* AI Scan Button */}
                                  <button 
                                      onClick={() => handleAIScan(req)}
                                      disabled={scanningId === req.id}
                                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                  >
                                      {scanningId === req.id ? (
                                           <>
                                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                              Scanning Documents...
                                           </>
                                      ) : (
                                           <>
                                              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                              AI Security Scan
                                           </>
                                      )}
                                  </button>
                              </div>

                              {/* Actions */}
                              <div className="flex-1 flex flex-col items-end gap-2">
                                  {rejectingId === req.id ? (
                                      <div className="w-full max-w-xs animate-fade-in bg-red-50 p-3 rounded-lg border border-red-100">
                                          <label className="block text-xs font-bold text-red-800 mb-1">Reason for Rejection</label>
                                          <textarea 
                                              className="w-full p-2 text-sm border border-red-300 rounded focus:ring-red-500 outline-none mb-2"
                                              placeholder="E.g., Document blurry, Name mismatch..."
                                              rows={2}
                                              value={rejectReason}
                                              onChange={(e) => setRejectReason(e.target.value)}
                                          />
                                          <div className="flex gap-2 justify-end">
                                              <button onClick={() => setRejectingId(null)} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                                              <button 
                                                  onClick={() => submitRejection(req.id, req.doctor_id)} 
                                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-bold"
                                              >
                                                  Confirm Reject
                                              </button>
                                          </div>
                                      </div>
                                  ) : (
                                      <>
                                        <button 
                                            onClick={() => handleApprove(req.id, req.doctor_id)}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Approve Request
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
                          
                          {/* Scan Result Display - Shows only if this request was scanned */}
                          {scanResult && scanResult.id === req.id && (
                              <div className="mt-6 bg-slate-900 rounded-lg p-5 border border-slate-800 text-slate-300 animate-fade-in-up relative overflow-hidden">
                                  {/* Decorative background glow */}
                                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                                  <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700">
                                        <div className={`p-1.5 rounded-lg ${scanResult.data.verdict === 'Authentic' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {scanResult.data.verdict === 'Authentic' 
                                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> 
                                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                }
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">Forensic Analysis Report</h4>
                                            <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider">Authenticity Score</div>
                                            <div className={`text-xl font-bold ${scanResult.data.authenticity_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {scanResult.data.authenticity_score}/100
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Verdict</span>
                                            <p className={`font-bold ${scanResult.data.verdict === 'Authentic' ? 'text-green-400' : 'text-red-400'}`}>
                                                {scanResult.data.verdict}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">Analysis</span>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {scanResult.data.reasoning}
                                            </p>
                                        </div>
                                    </div>

                                    {scanResult.data.flags && scanResult.data.flags.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-800">
                                            <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Detected Attributes</span>
                                            <div className="flex flex-wrap gap-2">
                                                {scanResult.data.flags.map((flag: string, i: number) => (
                                                    <span key={i} className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                  </div>
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