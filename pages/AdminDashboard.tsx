
import React, { useEffect, useState } from 'react';
import { getVerificationRequests, verifyDoctor } from '../services/db';
import { VerificationRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);

  const load = () => setRequests(getVerificationRequests());
  useEffect(load, []);

  const handleAction = (req: VerificationRequest, approve: boolean) => {
      verifyDoctor(req.id, req.doctor_id, approve);
      alert(approve ? "Doctor Verified" : "Request Rejected");
      load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-bold">Pending Verification Requests</div>
          <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted Docs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                  {requests.map(req => (
                      <tr key={req.id}>
                          <td className="px-6 py-4 font-medium">{req.doctor_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                              License: {req.documents.license}<br/>
                              Degree: {req.documents.degree}
                          </td>
                          <td className="px-6 py-4 text-sm">{new Date(req.date_requested).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'pending' ? 'bg-blue-100 text-blue-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {req.status.toUpperCase()}
                              </span>
                          </td>
                          <td className="px-6 py-4">
                              {req.status === 'pending' && (
                                  <div className="flex gap-2">
                                      <button onClick={() => handleAction(req, true)} className="text-green-600 font-bold hover:underline">Approve</button>
                                      <button onClick={() => handleAction(req, false)} className="text-red-600 font-bold hover:underline">Reject</button>
                                  </div>
                              )}
                          </td>
                      </tr>
                  ))}
                  {requests.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No requests found.</td></tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
