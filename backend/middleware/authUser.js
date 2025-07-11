    import jwt from 'jsonwebtoken';

    const authUser = async (req, res, next) => {
        console.log("📡 Headers Received:", req.headers); // Debug Headers

        const { token, patientid } = req.headers;  // Retrieve token and patientid from headers
        if (!token) {
            console.log("❌ No Token Found");
            return res.json({ success: false, message: 'Not Authorized, Login Again' });
        }

        try {
            console.log("🔑 Verifying Token...");
            const token_decode = jwt.verify(token, process.env.JWT_SECRET);
            
            if (!req.body.userId) {
                console.log("✅ Decoded Token:", token_decode); // Debug Decoded Token
                req.body.userId = token_decode.id;
            }

            // Add patientId to the request body if it exists in headers
            if (patientid) {
                req.body.patientId = patientid;  // Add patientId to the request body
                console.log("Patient ID received:", patientid);

                // Optionally, generate a new JWT for the patient
                const payload = {
                    id: patientid,
                    iat: Math.floor(Date.now() / 1000)  // Current timestamp
                };

                const newToken = jwt.sign(payload, process.env.JWT_SECRET);
                console.log("New JWT Generated:", newToken); // Debug New Token

                req.body.newToken = newToken;  // Optionally add the new token to the request body
            }

            next();
        } catch (error) {
            console.log("❌ JWT Verification Error:", error.message);
            res.json({ success: false, message: error.message });
        }
    };

    export default authUser;
