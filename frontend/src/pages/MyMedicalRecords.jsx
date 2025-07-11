import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const MyMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false); // ✅ File upload state
  const [formData, setFormData] = useState({
    recordTitle: "",
    recordDate: "",
    recordType: "Prescription",
    doctorName: "",
    hospitalOrClinic: "",
    description: "",
    file: null,
    fileUploadUrl: "", // ✅ Cloudinary URL storage
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // ✅ Decode JWT Token to Get User ID
  let userId = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      console.log("Decoded User ID:", userId);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  // ✅ Fetch Medical Records
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${backendUrl}/api/medical-records`, {
        headers: { token: token },
      });

      console.log("✅ Records Fetched:", response.data);
      setRecords(response.data.records);
    } catch (error) {
      console.log("❌ API Error:", error.response ? error.response.data : error.message);
      toast.error("Sorry! We ran into an internal issue.");
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  // ✅ Handle Form Input Changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  // ✅ Handle File Upload to Cloudinary
  const handleFileUpload = async () => {
    if (!formData.file) {
      toast.error("Please select a file first.");
      return;
    }

    setLoadingFile(true);
    const fileData = new FormData();
    fileData.append("file", formData.file);
    fileData.append("upload_preset", "medical_records"); // ✅ Replace with Cloudinary preset

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/df9ubhtmi/upload", fileData);
      setFormData({ ...formData, fileUploadUrl: res.data.secure_url }); // ✅ Save Cloudinary URL
      toast.success("File uploaded successfully! Please Save The Record");
    } catch (error) {
      console.error("❌ File Upload Error:", error);
      toast.error("Failed to upload file.");
    } finally {
      setLoadingFile(false);
    }
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fileUploadUrl) {
        console.error("❌ No file URL found!");
        toast.error("Please upload the file first.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ No Token Found");
            toast.error("Authentication error!");
            return;
        }

        const newRecord = {
            recordTitle: formData.recordTitle || "",
            recordDate: formData.recordDate || new Date().toISOString(),
            recordType: formData.recordType || "Unknown",
            doctorName: formData.doctorName || "N/A",
            hospitalOrClinic: formData.hospitalOrClinic || "N/A",
            description: formData.description || "N/A",
            fileUpload: formData.fileUploadUrl, // ✅ Sending Cloudinary URL
        };

        console.log("📤 Sending to Backend:", newRecord); // ✅ Check if data is prepared

        const res = await axios.post(`${backendUrl}/api/medical-records`, newRecord, {
            headers: {
                "Content-Type": "application/json",
                token: token,
            },
        });

        console.log("✅ Response from Backend:", res.data); // ✅ Check backend response

        if (res.data.success) {
            toast.success("Medical record saved successfully!");
            setShowForm(false);
            fetchRecords();
        } else {
            toast.error("Failed to save record: " + res.data.message);
        }
    } catch (error) {
        console.error("❌ Axios Error:", error.response?.data || error.message);
        toast.error("Failed to add record.");
    }
};




  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow-md">
      <p className="pb-3 text-lg font-medium text-gray-600 border-b">My Medical Records</p>

      {/* ✅ Add Record Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "Add New Record"}
        </button>
      </div>

      {/* ✅ Medical Record Form */}
      {showForm && (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="recordTitle"
            value={formData.recordTitle}
            onChange={handleChange}
            placeholder="Consulted For?"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="date"
            name="recordDate"
            value={formData.recordDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          <select
            name="recordType"
            value={formData.recordType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="Prescription">Prescription</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Diagnosis">Diagnosis</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Doctor's Name"
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="text"
            name="hospitalOrClinic"
            value={formData.hospitalOrClinic}
            onChange={handleChange}
            placeholder="Hospital/Clinic"
            className="w-full p-2 border rounded"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description"
            className="w-full p-2 border rounded"
          ></textarea>

          <input type="file" name="file" onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="button" onClick={handleFileUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {loadingFile ? "Uploading..." : "Upload File"}
          </button>

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Save Record
          </button>
        </form>
      )}

      {/* ✅ Display Medical Records */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your Records</h2>
        {records.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {records.map((record) => (
              <li key={record._id} className="p-3 border rounded shadow-sm">
                <p className="font-semibold">{record.recordTitle}</p>
                <p className="text-sm text-gray-600">{record.recordDate}</p>
                <p className="text-sm">{record.recordType}</p>
                <p className="text-sm">Doctor: {record.doctorName}</p>
                <p className="text-sm">Hospital: {record.hospitalOrClinic}</p>
                <p className="text-sm text-gray-500">{record.description}</p>
                {record.fileUpload && (
                  <a href={record.fileUpload} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    View Uploaded File
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-4">No medical records found.</p>
        )}
      </div>
    </div>
  );
};

export default MyMedicalRecords;
