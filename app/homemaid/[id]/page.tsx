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
import { homemaidDisplayAge, homemaidLevel } from '@/app/lib/homemaidLevels';

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
  Education: string | null;
  Salary: string | null;
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

function getDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const currentDate = new Date(date);
  const formatted =
    currentDate.getDate() +
    '/' +
    (currentDate.getMonth() + 1) +
    '/' +
    currentDate.getFullYear();
  return formatted;
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
        const response = await fetch(`/api/homemaid/${params.id}`);
        if (response.redirected) {
            // alert(response.url)
            // Redirect to the URL specified in the response
            router.push(response.url);
            return;
          }
          const jsonify = await response.json()
    
          setHomemaid(jsonify);
          setLoading(false);
      } catch (err) {
        setError('Failed to load CV details');
        setLoading(false);
      }
    };

    fetchHomemaid();
  }, [params.id]);

  useEffect(() => {
    fetchImageDateAirtable(homemaid?.Name || "");
  }, [homemaid]);

  async function fetchImageDateAirtable(name: string) {
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
                  src={image?.includes("airtable") ? image : homemaid.Picture?.url || ""}
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
                <p className="text-sm">
                  Age: {homemaidDisplayAge(homemaid as unknown as Record<string, unknown>)}
                </p>
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
                  {getDate(homemaid.dateofbirth) ?? 'N/A'}
                </p>
                <p>
                  <strong>Passport Start:</strong>{' '}
                  {getDate(homemaid.PassportStart) ?? 'N/A'}
                </p>
                <p>
                  <strong>Passport End:</strong>{' '}
                  {getDate(homemaid.PassportEnd) ?? 'N/A'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Salary:</strong> {homemaid.Salary || 'N/A'}
                </p>
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
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'arabic')}
                </p>
                <p>
                  <strong>English Language Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'english')}
                </p>
                <p>
                  <strong>Laundry Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'laundry')}
                </p>
                <p>
                  <strong>Washing Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'washing')}
                </p>
                <p>
                  <strong>Ironing Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'ironing')}
                </p>
              </div>
              <div>
                <p>
                  <strong>Cleaning Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'cleaning')}
                </p>
                <p>
                  <strong>Cooking Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'cooking')}
                </p>
                <p>
                  <strong>Childcare / Babysitting:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'childcare')}
                </p>
                <p>
                  <strong>Sewing Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'sewing')}
                </p>
                <p>
                  <strong>Elderly Care Level:</strong>{' '}
                  {homemaidLevel(homemaid as unknown as Record<string, unknown>, 'elderly')}
                </p>
              </div>
            </div>
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

          {/* Weekly Status — disabled */}
          {/* <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Weekly Status
            </h2>

            {homemaid.weeklyStatusId?.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.weeklyStatusId?.map((status) => (
                  <li key={status.id}>
                    {status.status} - {getDate(status.date) ?? 'N/A'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No weekly status available</p>
            )}
          </motion.section> */}

          {/* Housing Details — disabled */}
          {/* <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Housing Details
            </h2>
            {homemaid.inHouse?.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.inHouse?.map((housing) => (
                  <li key={housing.id}>
                    Entry Date: {getDate(housing.houseentrydate) ?? 'N/A'}
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
          </motion.section> */}

          {/* Orders — disabled */}
          {/* <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Orders</h2>
            {homemaid.NewOrder?.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.NewOrder?.map((order) => (
                  <li key={order.id}>
                    Client: {order.ClientName} - Status: {order.bookingstatus}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders available</p>
            )}
          </motion.section> */}

          {/* Sessions — disabled */}
          {/* <motion.section
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Sessions
            </h2>
            {homemaid.Session?.length > 0 ? (
              <ul className="list-disc pl-5">
                {homemaid.Session?.map((session) => (
                  <li key={session.id}>
                    Reason: {session.reason} - Date:{' '}
                    {getDate(session.date) ?? 'N/A'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sessions available</p>
            )}
          </motion.section> */}
        </div>
      </motion.div>
    </div>
    </div>
    </div>

  );
};

export default CVDetailsPage;