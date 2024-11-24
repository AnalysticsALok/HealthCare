import React, { useState } from 'react';

const PatientMedicalDataForm = () => {
  const [patientData, setPatientData] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    followUp: '',
  });

  const [medicalSummary, setMedicalSummary] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMedicalSummary([...medicalSummary, patientData]);
    setPatientData({ symptoms: '', diagnosis: '', treatment: '', medications: '', followUp: '' });
  };

  return (
    <div className="patient-medical-data-form p-8 max-w-xl mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-primary">Patient Medical Data Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Symptoms:</label>
          <input
            type="text"
            name="symptoms"
            value={patientData.symptoms}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Diagnosis:</label>
          <input
            type="text"
            name="diagnosis"
            value={patientData.diagnosis}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Treatment:</label>
          <input
            type="text"
            name="treatment"
            value={patientData.treatment}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Medications:</label>
          <input
            type="text"
            name="medications"
            value={patientData.medications}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Follow-up Recommendations:</label>
          <input
            type="text"
            name="followUp"
            value={patientData.followUp}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <button type="submit" className="mt-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none">
          Save Medical Data
        </button>
      </form>

      <div className="medical-summary mt-10">
        <h3 className="text-xl font-bold mb-4 text-primary">Medical Summary</h3>
        {medicalSummary.length === 0 ? (
          <p className="text-gray-600">No medical data available.</p>
        ) : (
          medicalSummary.map((data, index) => (
            <div key={index} className="border border-gray-300 p-4 rounded-md mb-4">
              <p><strong>Symptoms:</strong> {data.symptoms}</p>
              <p><strong>Diagnosis:</strong> {data.diagnosis}</p>
              <p><strong>Treatment:</strong> {data.treatment}</p>
              <p><strong>Medications:</strong> {data.medications}</p>
              <p><strong>Follow-up Recommendations:</strong> {data.followUp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientMedicalDataForm;
