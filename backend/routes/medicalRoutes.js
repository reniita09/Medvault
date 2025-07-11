import express from "express";
import multer from "multer";
import authUser from "../middleware/authUser.js";
import {
    createMedicalRecord,
    getUserMedicalRecords,
    getSingleMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getUserMedicalRecords2,
    generateToken,
} from "../controllers/medicalController.js";

const router = express.Router();

// ✅ Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/generatetoken", authUser, generateToken)

// ✅ Routes only pass control to controllers
router.post("/", authUser, upload.single("file"), createMedicalRecord);
router.get("/", authUser, getUserMedicalRecords);
router.get("/:id", authUser, getSingleMedicalRecord);
//router.get("/", authUser, getUserMedicalRecords2);
router.put("/:id", authUser, upload.single("file"), updateMedicalRecord);
router.delete("/:id", authUser, deleteMedicalRecord);
router.post("/generatetoken", authUser, generateToken)

export default router;
