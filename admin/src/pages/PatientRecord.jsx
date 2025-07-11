import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const PatientRecords = () => {
  const { userId } = useParams(); // Get userId from URL
  const [records, setRecords] = useState([]); // Store the patient's records
  const [loading, setLoading] = useState(true); // Track the loading state

  // Debugging log
  console.log("🆔 Extracted userId:", userId);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      //const token = localStorage.getItem("token");
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDQxNmYyYWM4MzliYjFkNTFjMmJhNCIsImlhdCI6MTc0MjA2Njg2OH0.NTkuYoXhVcRtHMn8psLNQRjrGZVq-D22IpoOolO0Rso";
      //console.log(token)

      const response = await axios.get(`${backendUrl}/api/medical-records`, {
        headers: { token: token },
      });

      console.log("✅ Records Fetched:", response.data);
      setRecords(response.data.records);
    } catch (error) {
      console.log("❌ API Error:", error.response ? error.response.data : error.message);
      toast.error("Sorry! We ran into an internal issue.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-lg font-semibold">Your Records</h2>

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

export default PatientRecords;
