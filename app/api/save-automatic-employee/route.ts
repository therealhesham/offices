import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Map form data to AutomaticEmployee schema
    const employeeData = {
      name: formData.Name || '',
      age: String(formData.age || ''),
      religion: formData.Religion || '',
      maritalStatus: formData.maritalStatus || '',
      birthDate: formData.dateOfbirth || '',
      nationality: formData.nationality || '',
      officeName: formData.officeName || '',
      passportNumber: formData.passportNumber || '',
      passportStartDate: formData.PassportStart || '',
      passportEndDate: formData.PassportEnd || '',
      contractDuration: formData.contractDuration || '',
      weight: String(formData.weight || ''),
      height: String(formData.height || ''),
      salary: String(formData.salary || ''),
      profileImage: formData.personalImage || null,
      fullImage: formData.fullBodyImage || null,
      
      // Flattened skill fields
      skill_washing: String(formData.skills?.laundry || ''),
      skill_cooking: String(formData.skills?.cooking || ''),
      skill_babysetting: String(formData.skills?.babySitting || ''),
      skill_cleaning: String(formData.skills?.cleaning || ''),
      skill_laundry: String(formData.skills?.laundry || ''),
      
      // Flattened language fields
      lang_english: String(formData.languageSkills?.english || ''),
      lang_arabic: String(formData.languageSkills?.arabic || ''),
    };

    console.log('Saving to AutomaticEmployee:', JSON.stringify(employeeData, null, 2));

    // Create the employee record in AutomaticEmployee table
    const employeeRecord = await prisma.AutomaticEmployee.create({
      data: employeeData
    });

    console.log('Created AutomaticEmployee record:', employeeRecord);

    return new Response(JSON.stringify({
      success: true,
      employeeId: employeeRecord.id,
      message: 'Employee data saved successfully to AutomaticEmployee table'
    }), { status: 200 });

  } catch (error) {
    console.error('Error saving to AutomaticEmployee:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to save employee data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}
