import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createAppointment } from '../services/db';

interface CheckoutProps {
  navigate: (path: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ navigate }) => {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Payment State
  const [paymentTiming, setPaymentTiming] = useState<'now' | 'later'>('now');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paytm' | 'netbanking'>('card');

  // Logic: Online appointments usually require upfront payment
  const hasOnlineAppointment = cart.some(item => item.type === 'online');
  const canPayLater = !hasOnlineAppointment;

  const handlePayment = async () => {
    if (!user) {
        alert("Please login to complete booking");
        navigate('/login');
        return;
    }
    
    setLoading(true);
    
    // Simulate Processing Time
    const processingTime = paymentTiming === 'now' ? 2000 : 800;

    setTimeout(() => {
        // Create appointments for all items in cart
        cart.forEach(item => {
            const finalPaymentMethod = paymentTiming === 'later' ? 'pay_later' : paymentMethod;
            createAppointment(
                item.doctor.id,
                user.id,
                user.name,
                item.condition,
                item.date,
                item.time,
                item.type,
                finalPaymentMethod,
                item.fee
            );
        });
        
        clearCart();
        setLoading(false);
        setSuccess(true);
    }, processingTime);
  };

  if (success) {
      return (
          <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-8">
                  {paymentTiming === 'now' 
                    ? "Payment successful. Your appointments are confirmed." 
                    : "Your appointments are booked. Please pay at the clinic."}
              </p>
              <button onClick={() => navigate('/patient-dashboard')} className="px-8 py-3 bg-medical-600 text-white rounded-full font-bold hover:bg-medical-700 shadow-lg hover:shadow-xl transition-all">
                  Go to Dashboard
              </button>
          </div>
      )
  }

  if (cart.length === 0) {
      return (
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
              <p className="mt-2 mb-8 text-slate-500">Find a specialist to book an appointment.</p>
              <button onClick={() => navigate('/analyze')} className="px-6 py-3 bg-medical-600 text-white rounded-lg font-medium hover:bg-medical-700 transition-colors">Check Symptoms</button>
          </div>
      )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg">3</span>
          Checkout & Payment
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                          <img src={item.doctor.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow-sm" alt="Doc" />
                          <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-slate-900">{item.doctor.name}</h3>
                                {item.doctor.verified && (
                                    <span className="text-blue-500" title="Verified Specialist">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </span>
                                )}
                              </div>
                              <p className="text-sm text-medical-600 font-medium mb-1">{item.doctor.specialization}</p>
                              <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                                  <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                      {new Date(item.date).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      {item.time}
                                  </span>
                                  <span className={`capitalize px-2 py-0.5 rounded text-xs font-bold ${item.type === 'online' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      {item.type}
                                  </span>
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                          <span className="font-bold text-xl text-slate-900">${item.fee}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline mt-1">
                              Remove
                          </button>
                      </div>
                  </div>
              ))}
          </div>

          {/* Payment Section */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 h-fit sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Details</h3>
              
              {/* Timing Selector */}
              <div className="mb-6 p-1 bg-slate-100 rounded-xl flex">
                  <button 
                    onClick={() => setPaymentTiming('now')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${paymentTiming === 'now' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Pay Now
                  </button>
                  <button 
                    onClick={() => {
                        if (canPayLater) setPaymentTiming('later');
                    }}
                    disabled={!canPayLater}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentTiming === 'later' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'} ${!canPayLater ? 'opacity-50 cursor-not-allowed' : 'hover:text-slate-700'}`}
                    title={!canPayLater ? "Online appointments require upfront payment" : ""}
                  >
                    Pay at Clinic
                  </button>
              </div>

              {!canPayLater && paymentTiming === 'now' && (
                  <div className="mb-6 bg-indigo-50 text-indigo-800 text-xs p-3 rounded-lg border border-indigo-100 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Upfront payment is required for Online Video Consultations.
                  </div>
              )}

              {/* Payment Methods (Only shown if Paying Now) */}
              {paymentTiming === 'now' && (
                  <div className="mb-8 animate-fade-in">
                      <h4 className="font-semibold mb-3 text-slate-800 text-sm uppercase tracking-wide">Select Payment Method</h4>
                      <div className="space-y-3">
                          <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-medical-500 bg-medical-50 ring-1 ring-medical-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                              <input type="radio" name="paymethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="text-medical-600 focus:ring-medical-500" />
                              <div className="ml-3">
                                  <span className="block text-sm font-bold text-slate-900">Credit / Debit Card</span>
                                  <span className="block text-xs text-slate-500">Visa, Mastercard, Amex</span>
                              </div>
                          </label>
                          <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'paytm' ? 'border-medical-500 bg-medical-50 ring-1 ring-medical-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                              <input type="radio" name="paymethod" checked={paymentMethod === 'paytm'} onChange={() => setPaymentMethod('paytm')} className="text-medical-600 focus:ring-medical-500" />
                              <div className="ml-3">
                                  <span className="block text-sm font-bold text-slate-900">UPI / Wallets</span>
                                  <span className="block text-xs text-slate-500">GPay, Paytm, PhonePe</span>
                              </div>
                          </label>
                          <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-medical-500 bg-medical-50 ring-1 ring-medical-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                              <input type="radio" name="paymethod" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="text-medical-600 focus:ring-medical-500" />
                              <div className="ml-3">
                                  <span className="block text-sm font-bold text-slate-900">Net Banking</span>
                                  <span className="block text-xs text-slate-500">All major banks supported</span>
                              </div>
                          </label>
                      </div>
                  </div>
              )}

              {/* Order Summary */}
              <div className="space-y-3 mb-6 border-t border-slate-100 pt-6">
                  <div className="flex justify-between text-slate-600 text-sm">
                      <span>Subtotal</span>
                      <span>${cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-sm">
                      <span>Service Fee</span>
                      <span>$2.00</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-dashed border-slate-200">
                      <span>Total to Pay</span>
                      <span>${cartTotal + 2}</span>
                  </div>
              </div>

               {/* Cancellation Policy */}
               <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-700 mb-1">Cancellation Policy</h5>
                  <p>
                      You can cancel for free up to <span className="font-bold">24 hours</span> before the scheduled time. 
                      Late cancellations or no-shows may be subject to a 50% fee.
                  </p>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                  {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </>
                  ) : paymentTiming === 'now' ? `Secure Pay $${cartTotal + 2}` : 'Confirm Booking'}
              </button>
              
              {paymentTiming === 'now' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    256-bit SSL Encrypted Payment
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Checkout;