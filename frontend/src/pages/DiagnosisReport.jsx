import React from 'react';

const DiagnosisReport = () => {
    // Sample data structure for doctor's diagnosis
    const diagnosis = {
        doctor: 'Dr. Smith',
        date: '2024-10-13',
        condition: 'Hypertension',
        treatmentPlan: 'Prescribed medication for blood pressure, recommended dietary changes and regular exercise.',
        notes: 'Follow up in 2 weeks.'
    };

    // Sample AI suggestions for home care
    const aiSuggestions = [
        'Reduce salt intake to help manage blood pressure.',
        'Engage in at least 30 minutes of moderate exercise daily, like walking.',
        'Practice stress-relief techniques such as meditation or deep breathing.',
        'Monitor your blood pressure regularly at home and keep a record.',
        'Stay hydrated by drinking plenty of water throughout the day.'
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Doctor's Diagnosis Report</h1>
            <div className="space-y-2">
                <p><strong>Doctor:</strong> {diagnosis.doctor}</p>
                <p><strong>Date:</strong> {diagnosis.date}</p>
                <p><strong>Condition:</strong> {diagnosis.condition}</p>
                <p><strong>Treatment Plan:</strong> {diagnosis.treatmentPlan}</p>
                <p><strong>Notes:</strong> {diagnosis.notes}</p>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">AI Home Care Suggestions</h2>
                <ul className="list-disc list-inside space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DiagnosisReport;