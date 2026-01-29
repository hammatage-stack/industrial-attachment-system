import React, { useState } from 'react';
import { paymentAPI } from '../services/api';

const PaymentPage = ({ applicationId }) => {
  const [mpesaCode, setMpesaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('instructions'); // instructions, payment, confirmation

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!mpesaCode.trim()) {
        setError('Please enter your M-Pesa transaction code');
        setLoading(false);
        return;
      }

      if (!phoneNumber.trim()) {
        setError('Please enter your phone number');
        setLoading(false);
        return;
      }

      // Validate M-Pesa code format (should be 10 characters alphanumeric)
      if (!/^[A-Z0-9]{10}$/i.test(mpesaCode.trim())) {
        setError('Invalid M-Pesa code format. Expected format: ABC1234567 (10 characters)');
        setLoading(false);
        return;
      }

      const response = await paymentAPI.validateMpesa({
        applicationId,
        mpesaCode: mpesaCode.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep('confirmation');
        setMpesaCode('');
        setPhoneNumber('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Application Payment</h2>

      {/* Instructions Step */}
      {step === 'instructions' && (
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">Payment Instructions</h3>
            <p className="text-blue-800 text-sm">
              To submit your application, you need to pay the application fee of <strong>KES 500</strong> via M-Pesa.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-900 mb-3">Steps to Pay:</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open M-Pesa on your phone</li>
              <li>Select <strong>"Lipa Na M-Pesa Online"</strong></li>
              <li>Enter Till Number: <strong className="text-red-600">3400188</strong></li>
              <li>Enter Amount: <strong>500</strong> (KES)</li>
              <li>Complete the transaction</li>
              <li>You will receive an M-Pesa confirmation message with a transaction code</li>
              <li>Copy the transaction code (format: ABC1234567 - 10 characters)</li>
              <li>Return here and paste the code below</li>
            </ol>
          </div>

          <button
            onClick={() => setStep('payment')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            I've Completed Payment
          </button>
        </div>
      )}

      {/* Payment Code Entry Step */}
      {step === 'payment' && (
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitPayment}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                M-Pesa Transaction Code
              </label>
              <input
                type="text"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC1234567"
                maxLength="10"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Format: 10 characters (letters and numbers)</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Phone Number Used for Payment
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 254712345678"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('instructions')}
                className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-100 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Step */}
      {step === 'confirmation' && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Payment Received!</h3>
            <p className="text-green-800 mb-4">
              Your M-Pesa payment has been received and is awaiting verification.
            </p>
            <p className="text-sm text-gray-600">
              An admin will verify your payment within 24 hours. You will receive an email confirmation once verified.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">What Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your application is saved</li>
              <li>⏳ Admin will verify your payment</li>
              <li>📧 You'll receive a confirmation email</li>
              <li>📝 Your application will be submitted to the organization</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.href = '/my-applications'}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Go to My Applications
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
