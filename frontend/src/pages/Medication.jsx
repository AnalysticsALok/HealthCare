import React, { useState } from 'react';

const Medication = () => {
    const [medication, setMedication] = useState({
        name: '',
        dosage: '',
        timeTaken: ''
    });

    const handleChange = (e) => {
        setMedication({
            ...medication,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Code to submit the form data to the backend
        console.log('Medication data submitted:', medication);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Track Your Medication</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Medication Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={medication.name}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full"
                    />
                </div>
                <div>
                    <label htmlFor="dosage" className="block text-sm font-medium">Dosage</label>
                    <input
                        type="text"
                        id="dosage"
                        name="dosage"
                        value={medication.dosage}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full"
                    />
                </div>
                <div>
                    <label htmlFor="timeTaken" className="block text-sm font-medium">Time Taken</label>
                    <input
                        type="text"
                        id="timeTaken"
                        name="timeTaken"
                        value={medication.timeTaken}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Submit</button>
            </form>
        </div>
    );
};

export default Medication;