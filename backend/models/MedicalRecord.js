import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recordTitle: { type: String, required: true },
    recordDate: { type: Date, required: true },
    recordType: { type: String, required: true },
    doctorName: { type: String, required: true },
    hospitalOrClinic: { type: String, required: true },
    description: { type: String, required: false },
    fileUpload: { type: String, },
}, { timestamps: true });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
