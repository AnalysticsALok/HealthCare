import doctorModel from "../models/doctorModel.js"; // Importing the doctor model to interact with the doctors collection in MongoDB
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing and comparison
import jwt from "jsonwebtoken"; // Importing JWT for generating tokens for authentication

// API to change the availability of a doctor
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body; // Extracting doctor ID from the request body
        
        // Finding the doctor by ID in the database
        const docData = await doctorModel.findById(docId);
        
        // Toggling the doctor's availability status and updating it in the database
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        
        // Sending success response to the client
        res.json({ success: true, message: 'Availability Changed' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get the list of all doctors
const doctorList = async (req, res) => {
    try {
        // Fetching all doctors from the MongoDB database and excluding the password and email fields for security
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        
        // Sending the list of doctors as a response to the client
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body; // Extracting email and password from the request body

        // Finding the doctor by email in the MongoDB database
        const user = await doctorModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Comparing the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // If the password matches, generating a JWT token and sending it in the response
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            // If the password doesn't match, sending an error response
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}


export {changeAvailability,doctorList, loginDoctor,appointmentsDoctor}