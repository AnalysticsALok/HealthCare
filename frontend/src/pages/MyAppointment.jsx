import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { useSearchParams, useNavigate } from 'react-router-dom';
import qrCodeImage from '../assets/qrCode.png';

const MyAppointment = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [payment, setPayment] = useState('');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Array to convert month numbers into human-readable month names
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Function to format the slot date from 'dd_mm_yyyy' to 'dd Month yyyy'
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  // Function to fetch the list of user appointments from the backend API
  const getUserAppointments = async () => {
    try {
      // Making a GET request to the appointments endpoint with the user's token for authentication
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
      if (data.success) {
        // Reverse the appointments to show the most recent ones first and set the state
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to cancel an appointment by sending a POST request to the backend API
  const cancelAppointment = async (appointmentId) => {
    try {
      // Sending the appointment ID in the request body to cancel the appointment
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });
      if (data.success) {
        // Notify the user of success and refresh the appointments and doctor data
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        // Show error message if appointment cancellation fails
        toast.error(data.message);
      }
    } catch (error) {
      // Log the error and notify the user using a toast message
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to initiate a Stripe payment session by making a POST request to the backend
  const appointmentStripe = async (appointmentId) => {
    try {
      // Sending the appointment ID to the backend to create a payment session with Stripe
      const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } });
      if (data.success) {
        // Redirecting the user to Stripe's checkout page
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        // Show error message if payment session creation fails
        toast.error(data.message);
      }
    } catch (error) {
      // Log the error and notify the user using a toast message
      console.log(error);
      toast.error(error.message);
    }
  };

  // useEffect hook to verify payment status after user returns from Stripe
  useEffect(() => {
    const success = searchParams.get('success'); // Extract 'success' from URL query parameters
    const appointmentId = searchParams.get('appointmentId'); // Extract 'appointmentId' from query parameters

    // Function to verify payment using the backend API
    const verifyPayment = async () => {
      if (success === 'true' && appointmentId) {
        try {
          // Sending the appointment ID and success status to the backend for verification
          const { data } = await axios.post(
            backendUrl + '/api/user/verifyStripe',
            {
              appointmentId,
              success,
            },
            {
              headers: {
                token, // Include the user token in headers for authentication
              },
            }
          );

          // If payment is successfully verified, update the appointments list and navigate to the appointments page
          if (data.success) {
            toast.success('Payment verified successfully');
            getUserAppointments(); // Refresh appointments after payment
            navigate('/my-appointments', { replace: true }); // Remove query params after payment verification
          } else {
            // Show error message if payment verification fails
            toast.error(data.message || 'Payment verification failed');
          }
        } catch (error) {
          // Log the error and show error message if payment verification fails
          console.log(error);
          toast.error('Error verifying payment');
        }
      }
    };

    verifyPayment(); // Run the payment verification function

    // Navigate back to remove query params (even if payment verification does not happen)
    if (success || appointmentId) {
      navigate('/my-appointments', { replace: true });
    }
  }, [searchParams, backendUrl, navigate]); // Dependency array ensures effect is triggered on parameter or URL changes

  // useEffect hook to fetch user appointments when the token is available (i.e., when the user is logged in)
  useEffect(() => {
    if (token) {
      getUserAppointments(); // Fetch appointments if token is present
    }
  }, [token]); // Effect is triggered when the token changes or when the component is mounted


  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium '>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className='flex flex-col gap-2 justify-end'>
              {item.payment && (
                <span className='text-green-600 font-medium text-right  sm:min-w-48 py-5 px-5'>
                 🙏 Paid 🙏
                </span>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                <button onClick={() => setPayment(item._id)} className='text-gray-500 sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                  Pay Online
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                <button onClick={() => appointmentStripe(item._id)} className='text-gray-500 sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'>
                  <img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" />
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
              <button onClick={() => setShowQRCodeModal(true)} className='text-gray-500 sm:min-w-48 py-2 border rounded hover:bg-gray-800 hover:text-white transition-all duration-300 flex items-center justify-center'>
                QR CODE
              </button>
              )}
              {!item.cancelled && (
                <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>
                  Cancel appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Modal for QR Code */}
        {showQRCodeModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          <button
            onClick={() => setShowQRCodeModal(false)}
            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
          >
            &times; {/* Close button */}
          </button>
          <img src={qrCodeImage} alt="QR Code for Payment" className="w-96" />
          <p className='text-sm text-red-500'>*We will verify the payment later <br /> and please save your payment slip</p>
        </div>
      </div>
    )}
    </div>
  );
};

export default MyAppointment;
