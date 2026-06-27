export interface DoctorSchedule {
  id: string;
  name: string;
  department: string;
  specialization: string;
  availableFrom: string;
  availableTo: string;
  slotDurationMinutes: number;
  todaySlots: { time: string; status: 'available' | 'booked' | 'in_progress' }[];
}

export const DOCTOR_SCHEDULES: DoctorSchedule[] = [
  {
    id: 'dr-001',
    name: 'Dr. Rajesh Mehta',
    department: 'General Medicine',
    specialization: 'Health Check-up Consultation',
    availableFrom: '09:00',
    availableTo: '17:00',
    slotDurationMinutes: 15,
    todaySlots: [
      { time: '09:00', status: 'booked' },
      { time: '09:15', status: 'in_progress' },
      { time: '09:30', status: 'available' },
      { time: '09:45', status: 'available' },
      { time: '10:00', status: 'booked' },
      { time: '10:15', status: 'available' },
    ],
  },
  {
    id: 'dr-002',
    name: 'Dr. Priya Nair',
    department: 'Cardiology',
    specialization: 'ECG / Echo / TMT Review',
    availableFrom: '10:00',
    availableTo: '16:00',
    slotDurationMinutes: 20,
    todaySlots: [
      { time: '10:00', status: 'available' },
      { time: '10:20', status: 'available' },
      { time: '10:40', status: 'booked' },
      { time: '11:00', status: 'available' },
    ],
  },
  {
    id: 'dr-003',
    name: 'Dr. Amit Shah',
    department: 'Radiology',
    specialization: 'X-Ray / USG / Mammography',
    availableFrom: '08:00',
    availableTo: '14:00',
    slotDurationMinutes: 30,
    todaySlots: [
      { time: '08:00', status: 'booked' },
      { time: '08:30', status: 'in_progress' },
      { time: '09:00', status: 'available' },
      { time: '09:30', status: 'available' },
    ],
  },
  {
    id: 'dr-004',
    name: 'Dr. Sneha Gupta',
    department: 'Dental',
    specialization: 'Dental Check-up',
    availableFrom: '09:30',
    availableTo: '15:30',
    slotDurationMinutes: 20,
    todaySlots: [
      { time: '09:30', status: 'available' },
      { time: '09:50', status: 'booked' },
      { time: '10:10', status: 'available' },
      { time: '10:30', status: 'available' },
    ],
  },
];
