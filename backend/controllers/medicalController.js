import MedicalRecord from "../models/MedicalRecord.js";
import cloudinary from "../config/cloudinary.js";
import jwt from 'jsonwebtoken'

// ✅ Create Medical Record
export const createMedicalRecord = async (req, res) => {
    try {
        console.log("📥 Received Data:", req.body);  

        const { userId, recordTitle, recordDate, recordType, doctorName, hospitalOrClinic, description } = req.body;

        if (!userId || !recordTitle || !recordDate || !recordType || !doctorName || !hospitalOrClinic) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (!req.body.fileUpload){
            return res.status(500).json({error: "Sorry we can into an issue with the file upload!"})
        }

        const newRecord = new MedicalRecord({
            userId: req.body.userId,
            recordTitle,
            recordDate,
            recordType,
            doctorName,
            hospitalOrClinic,
            description,
            fileUpload: req.body.fileUpload,
        });

        console.log("✅ Saving Record:", newRecord);
        await newRecord.save();

        res.status(201).json({ success: true, message: "Medical record created successfully", record: newRecord });

    } catch (error) {
        console.error("❌ Error Saving Record:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get All Medical Records for a User
export const getUserMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ userId: req.body.userId }).sort({ createdAt: -1 });
        res.json({ success: true, records });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserMedicalRecords2 = async (req, res) => {
    try {
      // Access the patientId from req.body
      const patientId = req.body.patientId;
  
      if (!patientId) {
        return res.status(400).json({ success: false, message: "Patient ID is required" });
      }
  
      // Find medical records for the patient ID
      const records = await MedicalRecord.find({ userId: patientId }).sort({ createdAt: -1 });
  
      res.json({ success: true, records });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

// Generate new token for a given patient ID
export const generateToken = async (req, res) => {
    console.log("📡 Request to generate token received");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);  // Log the request body to ensure it's coming through correctly

    const { patientid } = req.body;  // Use req.body if sending via POST

    if (!patientid) {
        console.log("❌ Patient ID is missing");
        return res.status(400).json({ success: false, message: "Patient ID is required" });
    }

    try {
        const payload = {
            id: patientid,
            iat: Math.floor(Date.now() / 1000),  // Current timestamp
        };

        const secretKey = process.env.JWT_SECRET || "medvaulttech";
        const newToken = jwt.sign(payload, secretKey);

        console.log("✅ New token generated:", newToken);
        return res.json({ success: true, newToken });
    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ success: false, message: "Server error while generating token", error: error.message });
    }
};





// ✅ Get Single Medical Record
export const getSingleMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findOne({ _id: req.params.id, userId: req.body.userId });

        if (!record) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.json({ success: true, record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Update Medical Record
export const updateMedicalRecord = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

        if (req.file) {

            if (!allowedTypes.includes(req.file.mimetype)) {
                fs.unlinkSync(req.file.path); // ❌ Remove invalid file
                return res.status(400).json({ success: false, message: "Invalid file type. Only JPG, PNG, and PDF are allowed." });
            }

            // ✅ Set resource type based on file type
            const resourceType = req.file.mimetype === "application/pdf" ? "raw" : "image";

            console.log("📝 Updating File on Cloudinary:", req.file);
            
            const result = await cloudinary.uploader.upload_stream(
                { resource_type: resourceType, upload_preset: "medical_records" },
                (error, result) => {
                    if (error) {
                        console.error("❌ Cloudinary Upload Error:", error);
                        return res.status(500).json({ success: false, message: "File upload failed" });
                    }
                    updatedData.fileUpload = result.secure_url;
                    console.log("✅ Updated Cloudinary File URL:", updatedData.fileUpload);
                }
            ).end(req.file.buffer);
        }

        const updatedRecord = await MedicalRecord.findOneAndUpdate(
            { _id: req.params.id, userId: req.body.userId },
            updatedData,
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.json({ success: true, message: "Record updated successfully", record: updatedRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Delete Medical Record
export const deleteMedicalRecord = async (req, res) => {
    try {
        const deletedRecord = await MedicalRecord.findOneAndDelete({ _id: req.params.id, userId: req.body.userId });

        if (!deletedRecord) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
