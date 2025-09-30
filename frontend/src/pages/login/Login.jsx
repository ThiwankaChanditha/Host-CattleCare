import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import illustration from "./illustration.png";
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../utility/translations';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const { language, changeLanguage } = useLanguage();

    const t = useMemo(() => {
        return translations.login[language] || translations.login.en;
    }, [language]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 
        setLoading(true); 

        try {
            const response = await axios.post("http://localhost:5000/api/login", { email, password });
            setLoading(false);

            const { user: userDetails, token } = response.data;

            console.log("Login.jsx: Backend Login Response Data:", response.data);
            console.log("Login.jsx: Extracted User Details:", userDetails);
            console.log("Login.jsx: Extracted Token:", token);

            if (userDetails && userDetails.dashboard && token) {
                const userWithToken = {
                    ...userDetails,
                    token: token,
                };

                console.log("Login.jsx: Passing userWithToken to AuthContext login:", userWithToken);

                const loginSuccessfulInContext = login(userWithToken);

                console.log("Login.jsx: Result of AuthContext login function:", loginSuccessfulInContext);


                if (loginSuccessfulInContext) {
                    navigate(`/${userDetails.dashboard.replace("_dashboard", "")}/dashboard`);
                } else {
                    setError(t.loginFailedError || "Login failed in AuthContext. Check console for details.");
                }
            } else {
                setError(t.invalidRoleError || "Invalid user data received from server or authentication token missing.");
            }
        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || t.loginFailedError;
            setError(errorMessage);
            console.error("Login.jsx: Login Error:", err.response?.data || err.message || err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-gradient-to-br from-green-300 to-green-500 text-white p-8 flex flex-col justify-center items-center">
                    <h2 className="text-3xl font-bold mb-4 text-center">{t.welcomeTitle}</h2>
                    <img src={illustration} alt="Illustration" className="w-64 mb-6" />
                    <p className="text-center text-sm max-w-xs">
                        {t.tagline}
                    </p>
                </div>

                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6">{t.loginTitle}</h3>
                    <form onSubmit={handleLogin} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="text-gray-600 text-sm">{t.emailLabel}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="text-gray-600 text-sm">{t.passwordLabel}</label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-sm text-green-600 select-none"
                                aria-label={showPassword ? t.hidePassword : t.showPassword}
                            >
                                {showPassword ? t.hidePassword : t.showPassword}
                            </button>
                        </div>

                        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

                        <button
                            type="submit"
                            className={`w-full py-2 rounded-lg text-white font-semibold ${loading
                                ? "bg-green-300 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 transition duration-300"
                                }`}
                            disabled={loading}
                        >
                            {loading ? t.loggingInButton : t.loginButton}
                        </button>
                    </form>

                    <div className="text-sm text-center mt-6 text-gray-500">
                        <p>
                            <a href="#" className="text-green-600 hover:underline" onClick={(e) => e.preventDefault()}>
                                {t.forgotPassword}
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4">
                <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="p-2 rounded-lg bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                    <option value="ta">தமிழ்</option>
                </select>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-4 text-gray-400 text-sm text-center w-full">
                &copy; {new Date().getFullYear()} CattleCare. {t.copyright}
            </footer>
        </div>
    );
}