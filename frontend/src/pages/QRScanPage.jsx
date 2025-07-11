import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const QRScanPage = () => {
  const { userId } = useParams(); // Extract userId from URL
  const [records, setRecords] = useState([]); // Store patient records
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/medical-records/patient/${userId}`
        );
        setRecords(response.data.records);
      } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Error fetching patient records");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecords();
    }
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-lg font-semibold">Patient Medical Records</h2>

      {loading ? (
        <p>Loading...</p>
      ) : records.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {records.map((record) => (
            <li key={record._id} className="p-3 border rounded shadow-sm">
              <p className="font-semibold">{record.recordTitle}</p>
              <p className="text-sm text-gray-600">
                {new Date(record.recordDate).toLocaleDateString()}
              </p>
              <p className="text-sm">{record.recordType}</p>
              <p className="text-sm">Doctor: {record.doctorName}</p>
              <p className="text-sm">Hospital: {record.hospitalOrClinic}</p>
              <p className="text-sm text-gray-500">{record.description}</p>
              {record.fileUpload && (
                <a
                  href={record.fileUpload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Uploaded File
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No records found.</p>
      )}
    </div>
  );
};

export default QRScanPage;
