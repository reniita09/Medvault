import React, { useState, useEffect, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react'; // Correct import

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false); // Add state for QR modal
  const [qrValue, setQRValue] = useState(''); // Add state for QR code value
  const [currentPatient, setCurrentPatient] = useState(null); // Track current patient
  const [formData, setFormData] = useState({
    recordTitle: '',
    recordType: 'Prescription',
    hospitalOrClinic: '',
    description: '',
    fileUpload: null,
    appointmentDate: '',
    doctorName: '',
  });

  const [isUploading, setIsUploading] = useState(false); // Track upload status

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "medical_records");

    try {
      setIsUploading(true); // Set uploading to true when the upload starts
      const response = await fetch("https://api.cloudinary.com/v1_1/df9ubhtmi/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setIsUploading(false); // Set uploading to false when upload finishes
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      setIsUploading(false); // Set uploading to false even if there's an error
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = await uploadToCloudinary(file);
    if (uploadedUrl) {
      setFormData((prevData) => ({ ...prevData, fileUpload: uploadedUrl }));
    }
  };

  const openMedicalRecordModal = (appointment) => {
    // Debug log: Check the passed appointment object
    console.log("📅 Appointment data passed to modal:", appointment);

    // Extract and format the date
    const slotDateParts = appointment.slotDate.split("_");
    const formattedDate = `${slotDateParts[2]}-${slotDateParts[1]}-${slotDateParts[0]}`; // Convert "15_3_2025" to "2025-03-15"
    console.log("🗓️ Formatted Date:", formattedDate);

    // Combine formatted date and time
    const formattedDateTime = `${formattedDate} ${appointment.slotTime}`;
    console.log("🕒 Formatted Date & Time:", formattedDateTime);

    // Create a Date object in UTC format (using "toISOString" ensures it's in UTC)
    const appointmentDate = new Date(`${formattedDateTime} UTC`);

    if (isNaN(appointmentDate)) {
      console.error("❌ Invalid date or time format:", formattedDateTime);
      return;
    }

    // Debug log: Check the new appointment date in UTC
    console.log("🗓️ Appointment Date as UTC Date object:", appointmentDate);

    // Now, update the state for the modal with the correct appointment data
    setFormData({
      recordTitle: '', // Reset fields to avoid carrying over previous values
      recordType: 'Prescription',
      hospitalOrClinic: '',
      description: '',
      fileUpload: null,
      appointmentDate: appointmentDate.toISOString(), // Store in UTC ISO format
      doctorName: appointment.docData?.name || '',  // Ensure we have the doctor's name
      userId: appointment.userId, // Store the user ID
    });

    // Show the modal with the correct data
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const token = dToken;
      if (!token) {
        console.error("❌ No Token Found");
        toast.error("Authentication error!");
        return;
      }

      const newRecord = {
        recordTitle: formData.recordTitle || "",
        recordDate: formData.appointmentDate || new Date().toISOString(),
        recordType: formData.recordType || "Unknown",
        doctorName: formData.doctorName || "N/A",
        hospitalOrClinic: formData.hospitalOrClinic || "N/A",
        description: formData.description || "N/A",
        fileUpload: formData.fileUpload || "",
        userId: formData.userId,
      };

      console.log("📤 Sending to Backend:", newRecord);

      const res = await axios.post(`${backendUrl}/api/medical-records`, newRecord, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });

      console.log("✅ Response from Backend:", res.data);

      if (res.data.success) {
        toast.success("Medical record saved successfully!");
        setShowModal(false);
      } else {
        toast.error("Failed to save record: " + res.data.message);
      }
    } catch (error) {
      console.error("❌ Axios Error:", error.response?.data || error.message);
      toast.error("Failed to add record.");
    }
  };

  const generateQR = async (patientId, patientName) => {
    try {
      // Create a URL that points to the patient's records page
      const recordsUrl = `https://medvault-frontend.onrender.com/patient-records/${patientId}`; //`${window.location.origin}/patient-records/${patientId}`;  http://192.168.1.112:5173/
      console.log("✅ Scanning QR Code URL:", recordsUrl);
      // Set QR code value and show modal
      setQRValue(recordsUrl);
      setCurrentPatient({ id: patientId, name: patientName });
      setShowQRModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("An error occurred while generating the QR code.");
    }
  };
  

  const downloadQRCode = () => {
    // Get the canvas element
    const canvas = document.getElementById('patient-qr-code');
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `medical-records-${currentPatient?.name || 'patient'}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
          <p>Medical Records</p>
          <p>Consulation</p>
        </div>

        {appointments.map((item, index) => (
          <div className='flex flex-wrap sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt='' />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            {item.cancelled ? (
              <p className='text-red-400 text-xs font-medium'>Cancelled</p>
            ) : item.isCompleted ? (
              <p className='text-green-500 text-xs font-medium'>Completed</p>
            ) : (
              <div className='flex'>
                <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt='' />
                <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt='' />
              </div>
            )}
            <button
              className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => generateQR(item.userId, item.userData.name)}
            >
              GenerateQR
            </button>

            <button
              className={`px-2 py-1 rounded ${item.cancelled || item.isCompleted ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              onClick={() => openMedicalRecordModal(item)}
              disabled={item.cancelled || item.isCompleted}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Medical record modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-5 rounded w-96'>
            <h2 className='text-lg font-semibold mb-3'>Add Medical Record</h2>
            <input type='text' placeholder='Title' className='w-full border p-2 mb-2' value={formData.recordTitle} onChange={(e) => setFormData({ ...formData, recordTitle: e.target.value })} />
            <input type='text' placeholder='Hospital/Clinic' className='w-full border p-2 mb-2' value={formData.hospitalOrClinic} onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })} />
            <textarea placeholder='Description' className='w-full border p-2 mb-2' value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            <input type="file" onChange={handleFileChange} className="mb-3" />
            {isUploading ? <p>Uploading...</p> : <button onClick={handleSubmit} className='w-full bg-blue-500 text-white py-2 rounded'>Save Record</button>}
            <button onClick={() => setShowModal(false)} className='w-full mt-2 bg-gray-300 text-gray-800 py-2 rounded'>Cancel</button>
          </div>
        </div>
      )}

      {/* QR code modal */}
      {showQRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-5 rounded w-80'>
            <h2 className='text-lg font-semibold mb-3'>Patient Medical Records QR Code</h2>
            <p className='text-sm text-gray-600 mb-4'>
              Patient: {currentPatient?.name || 'Unknown'}
            </p>
            <div className='flex justify-center mb-4'>
              <QRCodeCanvas
                id="patient-qr-code"
                value={qrValue}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className='text-xs text-gray-500 mb-4 text-center'>
              Scan this QR code to access the patient's medical records
            </div>
            <div className='flex gap-2'>
              <button onClick={downloadQRCode} className='flex-1 bg-blue-500 text-white py-2 rounded'>Download</button>
              <button onClick={() => setShowQRModal(false)} className='flex-1 bg-gray-300 text-gray-800 py-2 rounded'>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
