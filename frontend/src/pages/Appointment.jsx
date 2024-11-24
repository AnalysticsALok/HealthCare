import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysofWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0); // Tracks the currently selected slot date.
  const [slotTime, setSlotTime] = useState('');

  // Fetch doctor info from the list of doctors
  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
    console.log("doctor informations", docInfo);
  };

  // Function to find available time slots for the doctor over the next 7 days
  const getAvailableSlot = async () => {
    setDocSlots([]); // Reset the slots

    let today = new Date();

    // Loop through the next 7 days
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today); // Create a new date object for the current iteration
      currentDate.setDate(today.getDate() + i); // Increment date by 'i' days

      let endTime = new Date(); // End time of the day is 9 PM (21:00)
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0); // Set end time to 21:00 (9 PM)

      // Set the start time of the day (10 AM) or adjust based on the current time
      if (today.getDate() === currentDate.getDate()) {
        // If it's today, set the time based on the current hour (10 AM at earliest)
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0); // Nearest 30-minute mark
      } else {
        // If it's a future day, set the time to 10 AM
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = []; // Array to hold the available time slots for the day

      // Loop to generate time slots every 30 minutes until the end of the day (9 PM)
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Formatting date for slot comparison
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        // Check if the time slot is available by looking at the doctor's booked slots
        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          // If the slot is available, add it to the timeSlots array
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime
          });
        }

        // Increment the current time by 30 minutes for the next slot
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      // Add the time slots for the current day to the overall docSlots state
      setDocSlots(prev => ([...prev, timeSlots]));
    }
  };

  // Function to book an appointment by sending the selected time slot to the backend
  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment');
      return navigate('/login');
    }

    if (!docSlots[slotIndex] || !docSlots[slotIndex][0]) {
      toast.error('Please select a valid slot');
      return;
    }

    // Formatting the selected date for backend processing
    const date = docSlots[slotIndex][0].dateTime;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    const slotDate = `${day}_${month}_${year}`;

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData(); // Refresh doctor data after booking
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch doctor info when docId changes
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  // Fetch available slots when doctor info is ready
  useEffect(() => {
    if (docInfo) {
      getAvailableSlot();
    }
  }, [docInfo]);

  // Log available slots whenever they are updated (for debugging purposes)
  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return docInfo && (
    <div>
      {/* --------- Doc Details --------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* --------------doc info : name, degree, experience ------------- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex item-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* -------doctor about ------ */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/* --------- Booking slots ---------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`} key={index}>
                <p>{item[0] && daysofWeek[item[0].dateTime.getDay()]}</p>
                <p>{item[0] && item[0].dateTime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
          ))}
        </div>

        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
      </div>

      {/* Listing Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
