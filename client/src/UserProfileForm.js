import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        profilePhoto: null,
        username: '',
        currentPassword: '',
        newPassword: '',
        profession: '',
        companyName: '',
        addressLine1: '',
        country: '',
        state: '',
        city: '',
        subscriptionPlan: 'Basic',
        newsletter: true,
    });
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            const response = await axios.get('http://localhost:5000/api/countries');
            setCountries(response.data);
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Remove spaces for username
        const sanitizedValue = name === 'username' ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: sanitizedValue });

        if (name === 'country') {
            setFormData({ ...formData, state: '', city: '', country: sanitizedValue }); // Reset state and city
            fetchStates(sanitizedValue);
        } else if (name === 'state') {
            setFormData({ ...formData, city: '', state: sanitizedValue }); // Reset city
            fetchCities(sanitizedValue);
        }
    };

    const fetchStates = async (country) => {
        const response = await axios.get(`http://localhost:5000/api/states/${country}`);
        setStates(response.data);
    };

    const fetchCities = async (state) => {
        const response = await axios.get(`http://localhost:5000/api/cities/${state}`);
        setCities(response.data);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profilePhoto: e.target.files[0] });
    };

    const noSpaces = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 3) {
            const formDataToSend = new FormData();

            for (const key in formData) {
                if (key === 'profilePhoto' && formData.profilePhoto) {
                    formDataToSend.append('profilePhoto', formData.profilePhoto);
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            }

            try {
                const response = await axios.post('http://localhost:5000/api/user', formDataToSend);
                alert('Profile updated successfully!');
            } catch (err) {
                console.error(err);
                alert('Error: ' + (err.response?.data?.error || 'Something went wrong'));
            }
        } else {
            setStep(step + 1);
        }
    };


    return (
        <form onSubmit={handleSubmit} >
            {step === 1 && (
                <div>
                    <h2>Step 1: Personal Info</h2>
                    <label htmlFor="profilePhoto">Image upload</label>
                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        name="profilePhoto"
                        onChange={handleFileChange}
                        required
                    />
                    <br /><br />

                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        minLength={4}
                        maxLength={20}
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        onKeyDown={noSpaces}
                        required
                    />
                    <br /><br />

                    <input
                        type="password"
                        name="currentPassword"
                        placeholder="Current Password"
                        onChange={handleChange}
                    /> <br /> <br />
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        onChange={handleChange}
                        required
                        pattern="^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                        title="Password must be at least 8 characters long, include 1 number and 1 special character."
                    />
                    <br /> <br />
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2>Step 2: Professional Details</h2>
                    <select name="profession" onChange={handleChange} required>
                        <option value="">Select Profession</option>
                        <option value="Student">Student</option>
                        <option value="Developer">Developer</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                    </select> <br />
                    {formData.profession === 'Entrepreneur' && (
                        <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name"
                            onChange={handleChange}
                            required
                        />
                    )} <br /> <br />
                    <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1"
                        onChange={handleChange}
                        required
                    />
                    <br /> <br />
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2>Step 3: Preferences</h2>
                    <select name="country" onChange={handleChange} required>
                        <option value="">Select Country</option>
                        {countries.map((country, index) => (
                            <option key={index} value={country.name}>{country.name}</option>
                        ))}
                    </select> <br /> <br />
                    <select name="state" onChange={handleChange} required>
                        <option value="">Select State</option>
                        {states.map((state, index) => (
                            <option key={index} value={state}>{state}</option>
                        ))}
                    </select> <br /> <br />
                    <select name="city" onChange={handleChange} required>
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                    <br /> <br />
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="subscriptionPlan"
                                value="Basic"
                                checked={formData.subscriptionPlan === 'Basic'}
                                onChange={handleChange}
                            />
                            Basic
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="subscriptionPlan"
                                value="Pro"
                                checked={formData.subscriptionPlan === 'Pro'}
                                onChange={handleChange}
                            />
                            Pro
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="subscriptionPlan"
                                value="Enterprise"
                                checked={formData.subscriptionPlan === 'Enterprise'}
                                onChange={handleChange}
                            />
                            Enterprise
                        </label>
                    </div>

                    <label>
                        <input
                            type="checkbox"
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={() =>
                                setFormData({ ...formData, newsletter: !formData.newsletter })
                            }
                        />
                        Subscribe to Newsletter
                    </label>
                </div>
            )}
            <button type="submit">{step === 3 ? 'Submit' : 'Next'}</button>
        </form>
    );
};

export default UserProfileForm;
