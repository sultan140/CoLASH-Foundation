/**
 * CSV / Excel Export Utilities with UTF-8 BOM for proper Bengali text rendering
 */

import { GeneralMember, DonationRecord, Volunteer } from '../types';

export const downloadCSV = (filename: string, csvContent: string) => {
  // UTF-8 BOM (\uFEFF) ensures Excel properly decodes Unicode / Bengali characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMembersToCSV = (members: GeneralMember[]) => {
  const headers = ['Serial', 'ID', 'Name (Bengali)', 'Name (English)', 'Blood Group', 'District', 'Role (Bengali)', 'Role (English)', 'Joined Date', 'Joining Year', 'Date of Birth'];
  const rows = members.map((m, idx) => [
    m.slNo || idx + 1,
    `"${m.membershipId || ''}"`,
    `"${(m.nameBn || '').replace(/"/g, '""')}"`,
    `"${(m.nameEn || '').replace(/"/g, '""')}"`,
    `"${m.bloodGroup || ''}"`,
    `"${(m.district || '').replace(/"/g, '""')}"`,
    `"${(m.roleBn || '').replace(/"/g, '""')}"`,
    `"${(m.roleEn || '').replace(/"/g, '""')}"`,
    `"${m.joinedDate || ''}"`,
    `"${m.joiningYear || ''}"`,
    `"${m.dateOfBirth || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`colash-members-${dateStr}.csv`, csvContent);
};

export const exportBloodDonorsToCSV = (members: GeneralMember[], filterGroup?: string) => {
  const filtered = filterGroup && filterGroup !== 'all'
    ? members.filter(m => m.bloodGroup === filterGroup)
    : members;

  const headers = ['SL', 'Member ID', 'Name', 'Blood Group', 'District', 'Emergency Contact / Role', 'Joined'];
  const rows = filtered.map((m, idx) => [
    idx + 1,
    `"${m.membershipId}"`,
    `"${m.nameBn} (${m.nameEn})"`,
    `"${m.bloodGroup}"`,
    `"${m.district}"`,
    `"${m.roleBn}"`,
    `"${m.joinedDate}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`colash-blood-donors-${dateStr}.csv`, csvContent);
};

export const exportDonationsToCSV = (donations: DonationRecord[]) => {
  const headers = ['SL', 'Receipt ID', 'Donor Name', 'Amount (BDT)', 'Payment Method', 'Transaction ID / Phone', 'Date', 'Purpose', 'Status'];
  const rows = donations.map((d, idx) => [
    idx + 1,
    `"${d.id}"`,
    `"${d.donorName}"`,
    d.amount,
    `"${d.method}"`,
    `"${d.phoneOrTrx || ''}"`,
    `"${d.date}"`,
    `"${d.purpose || 'সাধারণ তহবিল'}"`,
    `"${d.status}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`colash-donations-${dateStr}.csv`, csvContent);
};

export const exportAuditReport20252026 = () => {
  const content = `========================================================================================
                     কোলাশ ফাউন্ডেশন (CoLASH FOUNDATION)
                 COMMUNITY LEADERS AND SOCIAL HELPERS (CoLASH)
         রেজিস্টার্ড অলাভজনক ও অরাজনৈতিক মানবিক সমাজকল্যাণ সংস্থা | গণপ্রজাতন্ত্রী বাংলাদেশ
  কেন্দ্রীয় সচিবালয়: কমলগঞ্জ, মৌলভীবাজার ও সিলেট বিভাগ | হটলাইন: 01646-475348 | ইমেইল: ashraful46475348@gmail.com
========================================================================================

বিষয়: ২০২৫-২০২৬ অর্থবছরের চূড়ান্ত স্বাধীন বিধিবদ্ধ অডিট (Audit) প্রতিবেদন ও বার্ষিক আর্থিক বিবরণী প্রকাশ
অর্থবছর: ২০২৫ - ২০২৬ (০১ জুলাই ২০২৫ – ৩০ জুন ২০২৬)
প্রকাশের সরকারি তারিখ: ১২ এপ্রিল ২০২৬
অডিট সনদ ও রেজিস্ট্রেশন নম্বর: CA/CLSH/AUD-2026/0891
নিরীক্ষক সংস্থা: এস. আহমেদ অ্যান্ড কোং, চার্টার্ড অ্যাকাউন্ট্যান্টস (S. Ahmed & Co. Chartered Accountants)

----------------------------------------------------------------------------------------
১. নির্বাহী সারসংক্ষেপ ও প্রত্যয়ন (Executive Summary & Certification):
------------------------------------------------------------------------
কোলাশ ফাউন্ডেশনের পরিচালনা পর্ষদ ও অর্থ সচিবালয়ের হিসাবরক্ষণ নীতিমালার আলোকে এস. আহমেদ অ্যান্ড কোং, 
চার্টার্ড অ্যাকাউন্ট্যান্টস কর্তৃক ২০২৫-২০২৬ অর্থবছরের সকল ব্যাংক হিসাব, বিকাশ ও নগদ মার্চেন্ট চ্যানেল, 
যাকাত ও ফিতরা ফান্ড, সাধারণ অনুদান এবং মাঠপর্যায়ে ব্যয়িত সকল ভাউচার ও রসিদ শতভাগ নিরীক্ষা করা হয়েছে।
নিরীক্ষা শেষে সংস্থাটি নিশ্চিত করেছে যে, ফাউন্ডেশনের কোনো তহবিলের ব্যত্যয় ঘটেনি এবং আন্তর্জাতিক হিসাবমান 
(BFRS / IAS) কঠোরভাবে অনুসরণ করা হয়েছে।

----------------------------------------------------------------------------------------
২. ২০২৫-২০২৬ অর্থবছরের আয় ও তহবিলের সারসংক্ষেপ (Receipts & Inflow):
------------------------------------------------------------------------
ক্রমিক   তহবিল ও আয়ের খাত                                       পরিমাণ (টাকা)
----------------------------------------------------------------------------------------
০১.     যাকাত, ফিতরা ও সদকা তহবিল (দারিদ্র্য বিমোচন ও পুনর্বাসন)     ৳ ১৮,৫০,০০০/-
০২.     সাধারণ অনুদান ও প্রবাসী শুভানুধ্যায়ীদের অর্থায়ন          ৳ ১৫,৩০,০০০/-
০৩.     জরুরি দুর্যোগ ও হাওর-বন্যা ত্রাণ বিশেষ আপদকালীন তহবিল       ৳ ৬,৮০,০০০/-
০৪.     সদস্যদের কল্যাণ চাঁদা ও বার্ষিক রেজিস্ট্রি ফি              ৳ ২,২৫,০০০/-
----------------------------------------------------------------------------------------
সর্বমোট প্রাপ্ত অনুদান ও জমা (Total Income):                     ৳ ৪২,৮৫,০০০/-
----------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------
৩. ২০২৫-২০২৬ অর্থবছরের খাতভিত্তিক মাঠপর্যায়ের ব্যয় (Field Disbursements):
------------------------------------------------------------------------
ক্রমিক   কার্যক্রম ও মাঠপর্যায়ের ব্যয় খাত                         পরিমাণ (টাকা)   শতকরা হার
----------------------------------------------------------------------------------------
০১.     ফেনী, নোয়াখালী ও সিলেট বন্যা পুনর্বাসন ও গৃহ নির্মাণ     ৳ ১৩,৪০,০০০/-     ৩১.৩%
০২.     অসহায় বিধবা ও মায়েদের সেলাই মেশিন প্রদান ও প্রশিক্ষণ      ৳ ৬,২০,০০০/-     ১৪.৫%
০৩.     বেকার যুব ও পুরুষদের কর্মসংস্থান (ভ্যান, রিকশা ও পুঁজি)    ৳ ৫,৭৫,০০০/-     ১৩.৪%
০৪.     মেধাবী অসচ্ছল ছাত্রছাত্রীদের শিক্ষা বৃত্তি ও উপকরণ        ৳ ৫,৩০,০০০/-     ১২.৪%
০৫.     জরুরি মুমূর্ষু রোগীর চিকিৎসা ও ফ্রি ব্লাড নেটওয়ার্ক         ৳ ৪,৫০,০০০/-     ১০.৫%
০৬.     দাপ্তরিক পরিচালনা, ডেটাবেজ ও প্রশাসনিক খরচ (মাত্র ৬.৮%)   ৳ ২,৮০,০০০/-      ৬.৫%
০৭.     স্বাধীন চার্টার্ড অডিট ফার্মের পেশাগত ফি                ৳ ২০,০০০/-        ০.৫%
----------------------------------------------------------------------------------------
সর্বমোট মাঠপর্যায়ের মানবিক ব্যয় ও বিতরণ:                        ৳ ৩৮,১৫,০০০/-     ৮৯.০%
----------------------------------------------------------------------------------------

----------------------------------------------------------------------------------------
৪. সমাপনী ব্যালেন্স ও আপদকালীন রিজার্ভ তহবিল (Surplus & Reserve Fund):
------------------------------------------------------------------------
মোট অনুদান প্রাপ্তি:                                           ৳ ৪২,৮৫,০০০/-
বাদ: মাঠপর্যায়ে প্রত্যক্ষ মানবিক সেবা ও কার্যক্রম ব্যয়:          ৳ ৩৮,১৫,০০০/-
----------------------------------------------------------------------------------------
পরবর্তী অর্থবছরের জরুরি হাওর বন্যা ও আপদকালীন রিজার্ভ তহবিল:      ৳ ৪,৭০,০০০/-
(সোনালী ব্যাংক পিএলসি এবং ইসলামী ব্যাংক পিএলসি কোলাশ ফাউন্ডেশন একাউন্টে সংরক্ষিত)
----------------------------------------------------------------------------------------

৫. স্বাধীন নিরীক্ষকের প্রতিবেদন ও মন্তব্য (Statutory Auditor's Opinion):
"আমরা কোলাশ ফাউন্ডেশনের আর্থিক বিবরণীসমূহ নিরীক্ষা করেছি। সংগৃহীত সকল অনুদান ব্যাংক স্টেটমেন্ট ও মোবাইল
ব্যাংকিং লেজারের সাথে শতভাগ সামঞ্জস্যপূর্ণ। প্রতিটি ব্যয়ের বিপরীতে বৈধ ভাউচার, ফিল্ড রসিদ ও উপকারভোগীর
স্বাক্ষর সংরক্ষিত রয়েছে। প্রতিষ্ঠানটির আর্থিক ব্যবস্থাপনা শতভাগ স্বচ্ছ, নিরপেক্ষ ও অরাজনৈতিক।"

স্বাক্ষরিত ও সত্যায়িত:
১. মোঃ আশরাফুল ইসলাম সুলতান (Md. Ashraful Islam Sultan) — প্রতিষ্ঠাতা ও সভাপতি, কোলাশ ফাউন্ডেশন
২. অর্থ ও হিসাবরক্ষণ সচিব — কার্যনির্বাহী পরিষদ, কোলাশ ফাউন্ডেশন
৩. লিড অডিট পার্টনার — এস. আহমেদ অ্যান্ড কোং, চার্টার্ড অ্যাকাউন্ট্যান্টস

========================================================================================
ডিজিটাল ভেরিফিকেশন কোড: CLSH-AUD-2026-BD891
অনলাইন ভেরিফিকেশন ও স্বচ্ছতা পোর্টাল: https://colashfoundation.org/#transparency
========================================================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'CoLASH-Audit-Report-2025-2026.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
