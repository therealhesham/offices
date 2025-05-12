'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { NewOrder, ArrivalList } from '@/app/lib/types';
import Sidebar from '@/app/components/Sidebar';

const stages = [
  'الربط مع مساند',
  'الربط مع مساند الخارجي',
  'الربط مع المكتب الخارجي',
  'الفحص الطبي',
  'الربط مع الوكالة',
  'التختيم في السفارة',
  'حجز التذكرة',
  'الاستلام',
];

const TimelinePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<NewOrder | null>(null);
  const [arrival, setArrival] = useState<ArrivalList | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/neworder/${id}`);
        const data = await response.json();
        setOrder(data.order);
        setArrival(data.arrival);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="rounded-full h-16 w-16 border-t-4 border-indigo-500"
        ></motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-red-500 text-xl font-semibold py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        Order not found
      </div>
    );
  }

  const currentStageIndex = order.bookingstatus ? stages.indexOf(order.bookingstatus) : -1;
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className={`min-h-screen flex flex-column font-sans`}>

    <Sidebar/>
    <div className="min-h-screen flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Order Timeline: <span className="text-indigo-600">{order.ClientName}</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">Track the progress of your order in real-time</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                  Progress: {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-indigo-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600"></div>

          {stages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const stageDetails = getStageDetails(stage, arrival);
            const isExpanded = expandedStage === stage;

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="mb-10 flex items-start"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-white border-4 border-indigo-200 shadow-lg z-10"
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  ) : isCurrent ? (
                    <FaHourglassHalf className="text-yellow-500 text-2xl" />
                  ) : (
                    <FaTimesCircle className="text-gray-400 text-2xl" />
                  )}
                </motion.div>

                {/* Content */}
                <div className="ml-8 w-full">
                  <motion.div
                    className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => setExpandedStage(isExpanded ? null : stage)}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800">{stage}</h2>
                      <FaInfoCircle className="text-indigo-500 text-lg" />
                    </div>
                    <p className="text-gray-600 mt-2 font-medium">
                      {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                    </p>
                    <AnimatePresence>
                      {isExpanded && stageDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 text-gray-700"
                        >
                          {Object.entries(stageDetails).map(([key, value]) => (
                            <p key={key} className="flex items-center space-x-2">
                              <span className="font-semibold text-indigo-600">{key}:</span>
                              <span>{value}</span>
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};

// Helper function to map stage to arrivallist details
const getStageDetails = (stage: string, arrival: ArrivalList | null) => {
  if (!arrival) return null;

  switch (stage) {
    case 'الربط مع مساند':
      return {
        'Internal Musaned Contract': arrival.InternalmusanedContract || 'N/A',
        'Date of Application': arrival.DateOfApplication?.toString() || 'N/A',
      };
    case 'الربط مع مساند الخارجي':
      return {
        'External Musaned Contract': arrival.externalmusanedContract || 'N/A',
        'External Date Linking': arrival.ExternalDateLinking?.toString() || 'N/A',
      };
    case 'الربط مع المكتب الخارجي':
      return {
        'External Office Approval': arrival.ExternalOFficeApproval?.toString() || 'N/A',
        'External Office File': arrival.externalOfficeFile || 'N/A',
      };
    case 'الفحص الطبي':
      return {
        'Medical Check File': arrival.medicalCheckFile || 'N/A',
      };
    case 'الربط مع الوكالة':
      return {
        'Agency Date': arrival.AgencyDate?.toString() || 'N/A',
      };
    case 'التختيم في السفارة':
      return {
        'Embassy Sealing': arrival.EmbassySealing?.toString() || 'N/A',
      };
    case 'حجز التذكرة':
      return {
        'Ticket File': arrival.ticketFile || 'N/A',
        'Booking Date': arrival.BookinDate?.toString() || 'N/A',
      };
    case 'الاستلام':
      return {
        'Receiving File': arrival.receivingFile || 'N/A',
        'Delivery Date': arrival.DeliveryDate?.toString() || 'N/A',
      };
    default:
      return null;
  }
};

export default TimelinePage;