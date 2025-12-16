import { Star, MapPin, CheckCircle2, Clock } from 'lucide-react';

export const LawyerCard = ({ lawyer, onClick }) => (
  <div className="p-4 mb-4 transition-shadow bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md" onClick={() => onClick(lawyer)}>
    <div className="flex items-start space-x-3">
      <div className="flex items-center justify-center w-12 h-12 font-semibold text-white bg-blue-500 rounded-full">
        {lawyer.image}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{lawyer.name}</h3>
            {(lawyer?.raw?.credentialsVerified || lawyer?.raw?.status === 'approved' || lawyer?.raw?.verificationStatus === 'verified') ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </div>
            ) : (lawyer?.raw?.status === 'pending' || lawyer?.raw?.verificationStatus === 'pending' || (!lawyer?.raw?.credentialsVerified && lawyer?.raw?.credentials)) ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                <Clock className="w-3 h-3" />
                <span>Pending</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center space-x-1">

          </div>
        </div>
        <p className="text-sm font-medium text-blue-600">{lawyer.specialty}</p>
        <p className="flex items-center mt-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          {lawyer.location}
        </p>
        <p className="mt-2 text-sm text-gray-700">{lawyer.experience} of experience handling {(lawyer.specialty || 'various cases').toLowerCase()}</p>
        <div className="flex items-center justify-end mt-3">
          <button className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
            View Profile
          </button>
        </div>
      </div>
    </div>
  </div>
);
