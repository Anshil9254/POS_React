import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import bgImage from '../../assets/images/bg.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || 'OTP sent successfully.');
                setTimeout(() => {
                    navigate('/verify-otp', { state: { email } });
                }, 2000);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Unable to connect to the server. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen bg-no-repeat bg-right-bottom bg-fixed flex items-center justify-center font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] overflow-hidden m-0"
            style={{ 
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover'
            }}
        >
            <div className="w-full h-screen max-w-[1400px] mx-auto px-[10%] flex flex-col justify-center max-[991px]:items-center max-[991px]:px-[5%] max-[991px]:py-[40px] max-[768px]:justify-center max-[768px]:p-[20px]">
                
                <div className="mb-[25px] max-[991px]:text-center">
                    <h1 className="text-[2.2rem] font-[800] text-[#111] mb-[5px] max-[768px]:text-[2rem]">E-Inventory</h1>
                    <p className="text-[1.1rem] text-[#333] font-[500] m-0">Online inventory management system</p>
                </div>

                <div className="bg-[#fff] w-full max-w-[440px] rounded-[20px] shadow-[0_15px_50px_rgba(0,0,0,0.08)] p-[40px] relative max-[768px]:p-[30px]">
                    <h2 className="text-[2rem] font-[800] text-[#111] mb-[10px]">Forgot Password</h2>
                    <p className="text-[#666] mb-[30px] m-0">Enter your email to receive an OTP</p>

                    {error && (
                        <div className="bg-[#f8d7da] border-[#f5c6cb] text-[#721c24] p-3 mb-4 rounded-[12px] text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-[#d4edda] border-[#c3e6cb] text-[#155724] p-3 mb-4 rounded-[12px] text-sm">
                            {successMessage} Redirection in 2 seconds...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-[20px] relative">
                            <label className="hidden">Email Address</label>
                            <div className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#6c757d] text-[1.2rem] z-[2]">
                                <Mail strokeWidth={2} size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full py-[15px] pr-[20px] pl-[55px] border-[2px] border-[#eaeaea] rounded-[12px] text-[1rem] text-[#333] bg-[#fff] transition-all duration-300 focus:border-[#4285f4] focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] focus:outline-none placeholder:text-[#a0a0a0] mb-[20px]"
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full p-[16px] border-none rounded-[12px] text-[#fff] text-[1.1rem] font-[600] mb-[20px] transition-all duration-300 ${
                                isLoading 
                                    ? 'bg-[#89a8e0] cursor-not-allowed' 
                                    : 'bg-[#4285f4] hover:bg-[#3367d6] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(66,133,244,0.3)] cursor-pointer'
                            }`}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <div className="mt-3 text-center">
                            <Link to="/login" className="inline-flex items-center text-[#4285f4] font-[600] transition-colors duration-300 hover:text-[#3367d6] hover:underline no-underline">
                                <ArrowLeft size={16} className="mr-1" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
