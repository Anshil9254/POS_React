import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Fingerprint } from 'lucide-react';
import bgImage from '../../assets/images/bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed. Please try again.');
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
                    <h2 className="text-[2rem] font-[800] text-[#111] mb-[30px]">Login</h2>

                    {error && (
                        <div className="bg-[#f8d7da] border-[#f5c6cb] text-[#721c24] p-3 mb-4 rounded-[12px] text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Email Input */}
                        <div className="mb-[20px] relative">
                            <label className="hidden">Email Address</label>
                            <div className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#6c757d] text-[1.2rem] z-[2]">
                                <User strokeWidth={2} size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full py-[15px] pr-[20px] pl-[55px] border-[2px] border-[#eaeaea] rounded-[12px] text-[1rem] text-[#333] bg-[#fff] transition-all duration-300 focus:border-[#4285f4] focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] focus:outline-none placeholder:text-[#a0a0a0]"
                                placeholder="Email Address"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-[20px] relative">
                            <label className="hidden">Password</label>
                            <div className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#6c757d] text-[1.2rem] z-[2]">
                                <Lock strokeWidth={2} size={20} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-[15px] pr-[20px] pl-[55px] border-[2px] border-[#eaeaea] rounded-[12px] text-[1rem] text-[#333] bg-[#fff] transition-all duration-300 focus:border-[#4285f4] focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] focus:outline-none placeholder:text-[#a0a0a0]"
                                placeholder="Password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {/* Remember Me / Forgot Password */}
                        <div className="flex justify-between items-center mb-[25px]">
                            
                            <Link to="/forgot-password" className="text-[#4285f4] text-sm font-[600] no-underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full p-[16px] border-none rounded-[12px] text-[#fff] text-[1.1rem] font-[600] mb-[30px] transition-all duration-300 ${
                                isLoading 
                                    ? 'bg-[#89a8e0] cursor-not-allowed' 
                                    : 'bg-[#4285f4] hover:bg-[#3367d6] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(66,133,244,0.3)] cursor-pointer'
                            }`}
                        >
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
