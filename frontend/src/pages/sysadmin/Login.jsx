import React, { useState } from 'react';

export function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.data);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-green-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-800">System Admin Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mb-5">
          <label htmlFor="username" className="block mb-2 font-medium text-green-700">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border-2 border-green-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 font-medium text-green-700">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-2 border-green-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Login
        </button>
        
        <div className="mt-6 text-center">
          <div className="w-full h-px bg-green-200 mb-4"></div>
          <p className="text-sm text-green-600">
            Secure access to the administration system
          </p>
        </div>
      </form>
    </div>
  );
}
