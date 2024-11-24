import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = "฿";
    const backendUrl = import.meta.env.VITE_BACKEND_URL; // Fetching the backend URL from environment variables

    const [doctors, setDoctors] = useState([]); // State to store the list of doctors


    // Retrieving the user token from localStorage (if available)
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : ''); 


    const [userData, setUserData] = useState(false); // State to store user profile data



    // Function to fetch the list of doctors from the backend
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors); // Update the state with the list of doctors if successful
            } else {
                toast.error(data.message); // Show error message if the request fails
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message); // Handle any errors during the API request
        }
    };

    // Function to load the user profile data
    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } }); // Pass token in the headers for authentication
            if (data.success) {
                setUserData(data.userData); // Set user data if the request is successful
            } else {
                toast.error(data.message); // Show error message if the request fails
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message); // Handle any errors during the API request
        }
    };

    const value = {
        doctors, getDoctorsData, 
        currencySymbol, 
        token, setToken, 
        backendUrl, 
        userData, setUserData, 
        loadUserProfileData 
    };

    // useEffect to fetch doctor data when the component mounts
    useEffect(() => {
        getDoctorsData();
    }, []);

    // useEffect to load user profile data when the token changes (i.e., when user logs in/out)
    useEffect(() => {
        if (token) {
            loadUserProfileData(); // Load profile if token exists (user is logged in)
        } else {
            setUserData(false); // Clear user data if token is not available
        }
    }, [token]); // Dependency array ensures this effect runs when 'token' changes

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
