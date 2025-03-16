'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '../lib/actions';
import {useRouter} from 'next/navigation'
export default function Login() {
  const router = useRouter()
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
 


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !password) {
      setError('Please fill in all fields.');
      return;


    }
const Posting = await fetch("/api/login",{method:"POST",body:JSON.stringify({id,password}),headers:{"accept":"application/json"}})
const post = await Posting.json();

localStorage.setItem("_item",post.token)
// console.log(post.token)    
setError('');
router.push("/home")
    // alert('Logging in...');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">تسجيل دخول</h2>
        
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="id" className="block text-sm font-semibold text-gray-700">
              id
            </label>
            <input
              type="id"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your id"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log In
          </button>
        </form>

      </div>
    </div>
  );
}
