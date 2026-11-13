import { PaymentChannel } from '../types';

export const INITIAL_PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: 'pay-bkash-1',
    gateway: 'bkash',
    number: '01646-475348',
    accountType: 'Personal',
    accountHolderName: 'Md. Ashraful Islam Sultan (CoLASH Founder)',
    instructionBn: 'বিকাশ অ্যাপ বা *247# ডায়াল করে "Send Money" (সেন্ড মানি) করুন। রেফারেন্সে আপনার নাম বা মেম্বার আইডি লিখুন।',
    instructionEn: 'Send Money to this personal bKash number. Put your name or Member ID in reference.',
    isActive: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-bkash-2',
    gateway: 'bkash',
    number: '01712-345678',
    accountType: 'Merchant',
    accountHolderName: 'CoLASH Foundation Official',
    instructionBn: 'বিকাশ অ্যাপের "Make Payment" (পেমেন্ট) অপশনে গিয়ে এই মার্চেন্ট নম্বরে অনুদান পাঠান। কাউন্টার নম্বর: 1',
    instructionEn: 'Use "Make Payment" option in bKash app to send donation to this merchant account. Counter: 1',
    isActive: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-nagad-1',
    gateway: 'nagad',
    number: '01308-241288',
    accountType: 'Personal',
    accountHolderName: 'CoLASH Welfare Helpline',
    instructionBn: 'নগদ অ্যাপ বা *167# ডায়াল করে "Send Money" (সেন্ড মানি) করুন। ট্রানজেকশন সম্পন্ন হলে TrxID সংরক্ষণ করুন।',
    instructionEn: 'Send Money to this personal Nagad number. Keep the TrxID after sending.',
    isActive: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'pay-nagad-2',
    gateway: 'nagad',
    number: '01911-889900',
    accountType: 'Merchant',
    accountHolderName: 'CoLASH Humanitarian Fund',
    instructionBn: 'নগদ অ্যাপের "মার্চেন্ট পে" (Merchant Pay) অপশন ব্যবহার করে অনুদান পাঠান। রেফারেন্স: DONATE',
    instructionEn: 'Use Nagad Merchant Pay option. Reference: DONATE',
    isActive: true,
    createdAt: '2026-01-01'
  }
];

export const PAYMENT_CHANNELS_STORAGE_KEY = 'colash_dynamic_payment_channels';
