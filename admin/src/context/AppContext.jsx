import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Corrected function to format the date and ensure correct month and time display
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        const day = dateArray[0];
        const monthIndex = Number(dateArray[1]) - 1; // Adjust month index
        const year = dateArray[2];

        // Validate month index to ensure it is within range
        if (monthIndex < 0 || monthIndex > 11) {
            console.error("Invalid month index in slotDate:", slotDate);
            return slotDate; // Return the original string if invalid
        }

        // Ensure day and year are valid numbers
        if (isNaN(day) || isNaN(year)) {
            console.error("Invalid day or year in slotDate:", slotDate);
            return slotDate; // Return the original string if invalid
        }

        // Format the date properly
        const formattedDate = `${day} ${months[monthIndex]} ${year}`;

        // Optionally, add time if required (e.g., "20 Jan 2000, 10:30 AM")
        // Assuming slotDate includes time in "20_01_2000_1030" format
        if (dateArray.length === 4) {
            const time = dateArray[3];
            const hours = time.slice(0, 2);
            const minutes = time.slice(2, 4);
            const formattedTime = `${hours}:${minutes}`;
            return `${formattedDate}, ${formattedTime}`;
        }

        return formattedDate;
    };

    // Function to calculate the age eg. ( 20_01_2000 => 24 )
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
    };

    const value = {
        backendUrl,
        currency,
        slotDateFormat,
        calculateAge,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;