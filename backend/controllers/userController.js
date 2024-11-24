import validator from "validator"; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary'; 
import doctorModel from "../models/doctorModel.js"; 
import appointmentModel from "../models/appointmentModel.js"; 
import stripe from "stripe"; // Stripe SDK for handling payments

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY); 

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extracting name, email, and password from request body

        // checking for all required fields for registration
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' }); // Error if any field is missing
        }

        // validating email format using validator library
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating if password length is strong enough
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing user password for security
        const salt = await bcrypt.genSalt(10); // Creating salt (random string) to make password hashing more secure
        const hashedPassword = await bcrypt.hash(password, salt); // Hashing the password

        const userData = {
            name,
            email,
            password: hashedPassword, // Saving hashed password instead of raw password for security
        };

        const newUser = new userModel(userData); // Creating new user record
        const user = await newUser.save(); // Saving user in MongoDB

        // Generating JWT (JSON Web Token) for the user after registration
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token }); // Sending success response with JWT token
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        const user = await userModel.findOne({ email }); // Searching for the user by email in the database

        if (!user) {
            return res.json({ success: false, message: "User does not exist" }); // Error if no user is found
        }

        // Comparing provided password with hashed password stored in database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // If password matches, generate JWT token for the user
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token }); // Sending success response with token
        } else {
            res.json({ success: false, message: "Invalid credentials" }); // Error if passwords don't match
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body; // Extracting userId from request body
        const userData = await userModel.findById(userId).select('-password'); // Fetching user details without the password field

        res.json({ success: true, userData }); // Sending user data as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body; 
        const imageFile = req.file; // File upload (profile image) handled by multer middleware

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" }); // Error if any required field is missing
        }

        // Updating basic user profile data (name, phone, address, etc.)
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile) {
            // If image is uploaded, uploading it to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url; // Getting the secure URL of the uploaded image

            await userModel.findByIdAndUpdate(userId, { image: imageURL }); // Updating user profile with the new image URL
        }

        res.json({ success: true, message: 'Profile Updated' }); // Sending success response
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body; 
        const docData = await doctorModel.findById(docId).select("-password"); // Fetching doctor details without password

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' }); // Error if doctor is not available
        }

        let slots_booked = docData.slots_booked;

        // Checking if the requested slot is available for booking
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' }); // Error if slot is already booked
            } else {
                slots_booked[slotDate].push(slotTime); // Adding new slot if it's available
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime); // Initializing new date with the slot
        }

        const userData = await userModel.findById(userId).select("-password"); // Fetching user data without password
        delete docData.slots_booked; // Removing slots_booked field to avoid saving it in appointment

        // Creating new appointment data
        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees, // Setting appointment fee
            slotTime,
            slotDate,
            date: Date.now() // Timestamp of the booking
        };

        const newAppointment = new appointmentModel(appointmentData); // Creating new appointment record
        await newAppointment.save(); // Saving appointment in MongoDB

        // Updating doctor data with the new slots_booked information
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Booked' }); // Sending success response
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get user appointments for frontend "my-appointments" page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body; // Extracting userId from request body
        const appointments = await appointmentModel.find({ userId }); // Fetching all appointments for the user

        res.json({ success: true, appointments }); // Sending list of appointments as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body; // Extracting userId and appointmentId from request body
        const appointmentData = await appointmentModel.findById(appointmentId); // Fetching appointment details

        // Verifying if the user trying to cancel the appointment is the one who booked it
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' }); // Error if user is unauthorized
        }

        // Marking the appointment as cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Releasing the doctor's slot that was booked
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime); // Removing the cancelled slot

        await doctorModel.findByIdAndUpdate(docId, { slots_booked }); // Saving updated slots_booked

        res.json({ success: true, message: 'Appointment Cancelled' }); // Sending success response
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body; // Extracting appointment ID from request body
        const { origin } = req.headers; // Extracting origin (frontend URL) from request headers

        const appointmentData = await appointmentModel.findById(appointmentId); // Fetching appointment details from MongoDB

        // Validating if the appointment exists and is not cancelled
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        const currency = (process.env.CURRENCY || 'thb').toLowerCase(); // Fetching currency from environment variables or defaulting to Thai Baht

        const line_items = [
            {
                price_data: {
                    currency, // Currency used for the payment
                    product_data: {
                        name: "Appointment Fees" // Product description for payment
                    },
                    unit_amount: appointmentData.amount * 100 // Stripe uses the smallest currency unit (e.g., 100 satang = 1 Baht)
                },
                quantity: 1 // Quantity of product (appointment fee)
            }
        ];

        // Creating a checkout session with Stripe
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/my-appointments?success=true&appointmentId=${appointmentData._id}`, // Redirect URL on successful payment
            cancel_url: `${origin}/my-appointments?success=false&appointmentId=${appointmentData._id}`, // Redirect URL on cancelled payment
            line_items: line_items, // Appointment fees passed as line items
            mode: 'payment', // Payment mode for one-time payment
        });

        res.json({ success: true, session_url: session.url }); // Sending the session URL to frontend to redirect user to Stripe checkout page
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// API to verify payment status after returning from Stripe
const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body; // Extracting appointmentId and success status from request body

        // If the payment is successful, update the appointment as paid
        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            return res.json({ success: true, message: 'Payment Successful' });
        }

        res.json({ success: false, message: 'Payment Failed' }); // Sending response if payment fails
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

export {
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentStripe, 
    verifyStripe
};
