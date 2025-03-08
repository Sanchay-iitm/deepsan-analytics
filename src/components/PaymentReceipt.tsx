import React from 'react';
import { Download } from 'lucide-react';

interface PaymentReceiptProps {
  payment: any;
  onClose: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ payment, onClose }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = payment.receipt_url;
    a.download = `receipt-${payment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Payment Receipt</h2>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">{payment.amount} {payment.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium">{payment.plan_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;