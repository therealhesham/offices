'use client';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/app/components/Sidebar';
import { PencilIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Homemaid {
  id: number;
  Name: string | null;
  Nationalitycopy: string | null;
  age: number | null;
  Passportnumber: string | null;
  Religion: string | null;
  maritalstatus: string | null;
  dateofbirth: string | null;
  ExperienceYears: string | null;
  Experience: string | null;
  experienceType: string | null;
  ArabicLanguageLeveL: string | null;
  EnglishLanguageLevel: string | null;
  Salary: string | null;
  LaundryLeveL: string | null;
  IroningLevel: string | null;
  CleaningLeveL: string | null;
  CookingLeveL: string | null;
  SewingLeveL: string | null;
  BabySitterLevel: string | null;
  Education: string | null;
  OldPeopleCare: boolean | null;
  PassportStart: string | null;
  PassportEnd: string | null;
  phone: string | null;
  clientphonenumber: string | null;
  bookingstatus: string | null;
  officeName: string | null;
  Picture?: { url: string } | null;
  FullPicture?: { url: string } | null;
  weeklyStatusId: { id: number; status: string; date: string }[];
  NewOrder: { id: number; ClientName: string; bookingstatus: string }[];
  Session: { id: number; reason: string; date: string }[];
  Housed: { id: number; isHoused: boolean }[];
  inHouse: { id: number; houseentrydate: string; checkIns: { id: number; breakfastOption: string }[] }[];
  logs: { id: number; Status: string; createdAt: string }[];
}

const CVDetailsPage = () => {
  const params = useParams();
  const [homemaid, setHomemaid] = useState<Homemaid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const router = useRouter();
const {language} = useLanguage()
  useEffect(() => {
    const fetchHomemaid = async () => {
      try {
        const response = await axios.get(`/api/homemaid/${params.id}`);
        setHomemaid(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load CV details');
        setLoading(false);
      }
    };

    fetchHomemaid();
  }, [params.id]);

  useEffect(() => {
    fetchImageDate(homemaid?.Name || "");
  }, [homemaid]);

  async function fetchImageDate(name: string) {
    const fetchData = await fetch("/api/getimagefromprisma/" + name, {
      method: "get",
    });
    const parser = await fetchData.json();
    console.log(parser);
    setImage(parser.result);
  };

  const handleEditClick = () => {
    // Replace with actual edit logic (e.g., redirect to edit page or open modal)
    alert('Edit functionality to be implemented!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !homemaid) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error || 'Homemaid not found'}</p>
      </div>
    );
  }

  return (
       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
         <div className={`flex flex-row`}>
          <Sidebar />
   
           <div className="container mx-auto p-6 flex-1">
      <motion.div
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {image ? (
                <Image
                  src={image}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600">No Image</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{homemaid.Name || 'N/A'}</h1>
                <p className="text-lg">{homemaid.Nationalitycopy || 'N/A'}</p>
                <p className="text-sm">Age: {homemaid.age || 'N/A'}</p>
              </div>
            </div>
            <motion.button
                      onClick={() => router.push(`/edit-cv/${homemaid.id}`)}

              className="flex items-center space-x-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-100 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Personal Information */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Passport Number:</strong>{' '}
                  {homemaid.Passportnumber || 'N/A'}
                </p>
                <p>
                  <strong>Religion:</strong> {homemaid.Religion || 'N/A'}
                </p>
                <p>
                  <strong>Marital Status:</strong>{' '}
                  {homemaid.maritalstatus || 'N/A'}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{' '}
                  {homemaid.dateofbirth || 'N/A'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Phone:</strong> {homemaid.phone || 'N/A'}
                </p>
                <p>
                  <strong>Client Phone:</strong>{' '}
                  {homemaid.clientphonenumber || 'N/A'}
                </p>
                <p>
                  <strong>Booking Status:</strong>{' '}
                  {homemaid.bookingstatus || 'N/A'}
                </p>
                <p>
                  <strong>Office:</strong> {homemaid.officeName || 'N/A'}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Skills */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Arabic Language Level:</strong>{' '}
                  {homemaid.ArabicLanguageLeveL || 'N/A'}
                </p>
                <p>
                  <strong>English Language Level:</strong>{' '}
                  {homemaid.EnglishLanguageLevel || 'N/A'}
                </p>
                <p>
                  <strong>Laundry Level:</strong>{' '}
                  {homemaid.LaundryLeveL || 'N/A'}
                </p>
                <p>
                  <strong>Ironing Level:</strong>{' '}
                  {homemaid.IroningLevel || 'N/A'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Cleaning Level:</strong>{' '}
                  {homemaid.CleaningLeveL || 'N/A'}
                </p>
                <p>
                  <strong>Cooking Level:</strong>{' '}
                  {homemaid.CookingLeveL || 'N/A'}
                </p>
                <p>
                  <strong>Babysitting Level:</strong>{' '}
                  {homemaid.BabySitterLevel || 'N/A'}
                </p>
                <p>
                  <strong>Sewing Level:</strong> {homemaid.SewingLeveL || 'N/A'}
                </p>
              </div>
            </div>
            <p className="mt-4">
              <strong>Old People Care:</strong>{' '}
              {homemaid.OldPeopleCare ? 'Yes' : 'No'}
            </p>
          </motion.section>

          {/* Experience */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Experience
            </h2>
            <p>
              <strong>Years of Experience:</strong>{' '}
              {homemaid.ExperienceYears || 'N/A'}
            </p>
            <p>
              <strong>Experience Type:</strong>{' '}
              {homemaid.experienceType || 'N/A'}
            </p>
            <p>
              <strong>Details:</strong> {homemaid.Experience || 'N/A'}
            </p>
            <p>
              <strong>Education:</strong> {homemaid.Education || 'N/A'}
            </p>
          </motion.section>

          {/* Weekly Status */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Weekly Status
            </h2>


            {homemaid.weeklyStatusId.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.weeklyStatusId.map((status) => (
                  <li key={status.id}>
                    {status.status} - {new Date(status.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No weekly status available</p>
            )}
          </motion.section>

          {/* Housing Details */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Housing Details
            </h2>
            {homemaid.inHouse.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.inHouse.map((housing) => (
                  <li key={housing.id}>
                    Entry Date:{' '}
                    {new Date(housing.houseentrydate).toLocaleDateString()}
                    <ul className="ml-5">
                      {housing.checkIns.map((checkIn) => (
                        <li key={checkIn.id}>
                          Breakfast: {checkIn.breakfastOption || 'N/A'}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No housing details available</p>
            )}
          </motion.section>

          {/* Orders */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Orders</h2>
            {homemaid.NewOrder.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.NewOrder.map((order) => (
                  <li key={order.id}>
                    Client: {order.ClientName} - Status: {order.bookingstatus}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders available</p>
            )}
          </motion.section>

          {/* Sessions */}
          <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Sessions
            </h2>
            {homemaid.Session.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.Session.map((session) => (
                  <li key={session.id}>
                    Reason: {session.reason} - Date:{' '}
                    {new Date(session.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sessions available</p>
            )}
          </motion.section>
        </div>
      </motion.div>
    </div>
    </div>
    </div>

  );
};

export default CVDetailsPage;