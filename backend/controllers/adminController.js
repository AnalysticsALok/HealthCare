import validator from "validator" 
import bcrypt from "bcrypt" 
import { v2 as cloudinary } from 'cloudinary' // Cloudinary SDK for uploading and managing images
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken' 
import appointmentModel from "../models/appointmentModel.js" 
import userModel from "../models/userModel.js" 
// API for adding a new doctor
const addDoctor = async (req, res) => {
    try {
        // Extracting doctor details from request body
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file; // Extracting the image file from the request (handled by multer)

        // Checking if all required fields are provided
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Validating the format of the email using the "validator" library
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please return a valid email" });
        }

        // Validating that the password is strong enough (at least 8 characters)
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // Hashing the doctor's password using bcrypt for security
        const salt = await bcrypt.genSalt(10); // Generates a random salt to add security
        const hashedPassword = await bcrypt.hash(password, salt); // Hashes the password with the salt

        // Uploading the doctor's image to Cloudinary for cloud-based storage
        console.log(imageFile.path);
        
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url; // Retrieving the secure URL of the uploaded image

        // Creating the doctor data object to save in the database
        const doctorData = {
            name,
            email,
            image: imageUrl, // Storing the image URL from Cloudinary
            password: hashedPassword, // Storing the hashed password
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address), // Parsing address data (if it's sent as a JSON string)
            date: Date.now() // Setting the current date for the doctor creation timestamp
        };

        // Saving the doctor to the MongoDB database using the doctorModel
        const newDoctor = await doctorModel(doctorData);
        await newDoctor.save();

        // Sending a success response to the client
        res.json({ success: true, message: "Doctor added successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body; // Extracting email and password from request body

        // Verifying if the provided email and password match the admin credentials stored in environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Creating a JWT token for admin session using the email and password




            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            //  jwt payload should not store sensitive informations like password
            //  so we need to remove password from the token before sending it to the client




            res.json({ success: true, token }); // Sending the generated token to the client
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" }); // Error if the credentials don't match
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to get all doctors' list for the admin panel
const allDoctors = async (req, res) => {
    try {
        // Fetching all doctors from the MongoDB database and excluding their passwords for security
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors }); // Sending the list of doctors to the client

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to get all appointments list for admin panel
const appointmentsAdmin = async (req, res) => {
    try {
        // Fetching all appointments from the MongoDB database
        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments }); // Sending the list of appointments to the client

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body; // Extracting appointmentId from request body

        // Updating the appointment status to 'cancelled' in the MongoDB database
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        res.json({ success: true, message: 'Appointment Cancelled' }); // Sending success response

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to get dashboard data for the admin panel
const adminDashboard = async (req, res) => {
    try {
        // Fetching all doctors, users, and appointments from the MongoDB database
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        // Aggregating data for the admin dashboard
        const dashData = {
            doctors: doctors.length, // Total number of doctors
            appointments: appointments.length, // Total number of appointments
            patients: users.length, // Total number of patients (users)
            latestAppointments: appointments.reverse() // Showing latest appointments first
        };

        // Sending the aggregated dashboard data to the client
        res.json({ success: true, dashData });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

export {
    addDoctor,
    loginAdmin, 
    allDoctors, 
    appointmentsAdmin, 
    appointmentCancel, 
    adminDashboard 
};
