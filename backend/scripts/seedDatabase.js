require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const slugify = require('slugify');

const User = require('../models/User');
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');
const VisaGuide = require('../models/VisaGuide');

// ─── Fallback images ──────────────────────────────────────────────────────────
const FALLBACK_CAMPUS = [
  'https://usao.edu/images/explore-usao-box.png',
  'https://managingtheuniversitycampus.nl/wp-content/uploads/2012/03/20120308-133035.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYDgpGgrfmGWnGv5XZhHEu09fPbAQzGrSV0Q&s',
  'https://www.campusfrance.org/sites/default/files/styles/mobile_menu_image_1_2_et_3/public/menu/2017-10/pyramide%20louvre.jpg?h=c71d0c67&itok=JBq1oN8J',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2Ec6qnEQ1_tIAQ7YH6YlpngioQJSLfJOtuA&s',
];

const FALLBACK_LOGO =
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80';

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randItems(arr, n) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); }

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseQSRanking(str) {
  if (!str) return null;
  str = String(str).trim();
  if (/^\d+$/.test(str)) return parseInt(str);
  const rangeMatch = str.match(/(\d+)[–\-](\d+)/);
  if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
  const numMatch = str.match(/(\d+)/);
  return numMatch ? parseInt(numMatch[1]) : null;
}

function parseIELTS(str) {
  if (!str) return null;
  const m = String(str).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function parseTOEFL(str) {
  if (!str) return null;
  const m = String(str).match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

function parseGPA(str) {
  if (!str) return null;
  const m = String(str).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function detectCurrency(str) {
  if (!str) return 'USD';
  if (str.includes('£')) return 'GBP';
  if (str.includes('€')) return 'EUR';
  if (str.includes('CHF')) return 'CHF';
  if (str.includes('AUD')) return 'AUD';
  if (str.includes('NZD')) return 'NZD';
  if (str.includes('CAD')) return 'CAD';
  if (str.includes('SGD')) return 'SGD';
  if (str.includes('HKD')) return 'HKD';
  if (str.includes('JPY')) return 'JPY';
  if (str.includes('KRW')) return 'KRW';
  if (str.includes('CNY')) return 'CNY';
  if (str.includes('INR')) return 'INR';
  if (str.includes('ZAR')) return 'ZAR';
  if (str.includes('BRL')) return 'BRL';
  if (str.includes('SEK')) return 'SEK';
  if (str.includes('DKK')) return 'DKK';
  if (str.includes('CLP')) return 'CLP';
  if (str.includes('MXN')) return 'MXN';
  if (str.includes('ARS')) return 'ARS';
  return 'USD';
}

function extractFirstNumber(str) {
  if (!str) return 0;
  const m = String(str).match(/([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, '')) : 0;
}

function parseTuition(str) {
  if (!str) return { ug: { amount: 0, currency: 'USD' }, pg: { amount: 0, currency: 'USD' } };
  const lower = str.toLowerCase();
  if (lower.includes('free') || lower.includes('brl 0') || lower.includes('ars 0') || lower.includes('mxn 0')) {
    return { ug: { amount: 0, currency: 'USD' }, pg: { amount: 0, currency: 'USD' } };
  }
  const currency = detectCurrency(str);
  const parts = str.split(';').map(s => s.trim());
  let ug = null, pg = null;

  for (const part of parts) {
    const lp = part.toLowerCase();
    const amount = extractFirstNumber(part);
    if (lp.includes('ug') || lp.includes('undergraduate') || lp.includes('bachelor') || lp.includes('sem')) {
      ug = { amount, currency };
    } else if (lp.includes('pg') || lp.includes('postgraduate') || lp.includes('master')) {
      pg = { amount, currency };
    }
  }

  if (!ug && !pg) {
    const amount = extractFirstNumber(parts[0]);
    ug = pg = { amount, currency };
  }
  if (!ug) ug = pg;
  if (!pg) pg = ug;
  return { ug, pg };
}

function parseAppFee(str) {
  if (!str) return { amount: 0, currency: 'USD' };
  const lower = str.toLowerCase();
  if (lower === 'none' || lower === 'free' || lower.includes('none') || lower.startsWith('0')) {
    return { amount: 0, currency: 'USD' };
  }
  const first = str.split(';')[0];
  return { amount: extractFirstNumber(first), currency: detectCurrency(first) };
}

function parseIntakePeriods(str) {
  if (!str) return ['Fall'];
  const lower = str.toLowerCase();
  const result = [];
  if (lower.includes('fall') || lower.includes('sep') || lower.includes('oct') || lower.includes('aug') || lower.includes('winter')) result.push('Fall');
  if (lower.includes('spring') || lower.includes('feb') || lower.includes('mar') || lower.includes('jan') || lower.includes('summer')) result.push('Spring');
  if (lower.includes('semester 2') || lower.includes('even sem')) result.push('Summer');
  if (result.length === 0) result.push('Fall');
  return [...new Set(result)];
}

function getRegion(country) {
  const map = {
    USA: 'North America', Canada: 'North America', Mexico: 'North America',
    UK: 'Europe', Germany: 'Europe', France: 'Europe', Switzerland: 'Europe',
    Netherlands: 'Europe', Belgium: 'Europe', Sweden: 'Europe', Finland: 'Europe',
    Denmark: 'Europe', Italy: 'Europe', Spain: 'Europe', Israel: 'Middle East',
    Singapore: 'Asia', Japan: 'Asia', China: 'Asia', 'South Korea': 'Asia',
    'Hong Kong': 'Asia', India: 'Asia', Thailand: 'Asia',
    Australia: 'Oceania', 'New Zealand': 'Oceania',
    'South Africa': 'Africa', Chile: 'South America', Brazil: 'South America',
    Argentina: 'South America',
  };
  return map[country] || 'Other';
}

function generateDescription(row) {
  const name = row['University Name'];
  const country = row['Country'];
  const city = row['City'];
  const type = (row['Public or Private'] || 'public').toLowerCase();
  const qs = row['QS Ranking 2025'];
  const programs = row['Programs Available'] || '';
  const notes = row['Notes'] || '';

  let desc = `${name} is a ${type} university located in ${city}, ${country}.`;
  const qsNum = parseQSRanking(qs);
  if (qsNum && qsNum <= 100) {
    desc += ` Ranked #${qsNum} in the QS World University Rankings 2025, it is among the world's top institutions.`;
  } else if (qsNum) {
    desc += ` It holds a QS World University ranking of #${qsNum} (2025).`;
  }
  const progSample = programs.split(',').slice(0, 5).map(p => p.trim()).join(', ');
  if (progSample) desc += ` Programs span ${progSample}, and many more disciplines.`;
  const firstNote = notes.split(';')[0].trim();
  if (firstNote && firstNote.length < 120) desc += ` ${firstNote}.`;
  return desc.trim();
}

function parsePrograms(row) {
  const str = row['Programs Available'] || '';
  const ielts = parseIELTS(row['IELTS Requirement']);
  const toefl = parseTOEFL(row['TOEFL Requirement']);
  const gpa = parseGPA(row['Minimum GPA']);
  const { ug, pg } = parseTuition(row['Tuition Fees (International)'] || '');
  const intakes = parseIntakePeriods(row['Intake Seasons']);
  const langTest = ielts
    ? { type: 'IELTS', minimumScore: ielts }
    : toefl ? { type: 'TOEFL', minimumScore: toefl } : undefined;

  const names = str.split(',').map(s => s.trim()).filter(Boolean);
  if (names.length === 0) return [];

  const programs = [];
  const half = Math.ceil(names.length / 2);

  names.slice(0, half).slice(0, 4).forEach(name => {
    const prog = {
      name,
      level: 'Undergraduate',
      duration: '4 years',
      intakePeriods: intakes,
    };
    if (ug?.amount) prog.tuitionFee = { amount: ug.amount, currency: ug.currency, period: 'year' };
    if (gpa || langTest) prog.entryRequirements = { minimumGPA: gpa || undefined, languageTest: langTest };
    programs.push(prog);
  });

  names.slice(half).slice(0, 4).forEach(name => {
    const prog = {
      name,
      level: 'Postgraduate',
      duration: '2 years',
      intakePeriods: intakes,
    };
    if (pg?.amount) prog.tuitionFee = { amount: pg.amount, currency: pg.currency, period: 'year' };
    if (gpa || langTest) prog.entryRequirements = { minimumGPA: gpa || undefined, languageTest: langTest };
    programs.push(prog);
  });

  return programs;
}

function parseUniScholarships(row) {
  const details = row['Scholarship Details'] || '';
  if (row['Scholarship Available']?.toLowerCase() !== 'yes' || !details) return [];
  return details.split(';').map(s => s.trim()).filter(Boolean).slice(0, 4).map(name => ({
    name: name.length > 100 ? name.substring(0, 100) : name,
    type: 'University',
    eligibility: ['Academic excellence'],
    link: row['Application Link'] || row['Official Website'] || '',
  }));
}

function rowToUniversity(row) {
  const name = (row['University Name'] || '').trim();
  if (!name) return null;

  const img1 = row['Campus Image URL 1']?.trim() || randFrom(FALLBACK_CAMPUS);
  const img2 = row['Campus Image URL 2']?.trim() || randFrom(FALLBACK_CAMPUS);
  const img3 = row['Campus Image URL 3']?.trim() || randFrom(FALLBACK_CAMPUS);
  const logo = row['University Logo URL']?.trim() || FALLBACK_LOGO;
  const extras = randItems(FALLBACK_CAMPUS, 3);

  const { ug, pg } = parseTuition(row['Tuition Fees (International)'] || '');
  const appFee = parseAppFee(row['Application Fee'] || '');
  const qs = parseQSRanking(row['QS Ranking 2025']);

  const uniType = (row['Public or Private'] || '').trim();
  const validTypes = ['Public', 'Private', 'Research', 'Liberal Arts', 'Technical'];
  const universityType = validTypes.includes(uniType) ? uniType : 'Public';

  const country = (row['Country'] || '').trim();
  const city = (row['City'] || '').trim();

  return {
    name,
    slug: slugify(name, { lower: true, strict: true }),
    country,
    city,
    region: getRegion(country),
    universityType,
    logo,
    coverImage: img1,
    images: [...new Set([img1, img2, img3, ...extras])],
    website: (row['Official Website'] || '').trim(),
    applicationLink: (row['Application Link'] || '').trim(),
    overview: {
      description: generateDescription(row),
      mission: `${name} is dedicated to advancing human knowledge through research, education, and community engagement.`,
      vision: 'To be a globally recognized leader in education, research, and innovation.',
      values: ['Excellence', 'Integrity', 'Innovation', 'Diversity', 'Global Citizenship'],
    },
    rankings: qs ? { qsRanking: { world: qs, year: 2025 } } : {},
    stats: {
      acceptanceRate: null,
      graduationRate: null,
      employmentRate: null,
    },
    programs: parsePrograms(row),
    campusLife: {
      accommodation: { available: true, types: ['On-campus dormitory', 'University apartments', 'Off-campus housing'] },
      facilities: [
        { name: 'Central Library', description: 'Extensive library with digital and physical resources' },
        { name: 'Sports Complex', description: 'Modern sports facilities for students' },
        { name: 'Student Union', description: 'Hub for student activities and organizations' },
      ],
      clubs: ['Academic Clubs', 'Cultural Associations', 'Sports Teams', 'Community Service', 'Arts & Music'],
      sports: ['Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics'],
    },
    admissions: {
      applicationFee: { amount: appFee.amount, currency: appFee.currency },
      requiredDocuments: [
        'Academic transcripts', 'Passport copy', 'English test scores',
        'Statement of Purpose', 'Letters of Recommendation', 'CV/Resume',
      ],
      applicationProcess: [
        'Complete online application form',
        'Upload all required documents',
        'Pay the application fee',
        'Attend interview if invited',
        'Await admission decision',
      ],
      deadlines: { fall: new Date('2025-12-01') },
    },
    tuitionFees: {
      undergraduate: { international: { amount: ug?.amount || 0, currency: ug?.currency || 'USD' } },
      postgraduate: { international: { amount: pg?.amount || 0, currency: pg?.currency || 'USD' } },
    },
    scholarships: [],
    languageOfInstruction: ['English'],
    intakePeriods: parseIntakePeriods(row['Intake Seasons']),
    contactInfo: {
      address: `${city}, ${country}`,
    },
    isVerified: true,
    isFeatured: qs !== null && qs <= 25,
    isActive: true,
    importedFrom: 'csv',
  };
}

// ─── Standalone scholarships ──────────────────────────────────────────────────
const STANDALONE_SCHOLARSHIPS = [
  {
    name: 'Chevening Scholarships',
    type: 'Government',
    provider: 'UK Foreign, Commonwealth & Development Office',
    country: 'UK',
    studyLevel: ['Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 40000, currency: 'GBP', type: 'Full Tuition' },
    coverage: { tuition: true, accommodation: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'Chevening is the UK government\'s international awards programme, offering fully-funded scholarships to outstanding emerging leaders from all over the world.',
    eligibilityCriteria: { nationality: ['International (all countries)'], minimumGPA: 3.0, otherCriteria: ['Leadership potential', 'Two years work experience', 'Return to home country after study'] },
    applicationProcess: ['Apply online at chevening.org', 'Shortlisted candidates attend interview', 'Apply to at least 3 UK universities'],
    requiredDocuments: ['Transcripts', 'References (2)', 'Personal statement', 'Work experience proof'],
    deadline: new Date('2025-11-05'),
    applicationStartDate: new Date('2025-08-01'),
    numberOfScholarships: 1800,
    isRenewable: false,
    website: 'https://www.chevening.org',
    isActive: true,
  },
  {
    name: 'Commonwealth Scholarships',
    type: 'Government',
    provider: 'Commonwealth Scholarship Commission',
    country: 'UK',
    studyLevel: ['Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 35000, currency: 'GBP', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'Commonwealth Scholarships for citizens of Commonwealth countries to study postgraduate degrees in the UK.',
    eligibilityCriteria: { nationality: ['Commonwealth countries'], minimumGPA: 3.0, otherCriteria: ['Commitment to development', 'Academic merit'] },
    applicationProcess: ['Apply through national nominating agency', 'Application reviewed by CSC', 'Interview if shortlisted'],
    requiredDocuments: ['Academic transcripts', 'References (3)', 'Research proposal', 'Personal statement'],
    deadline: new Date('2025-12-15'),
    applicationStartDate: new Date('2025-09-01'),
    isRenewable: false,
    website: 'https://cscuk.fcdo.gov.uk',
    isActive: true,
  },
  {
    name: 'Fulbright Foreign Student Program',
    type: 'Government',
    provider: 'U.S. Department of State',
    country: 'USA',
    studyLevel: ['Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 50000, currency: 'USD', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The Fulbright Program offers grants for individuals from other countries to study, teach, or conduct research in the United States.',
    eligibilityCriteria: { nationality: ['International (selected countries)'], minimumGPA: 3.0, otherCriteria: ['Academic excellence', 'Leadership qualities'] },
    applicationProcess: ['Apply through home country Fulbright Commission', 'Shortlisting and interview', 'Placement at US university'],
    requiredDocuments: ['Transcripts', 'References (3)', 'Study objective statement', 'Language proficiency'],
    deadline: new Date('2025-10-15'),
    applicationStartDate: new Date('2025-05-01'),
    numberOfScholarships: 4000,
    isRenewable: false,
    website: 'https://foreign.fulbrightonline.org',
    isActive: true,
  },
  {
    name: 'DAAD Scholarships',
    type: 'Government',
    provider: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    studyLevel: ['Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 861, currency: 'EUR', type: 'Fixed Amount' },
    coverage: { tuition: false, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'DAAD scholarships support international students pursuing postgraduate studies or research at German universities.',
    eligibilityCriteria: { nationality: ['International (all countries)'], minimumGPA: 3.0, otherCriteria: ['Academic excellence', 'Language proficiency'] },
    applicationProcess: ['Apply online at daad.de', 'Submit documents', 'Selection by DAAD committee'],
    requiredDocuments: ['Transcripts', 'Motivation letter', 'CV', 'Language certificates', 'References (2)'],
    deadline: new Date('2025-10-31'),
    applicationStartDate: new Date('2025-08-01'),
    isRenewable: true,
    renewalCriteria: 'Annual review, good academic progress required',
    website: 'https://www.daad.de',
    isActive: true,
  },
  {
    name: 'Australia Awards Scholarships',
    type: 'Government',
    provider: 'Australian Department of Foreign Affairs and Trade',
    country: 'Australia',
    studyLevel: ['Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 45000, currency: 'AUD', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'Australia Awards offer opportunities to undertake full-time undergraduate or postgraduate study at participating Australian universities.',
    eligibilityCriteria: { nationality: ['Asia-Pacific, Africa, Middle East countries'], minimumGPA: 3.0, otherCriteria: ['Return to home country after study', 'Development focus'] },
    applicationProcess: ['Apply through Australian embassy in home country', 'Selection panel review', 'Interview'],
    requiredDocuments: ['Academic transcripts', 'References (2)', 'Personal statement', 'Development plan'],
    deadline: new Date('2025-04-30'),
    applicationStartDate: new Date('2025-02-01'),
    numberOfScholarships: 3000,
    isRenewable: false,
    website: 'https://www.australiaawards.gov.au',
    isActive: true,
  },
  {
    name: 'Erasmus+ Scholarships',
    type: 'Government',
    provider: 'European Union',
    country: 'Germany',
    studyLevel: ['Undergraduate', 'Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 700, currency: 'EUR', type: 'Fixed Amount' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true },
    description: 'Erasmus+ supports the mobility of students, teachers and trainers across European countries and beyond.',
    eligibilityCriteria: { nationality: ['EU and partner countries'], minimumGPA: 2.5, otherCriteria: ['Enrolled at a participating university'] },
    applicationProcess: ['Apply through home university international office', 'Selection by home institution', 'Placement at partner university'],
    requiredDocuments: ['Transcripts', 'Language certificate', 'Learning agreement', 'Motivation letter'],
    deadline: new Date('2026-01-31'),
    applicationStartDate: new Date('2025-10-01'),
    isRenewable: true,
    website: 'https://erasmus-plus.ec.europa.eu',
    isActive: true,
  },
  {
    name: 'MEXT Japanese Government Scholarship',
    type: 'Government',
    provider: 'Japanese Ministry of Education, Culture, Sports, Science and Technology',
    country: 'Japan',
    studyLevel: ['Undergraduate', 'Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 143000, currency: 'JPY', type: 'Fixed Amount' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true },
    description: 'The Japanese Government (Monbukagakusho: MEXT) Scholarship provides financial support to international students wishing to study in Japan.',
    eligibilityCriteria: { nationality: ['International (selected countries)'], minimumGPA: 3.0, otherCriteria: ['Age limit applies', 'Medical fitness'] },
    applicationProcess: ['Apply at Japanese embassy', 'Embassy selection exam', 'University screening'],
    requiredDocuments: ['Transcripts', 'Application form', 'Medical certificate', 'Research plan (PG)'],
    deadline: new Date('2025-05-31'),
    applicationStartDate: new Date('2025-03-01'),
    numberOfScholarships: 2000,
    isRenewable: true,
    website: 'https://www.mext.go.jp/en/policy/education/highered/title02/detail02/sdetail02/1373897.htm',
    isActive: true,
  },
  {
    name: 'Korean Government Scholarship Program (KGSP)',
    type: 'Government',
    provider: 'National Institute for International Education (NIIED), South Korea',
    country: 'South Korea',
    studyLevel: ['Undergraduate', 'Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 900000, currency: 'KRW', type: 'Fixed Amount' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The Korean Government Scholarship Program aims to promote international exchange in education and to develop human resources by providing scholarships to outstanding international students.',
    eligibilityCriteria: { nationality: ['International (all countries)'], minimumGPA: 2.64, otherCriteria: ['Age below 25 for UG, 40 for PG', 'Not a Korean citizen'] },
    applicationProcess: ['Apply through Korean embassy or university', 'Document screening', 'Interview'],
    requiredDocuments: ['Transcripts', 'Personal statement', 'Recommendation letters', 'Medical report'],
    deadline: new Date('2025-09-30'),
    applicationStartDate: new Date('2025-07-01'),
    numberOfScholarships: 1600,
    isRenewable: true,
    website: 'https://www.studyinkorea.go.kr',
    isActive: true,
  },
  {
    name: 'Gates Cambridge Scholarship',
    type: 'University',
    provider: 'University of Cambridge / Gates Foundation',
    country: 'UK',
    studyLevel: ['Postgraduate', 'PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 18840, currency: 'GBP', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'Gates Cambridge Scholarships are highly competitive full-cost scholarships for outstanding applicants from outside the UK to pursue postgraduate study at the University of Cambridge.',
    eligibilityCriteria: { nationality: ['All non-UK citizens'], minimumGPA: 3.7, otherCriteria: ['Academic excellence', 'Leadership', 'Commitment to improving lives of others'] },
    applicationProcess: ['Apply to Cambridge course and Gates Cambridge simultaneously', 'Shortlisting', 'Interview at Cambridge'],
    requiredDocuments: ['Transcripts', 'References (3)', 'Personal statement', 'Research proposal'],
    deadline: new Date('2025-10-09'),
    applicationStartDate: new Date('2025-08-01'),
    numberOfScholarships: 80,
    isRenewable: true,
    website: 'https://www.gatescambridge.org',
    isActive: true,
  },
  {
    name: 'Rhodes Scholarship',
    type: 'University',
    provider: 'Rhodes Trust / University of Oxford',
    country: 'UK',
    studyLevel: ['Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 20000, currency: 'GBP', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The Rhodes Scholarship is the oldest and perhaps the most prestigious international scholarship programme in the world, enabling outstanding young people from around the world to study at the University of Oxford.',
    eligibilityCriteria: { nationality: ['Selected countries'], minimumGPA: 3.7, ageLimit: { min: 18, max: 24 }, otherCriteria: ['Intellectual distinction', 'Leadership', 'Commitment to service'] },
    applicationProcess: ['Apply through national committee', 'National selection', 'Final interview in Oxford'],
    requiredDocuments: ['Transcripts', 'References (5)', 'Personal statement', 'Proof of citizenship'],
    deadline: new Date('2025-08-31'),
    applicationStartDate: new Date('2025-05-01'),
    numberOfScholarships: 100,
    isRenewable: true,
    website: 'https://www.rhodeshouse.ox.ac.uk',
    isActive: true,
  },
  {
    name: 'Swedish Institute Scholarships for Global Professionals (SISGP)',
    type: 'Government',
    provider: 'Swedish Institute',
    country: 'Sweden',
    studyLevel: ['Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 14000, currency: 'SEK', type: 'Fixed Amount' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The SISGP scholarship funds tuition fees and a monthly grant for professionals from selected countries pursuing full-time master\'s degrees at Swedish universities.',
    eligibilityCriteria: { nationality: ['Selected countries in Africa, Asia, Eastern Europe, Middle East'], minimumGPA: 3.0, otherCriteria: ['Work experience', 'Leadership capacity', 'Contribution to sustainable development'] },
    applicationProcess: ['Apply through University Admissions Sweden', 'Apply for SI scholarship simultaneously', 'Shortlisting and interview'],
    requiredDocuments: ['Transcripts', 'CV', 'Motivation letter', 'Work certificates'],
    deadline: new Date('2026-01-16'),
    applicationStartDate: new Date('2025-10-16'),
    numberOfScholarships: 350,
    isRenewable: false,
    website: 'https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/',
    isActive: true,
  },
  {
    name: 'Lester B. Pearson International Scholarship',
    type: 'University',
    provider: 'University of Toronto',
    country: 'Canada',
    studyLevel: ['Undergraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 56000, currency: 'CAD', type: 'Full Tuition' },
    coverage: { tuition: true, accommodation: true, livingExpenses: true, bookAllowance: true },
    description: 'The Lester B. Pearson International Scholarship Program is designed to recognize international students who demonstrate exceptional academic achievement and creativity and who are recognised as leaders within their school.',
    eligibilityCriteria: { nationality: ['All non-Canadian citizens'], minimumGPA: 3.7, otherCriteria: ['Leadership', 'Community involvement', 'Nominated by school'] },
    applicationProcess: ['Nominated by secondary school', 'Submit online application', 'Selection by U of T'],
    requiredDocuments: ['School nomination', 'Transcripts', 'Personal profile', 'Community involvement records'],
    deadline: new Date('2025-11-30'),
    applicationStartDate: new Date('2025-09-01'),
    numberOfScholarships: 37,
    isRenewable: true,
    website: 'https://future.utoronto.ca/pearson',
    isActive: true,
  },
  {
    name: 'Singapore Government Scholarship (SGS)',
    type: 'Government',
    provider: 'Singapore Government',
    country: 'Singapore',
    studyLevel: ['Undergraduate', 'Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 30000, currency: 'SGD', type: 'Full Tuition' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The Singapore Government Scholarship supports outstanding international students to pursue full-time undergraduate or postgraduate programmes at local universities in Singapore.',
    eligibilityCriteria: { nationality: ['ASEAN and selected international students'], minimumGPA: 3.0, otherCriteria: ['Academic excellence', 'Leadership'] },
    applicationProcess: ['Apply online', 'Document review', 'Interview with selection panel'],
    requiredDocuments: ['Transcripts', 'Testimonials', 'Personal statement', 'Proof of citizenship'],
    deadline: new Date('2025-12-01'),
    applicationStartDate: new Date('2025-10-01'),
    isRenewable: true,
    website: 'https://www.moe.gov.sg/financial-matters/awards-scholarships',
    isActive: true,
  },
  {
    name: 'New Zealand Excellence Awards',
    type: 'Government',
    provider: 'New Zealand Government (Education NZ)',
    country: 'New Zealand',
    studyLevel: ['Postgraduate'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 10000, currency: 'NZD', type: 'Partial Tuition' },
    coverage: { tuition: true, livingExpenses: false },
    description: 'New Zealand Excellence Awards are partial scholarships for international students to undertake postgraduate study in New Zealand.',
    eligibilityCriteria: { nationality: ['Selected Asia-Pacific and Latin American countries'], minimumGPA: 3.0, otherCriteria: ['Academic merit'] },
    applicationProcess: ['Apply with university admission', 'Submit scholarship application', 'Selection by institutions'],
    requiredDocuments: ['Transcripts', 'CV', 'Personal statement', 'References'],
    deadline: new Date('2025-08-01'),
    applicationStartDate: new Date('2025-04-01'),
    isRenewable: false,
    website: 'https://www.studywithnewzealand.govt.nz',
    isActive: true,
  },
  {
    name: 'Eiffel Excellence Scholarship Program',
    type: 'Government',
    provider: 'French Ministry for Europe and Foreign Affairs',
    country: 'France',
    studyLevel: ['Postgraduate', 'PhD'],
    fieldOfStudy: ['Engineering', 'Natural Sciences', 'Economics', 'Law', 'Political Science', 'Management'],
    amount: { value: 1181, currency: 'EUR', type: 'Fixed Amount' },
    coverage: { tuition: false, livingExpenses: true, travelAllowance: true, healthInsurance: true },
    description: 'The Eiffel Excellence Scholarship Program was established by the French Ministry of Europe and Foreign Affairs to attract international students to French higher education institutions.',
    eligibilityCriteria: { nationality: ['Non-French citizens'], minimumGPA: 3.0, ageLimit: { min: 18, max: 30 }, otherCriteria: ['Nominated by French institution', 'Academic excellence'] },
    applicationProcess: ['Nominated by a French institution', 'Application submitted to Campus France', 'Selection by Ministry'],
    requiredDocuments: ['Transcripts', 'CV', 'Research project', 'Nomination letter'],
    deadline: new Date('2026-01-09'),
    applicationStartDate: new Date('2025-10-01'),
    isRenewable: false,
    website: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
    isActive: true,
  },
  {
    name: 'Hong Kong PhD Fellowship Scheme',
    type: 'Government',
    provider: 'Research Grants Council of Hong Kong',
    country: 'Hong Kong',
    studyLevel: ['PhD'],
    fieldOfStudy: ['All Fields'],
    amount: { value: 25800, currency: 'HKD', type: 'Fixed Amount' },
    coverage: { tuition: true, livingExpenses: true, travelAllowance: true },
    description: 'The Hong Kong PhD Fellowship Scheme aims to attract outstanding students from around the world to pursue their PhD studies in Hong Kong.',
    eligibilityCriteria: { nationality: ['International (all countries)'], minimumGPA: 3.3, otherCriteria: ['Research ability', 'Communication skills', 'Leadership'] },
    applicationProcess: ['Apply online through RGCHK portal', 'Nominated by HK university', 'Selection by RGC panel'],
    requiredDocuments: ['Transcripts', 'Research proposal', 'References (3)', 'Publications (if any)'],
    deadline: new Date('2025-12-01'),
    applicationStartDate: new Date('2025-09-01'),
    numberOfScholarships: 300,
    isRenewable: true,
    website: 'https://cerg1.ugc.edu.hk/hkpfs/index.html',
    isActive: true,
  },
];

// ─── Visa guides ──────────────────────────────────────────────────────────────
const VISA_GUIDES = [
  {
    country: 'USA',
    visaTypes: [{ name: 'F-1 Student Visa', description: 'For academic students enrolled full-time at SEVP-approved institutions', duration: 'Duration of Status (D/S)', processingTime: '3–8 weeks', fee: { amount: 160, currency: 'USD' } }],
    generalRequirements: ['Valid passport (6+ months validity)', 'I-20 form from university', 'SEVIS I-901 fee payment ($350)', 'DS-160 visa application', 'Proof of financial support', 'Ties to home country'],
    requiredDocuments: [
      { name: 'Passport', description: 'Valid for at least 6 months beyond intended stay', mandatory: true, format: 'Original' },
      { name: 'I-20 Form', description: 'Certificate of Eligibility issued by university', mandatory: true, format: 'Original' },
      { name: 'DS-160 Confirmation', description: 'Online nonimmigrant visa application confirmation', mandatory: true, format: 'Printed' },
      { name: 'Visa Photo', description: 'Recent passport-size photo meeting US requirements', mandatory: true, format: 'Digital or printed' },
      { name: 'SEVIS Fee Receipt', description: 'Proof of I-901 SEVIS fee payment', mandatory: true, format: 'Printed' },
      { name: 'Bank Statements', description: 'Proof of sufficient funds for study and living', mandatory: true, format: 'Original or certified' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive I-20 from University', description: 'After admission, university sends Form I-20', estimatedTime: '1–2 weeks' },
      { step: 2, title: 'Pay SEVIS Fee', description: 'Pay $350 SEVIS I-901 fee at fmjfee.com', estimatedTime: '1 day' },
      { step: 3, title: 'Complete DS-160', description: 'Fill the online visa application at ceac.state.gov', estimatedTime: '1–2 hours' },
      { step: 4, title: 'Schedule Visa Interview', description: 'Book appointment at nearest US embassy/consulate', estimatedTime: '1–4 weeks wait' },
      { step: 5, title: 'Attend Interview', description: 'Bring all documents to embassy interview', estimatedTime: '1 day' },
      { step: 6, title: 'Visa Processing', description: 'Embassy processes visa after interview', estimatedTime: '3–5 business days' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 50000, currency: 'USD' }, proofOfFunds: ['Bank statements (3 months)', 'Scholarship letters', 'Affidavit of support', 'Sponsor bank statements'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: ['COVID-19', 'MMR', 'Varicella'], healthInsurance: { required: true, minimumCoverage: 100000, currency: 'USD' } },
    biometrics: { required: true, validityPeriod: '10 years', cost: { amount: 85, currency: 'USD' } },
    interviewRequirements: { required: true, location: 'US Embassy or Consulate in home country', schedulingProcess: 'Online booking via ustraveldocs.com', tips: ['Dress formally', 'Answer questions concisely', 'Bring all original documents', 'Show strong ties to home country', 'Be honest about study plans'] },
    processingTime: { minimum: '3 weeks', maximum: '8 weeks', average: '4 weeks' },
    postStudyWorkVisa: { available: true, duration: '12 months (36 months for STEM OPT)', eligibility: ['Completed degree at SEVP institution', 'Work in field related to degree'], applicationProcess: 'Apply through university DSO at least 90 days before graduation', restrictions: ['Must work in field of study', 'Limited to one OPT per degree level'] },
    dependentVisa: { available: true, eligibleDependents: ['Spouse', 'Unmarried children under 21'], requirements: ['F-2 visa application', 'Proof of relationship', 'Proof of student\'s enrollment'], workRights: 'F-2 dependents cannot work in USA' },
    importantNotes: ['Apply for visa at least 120 days before program start', 'Cannot enter US more than 30 days before program start', 'Maintain full-time enrollment status', 'Report address changes to DSO within 10 days'],
    usefulLinks: [{ title: 'USCIS Student Visa Info', url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors' }, { title: 'DHS Study in the States', url: 'https://studyinthestates.dhs.gov' }],
  },
  {
    country: 'UK',
    visaTypes: [{ name: 'Student Visa', description: 'For students over 16 studying at a UK licensed sponsor institution', duration: 'Course length + up to 6 months', processingTime: '3 weeks', fee: { amount: 490, currency: 'GBP' } }],
    generalRequirements: ['Confirmation of Acceptance for Studies (CAS) from university', 'Sufficient funds to cover tuition and living costs', 'Valid passport', 'English language proficiency', 'No criminal record'],
    requiredDocuments: [
      { name: 'Passport', description: 'Valid passport or travel document', mandatory: true, format: 'Original' },
      { name: 'CAS Number', description: 'Confirmation of Acceptance for Studies from licensed UK sponsor', mandatory: true, format: 'Reference number' },
      { name: 'Proof of English', description: 'Approved English test certificate (IELTS UKVI, etc.)', mandatory: true, format: 'Original or copy' },
      { name: 'Financial Evidence', description: 'Bank statements showing required funds', mandatory: true, format: 'Original or certified copy' },
      { name: 'ATAS Certificate', description: 'Academic Technology Approval Scheme (for some subjects)', mandatory: false, format: 'Printed email' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive CAS from University', description: 'University provides Confirmation of Acceptance for Studies', estimatedTime: '1–4 weeks' },
      { step: 2, title: 'Prepare Financial Evidence', description: 'Ensure bank balance meets requirements 28 days before application', estimatedTime: '1 month preparation' },
      { step: 3, title: 'Apply Online', description: 'Submit visa application at gov.uk/apply-to-come-to-the-uk', estimatedTime: '1–2 hours' },
      { step: 4, title: 'Pay Immigration Health Surcharge', description: 'Pay £776 per year (student rate)', estimatedTime: '30 minutes' },
      { step: 5, title: 'Biometric Appointment', description: 'Provide fingerprints and photo at UKVCAS service point', estimatedTime: '30–60 minutes' },
      { step: 6, title: 'Decision', description: 'UK Visas and Immigration processes application', estimatedTime: '3 weeks' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 12000, currency: 'GBP' }, proofOfFunds: ['Bank statements (28 consecutive days)', 'Official financial sponsor letter', 'Scholarship award letter'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: true, vaccinationsRequired: [], healthInsurance: { required: false } },
    biometrics: { required: true, validityPeriod: '10 years', cost: { amount: 0, currency: 'GBP' } },
    interviewRequirements: { required: false, tips: ['Keep all documents organized', 'Apply early (up to 6 months before course start)'] },
    processingTime: { minimum: '3 weeks', maximum: '8 weeks', average: '3 weeks' },
    postStudyWorkVisa: { available: true, duration: '2 years (3 years for PhD graduates)', eligibility: ['Graduated from UK university', 'Degree at bachelor level or above'], applicationProcess: 'Apply from within UK after graduation', restrictions: ['Cannot extend Graduate visa', 'Can switch to skilled worker visa'] },
    dependentVisa: { available: true, eligibleDependents: ['Spouse/civil partner', 'Children under 18'], requirements: ['Dependant visa application', 'Proof of relationship', 'Financial evidence'], workRights: 'Dependants can work full-time' },
    importantNotes: ['Apply no more than 6 months before course start', 'Must have held funds for 28 consecutive days', 'Immigration Health Surcharge gives access to NHS', 'Students can work up to 20 hours per week during term'],
    usefulLinks: [{ title: 'UKVI Official Guidance', url: 'https://www.gov.uk/student-visa' }],
  },
  {
    country: 'Canada',
    visaTypes: [{ name: 'Study Permit', description: 'Required for most international students studying programs longer than 6 months', duration: 'Program length + 90 days', processingTime: '4–12 weeks', fee: { amount: 150, currency: 'CAD' } }],
    generalRequirements: ['Acceptance letter from designated learning institution (DLI)', 'Proof of sufficient funds', 'Valid passport', 'No criminal record', 'Medical exam (if required)', 'Biometrics'],
    requiredDocuments: [
      { name: 'Letter of Acceptance', description: 'From a designated learning institution (DLI)', mandatory: true, format: 'Original or digital' },
      { name: 'Passport', description: 'Valid passport', mandatory: true, format: 'Original' },
      { name: 'Proof of Funds', description: 'Bank statements, scholarship letters, or financial guarantee', mandatory: true, format: 'Original or certified' },
      { name: 'Statement of Purpose', description: 'Letter explaining why you want to study in Canada', mandatory: true, format: 'Written document' },
      { name: 'Quebec Acceptance Certificate (CAQ)', description: 'Required if studying in Quebec', mandatory: false, format: 'Original' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive Acceptance Letter', description: 'Get acceptance from a DLI institution', estimatedTime: '1–3 months' },
      { step: 2, title: 'Gather Documents', description: 'Prepare all required documents and financial proof', estimatedTime: '2–4 weeks' },
      { step: 3, title: 'Apply Online', description: 'Submit study permit application through IRCC portal', estimatedTime: '2–3 hours' },
      { step: 4, title: 'Provide Biometrics', description: 'Visit designated biometric collection point', estimatedTime: '1 day' },
      { step: 5, title: 'Medical Exam (if required)', description: 'Complete medical examination if needed', estimatedTime: '1–2 weeks' },
      { step: 6, title: 'Receive Decision', description: 'IRCC processes and sends decision', estimatedTime: '4–12 weeks' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 20635, currency: 'CAD' }, proofOfFunds: ['Bank statements', 'Scholarship letter', 'Guaranteed Investment Certificates', 'Sponsor statement'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true, minimumCoverage: 0, currency: 'CAD' } },
    biometrics: { required: true, validityPeriod: '10 years', cost: { amount: 85, currency: 'CAD' } },
    interviewRequirements: { required: false },
    processingTime: { minimum: '4 weeks', maximum: '16 weeks', average: '8 weeks' },
    postStudyWorkVisa: { available: true, duration: '1–3 years (length of study program)', eligibility: ['Completed full-time program 8+ months at DLI', 'Applied within 180 days of graduation'], applicationProcess: 'Apply for Post-Graduation Work Permit (PGWP) from within Canada', restrictions: ['Open work permit — work anywhere in Canada', 'Can lead to Express Entry permanent residency'] },
    dependentVisa: { available: true, eligibleDependents: ['Spouse/common-law partner', 'Dependent children'], requirements: ['Spouse can apply for open work permit', 'Children can attend school'], workRights: 'Spouses of full-time students can get open work permits' },
    importantNotes: ['Apply for study permit as early as possible', 'Students can work up to 24 hours/week off-campus', 'Co-op work terms are permitted with proper authorization'],
    usefulLinks: [{ title: 'IRCC Study in Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' }],
  },
  {
    country: 'Australia',
    visaTypes: [{ name: 'Student Visa (Subclass 500)', description: 'For international students studying a registered course in Australia', duration: 'Course duration + 1–2 months', processingTime: '4–6 weeks', fee: { amount: 710, currency: 'AUD' } }],
    generalRequirements: ['Confirmation of Enrolment (CoE) from CRICOS-registered provider', 'Genuine Temporary Entrant (GTE) requirement', 'Financial capacity', 'English proficiency', 'Health insurance (OSHC)'],
    requiredDocuments: [
      { name: 'Confirmation of Enrolment (CoE)', description: 'Electronic document from Australian institution', mandatory: true, format: 'Electronic record' },
      { name: 'Valid Passport', description: 'Valid for entire study period', mandatory: true, format: 'Original' },
      { name: 'OSHC Evidence', description: 'Overseas Student Health Cover insurance', mandatory: true, format: 'Certificate' },
      { name: 'Financial Evidence', description: 'Proof of funds for tuition and living expenses', mandatory: true, format: 'Bank statements' },
      { name: 'GTE Statement', description: 'Statement explaining genuine temporary entrant status', mandatory: true, format: 'Written statement' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive CoE', description: 'Enrol and receive Confirmation of Enrolment from institution', estimatedTime: '1–2 weeks' },
      { step: 2, title: 'Purchase OSHC', description: 'Buy Overseas Student Health Cover for entire study duration', estimatedTime: '1–2 days' },
      { step: 3, title: 'Apply Online (ImmiAccount)', description: 'Submit visa application through immi.homeaffairs.gov.au', estimatedTime: '2–4 hours' },
      { step: 4, title: 'Biometrics', description: 'May be required depending on nationality', estimatedTime: '1 day' },
      { step: 5, title: 'Health Examination', description: 'Complete medical examination if required', estimatedTime: '1–2 weeks' },
      { step: 6, title: 'Visa Grant', description: 'Department of Home Affairs grants visa', estimatedTime: '4–6 weeks' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 24505, currency: 'AUD' }, proofOfFunds: ['Bank statements', 'Scholarship letter', 'Sponsor declaration', 'Loan approval'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true, minimumCoverage: 0, currency: 'AUD' } },
    biometrics: { required: false },
    interviewRequirements: { required: false },
    processingTime: { minimum: '4 weeks', maximum: '12 weeks', average: '5 weeks' },
    postStudyWorkVisa: { available: true, duration: '2–4 years depending on qualification and study location', eligibility: ['Completed degree in Australia', 'Applied within 6 months of graduation'], applicationProcess: 'Apply for Temporary Graduate visa (subclass 485)', restrictions: ['Regional study may grant additional 1–2 years', 'Skills in demand visa available for selected occupations'] },
    dependentVisa: { available: true, eligibleDependents: ['Spouse/de facto partner', 'Dependent children'], requirements: ['Subclass 500 allows dependants', 'Financial evidence required'], workRights: 'Spouses of students can work up to 48 hours per fortnight' },
    importantNotes: ['Must maintain 80% attendance', 'Must make satisfactory academic progress', 'Notify provider of address changes within 7 days'],
    usefulLinks: [{ title: 'Home Affairs Student Visa', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' }],
  },
  {
    country: 'Germany',
    visaTypes: [{ name: 'National Visa (Type D) for Study Purposes', description: 'Long-stay visa for students enrolled at German universities', duration: 'Up to 90 days, converted to residence permit on arrival', processingTime: '6–12 weeks', fee: { amount: 75, currency: 'EUR' } }],
    generalRequirements: ['University admission letter', 'Proof of sufficient funds (€11,208/year blocked account or sponsorship)', 'German language proficiency (if required)', 'Health insurance', 'No criminal record'],
    requiredDocuments: [
      { name: 'University Admission Letter', description: 'Acceptance letter from German university', mandatory: true, format: 'Original' },
      { name: 'Valid Passport', description: 'Valid for at least 3 months beyond stay', mandatory: true, format: 'Original + copy' },
      { name: 'Blocked Account (Sperrkonto)', description: 'Proof of €11,208 in blocked account', mandatory: true, format: 'Bank certificate' },
      { name: 'Health Insurance', description: 'Travel/health insurance valid in Germany', mandatory: true, format: 'Certificate' },
      { name: 'Biometric Photos', description: 'Recent passport photos to German specifications', mandatory: true, format: 'Printed' },
      { name: 'Academic Certificates', description: 'Degree certificates and transcripts with certified translations', mandatory: true, format: 'Certified copies' },
    ],
    applicationProcess: [
      { step: 1, title: 'Apply to German University', description: 'Get admission from German university via uni-assist or directly', estimatedTime: '2–6 months' },
      { step: 2, title: 'Open Blocked Account', description: 'Open Sperrkonto with providers like Deutsche Bank, Fintiba, or Expatrio', estimatedTime: '1–2 weeks' },
      { step: 3, title: 'Get Health Insurance', description: 'Obtain health insurance valid in Germany', estimatedTime: '1 week' },
      { step: 4, title: 'Schedule Visa Appointment', description: 'Book appointment at German embassy/consulate', estimatedTime: '2–4 weeks for appointment' },
      { step: 5, title: 'Attend Embassy Interview', description: 'Submit application and biometrics at embassy', estimatedTime: '1 day' },
      { step: 6, title: 'Visa & Residence Permit', description: 'Receive visa; convert to residence permit at Ausländerbehörde after arrival', estimatedTime: '6–12 weeks processing' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 11208, currency: 'EUR' }, proofOfFunds: ['Blocked account (Sperrkonto)', 'Scholarship letter (DAAD, etc.)', 'Parental guarantee with income proof'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true, minimumCoverage: 30000, currency: 'EUR' } },
    biometrics: { required: true, validityPeriod: '10 years' },
    interviewRequirements: { required: false, tips: ['Have all documents organized', 'Be clear about study plans and funding'] },
    processingTime: { minimum: '6 weeks', maximum: '16 weeks', average: '10 weeks' },
    postStudyWorkVisa: { available: true, duration: '18 months job-seeking visa', eligibility: ['Completed degree in Germany', 'Apply within 90 days of graduation'], applicationProcess: 'Apply at local Ausländerbehörde for Aufenthaltserlaubnis zur Arbeitssuche', restrictions: ['Can work up to 10 hours/week while job-seeking', 'Must find skilled job within 18 months to convert to work visa'] },
    dependentVisa: { available: true, eligibleDependents: ['Spouse', 'Minor children'], requirements: ['Family reunion visa', 'Proof of accommodation', 'Sufficient funds for family'], workRights: 'Spouses can apply for work authorization' },
    importantNotes: ['Near-zero tuition at most German public universities', 'Register address (Anmeldung) within 2 weeks of arrival', 'Enrol in public health insurance (AOK, TK, Barmer) after arrival'],
    usefulLinks: [{ title: 'DAAD Study in Germany', url: 'https://www.daad.de/en/study-and-research-in-germany/' }, { title: 'Study in Germany Official Portal', url: 'https://www.study-in-germany.de' }],
  },
  {
    country: 'Singapore',
    visaTypes: [{ name: "Student's Pass", description: 'For international students studying full-time at Singapore institutions', duration: 'Course duration', processingTime: '4 weeks', fee: { amount: 90, currency: 'SGD' } }],
    generalRequirements: ["Acceptance letter from Singapore institution", 'Valid passport', 'Financial proof', 'No criminal record', 'Medical examination if required'],
    requiredDocuments: [
      { name: 'Passport', description: 'Valid for at least 6 months', mandatory: true, format: 'Original' },
      { name: 'Acceptance Letter', description: 'From Singapore registered institution', mandatory: true, format: 'Original' },
      { name: 'Academic Transcripts', description: 'Previous education certificates', mandatory: true, format: 'Original or certified copy' },
      { name: 'Bank Statements', description: 'Financial proof for tuition and living', mandatory: true, format: '3 months statements' },
      { name: 'Passport Photos', description: 'Recent photos to Singapore specifications', mandatory: true, format: 'Printed' },
    ],
    applicationProcess: [
      { step: 1, title: 'eForm16 Submission', description: 'Institution submits eForm16 to ICA on your behalf', estimatedTime: '1–2 weeks' },
      { step: 2, title: 'In-Principle Approval (IPA)', description: 'ICA issues IPA letter — enter Singapore with this', estimatedTime: '4 weeks' },
      { step: 3, title: 'Arrive in Singapore', description: 'Enter with IPA letter and valid passport', estimatedTime: '1 day' },
      { step: 4, title: 'Medical Examination', description: 'Undergo medical check if required', estimatedTime: '1 day' },
      { step: 5, title: 'Student Pass Collection', description: "Collect Student's Pass at ICA Building", estimatedTime: '1 day' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 30000, currency: 'SGD' }, proofOfFunds: ['Bank statements', 'Scholarship letter', 'Sponsor declaration'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: true, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true },
    interviewRequirements: { required: false },
    processingTime: { minimum: '3 weeks', maximum: '6 weeks', average: '4 weeks' },
    postStudyWorkVisa: { available: true, duration: '1 year (LOC scheme)', eligibility: ['Graduated from NUS/NTU/SMU/SUTD/SIT/SUSS'], applicationProcess: 'Apply for Long Term Visit Pass – Plus (LTVP+) or Employment Pass after job offer' },
    dependentVisa: { available: false },
    importantNotes: ['MOE Tuition Grant recipients must work in Singapore for 3 years', 'Can work part-time up to 16 hours/week during term'],
    usefulLinks: [{ title: 'ICA Student Pass', url: 'https://www.ica.gov.sg/enter-depart-transit/foreign-residents/students' }],
  },
  {
    country: 'Japan',
    visaTypes: [{ name: 'Student Visa (College Student)', description: 'For students enrolled at Japanese educational institutions', duration: '3 months to 4 years 3 months', processingTime: '4–8 weeks', fee: { amount: 3000, currency: 'JPY' } }],
    generalRequirements: ['Certificate of Eligibility (COE) from immigration', 'Acceptance letter from Japanese institution', 'Proof of funds', 'Valid passport'],
    requiredDocuments: [
      { name: 'Certificate of Eligibility (COE)', description: 'Issued by Japanese Regional Immigration Bureau through institution', mandatory: true, format: 'Original' },
      { name: 'Passport', description: 'Valid during study period', mandatory: true, format: 'Original' },
      { name: 'Visa Application Form', description: 'Completed application form', mandatory: true, format: 'Printed' },
      { name: 'Photo', description: 'Recent passport photo (4.5cm × 4.5cm)', mandatory: true, format: 'Printed' },
      { name: 'Acceptance Letter', description: 'From Japanese educational institution', mandatory: true, format: 'Original' },
    ],
    applicationProcess: [
      { step: 1, title: 'Institution Applies for COE', description: 'Your Japanese institution applies for COE on your behalf', estimatedTime: '1–3 months' },
      { step: 2, title: 'Receive COE', description: 'COE sent to you by post or courier', estimatedTime: '1 week delivery' },
      { step: 3, title: 'Apply at Japanese Embassy', description: 'Submit visa application with COE at embassy', estimatedTime: '1 day' },
      { step: 4, title: 'Visa Processing', description: 'Embassy processes visa application', estimatedTime: '5 business days' },
      { step: 5, title: 'Enter Japan', description: 'Use visa to enter Japan and register at ward office', estimatedTime: '1 day' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 2000000, currency: 'JPY' }, proofOfFunds: ['Bank statements', 'MEXT/JASSO scholarship letter', 'Sponsor affidavit'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true, validityPeriod: '5 years' },
    interviewRequirements: { required: false },
    processingTime: { minimum: '4 weeks', maximum: '10 weeks', average: '6 weeks' },
    postStudyWorkVisa: { available: true, duration: '1–2 years job-seeking', eligibility: ['Graduated from Japanese university'], applicationProcess: 'Apply at Regional Immigration Bureau for Designated Activities visa for job hunting' },
    dependentVisa: { available: true, eligibleDependents: ['Spouse', 'Children'], requirements: ['Dependent visa', 'Proof of relationship'], workRights: 'Dependants can apply for work permit separately' },
    importantNotes: ['Can work up to 28 hours/week with part-time work permission', 'Register at municipal office within 14 days of arrival', 'Enrol in National Health Insurance (NHI)'],
    usefulLinks: [{ title: 'JASSO Study in Japan', url: 'https://www.jasso.or.jp/en/' }, { title: 'Japan Immigration', url: 'https://www.moj.go.jp/isa/index.html' }],
  },
  {
    country: 'Netherlands',
    visaTypes: [{ name: 'MVV + Residence Permit (VVR)', description: 'Long-stay visa and residence permit for non-EU/EEA students', duration: 'Study duration', processingTime: '2–4 weeks (via university)', fee: { amount: 192, currency: 'EUR' } }],
    generalRequirements: ['Acceptance from Dutch university', 'Sufficient funds', 'Valid passport', 'Health insurance', 'EU/EEA citizens exempt from MVV'],
    requiredDocuments: [
      { name: 'Acceptance Letter', description: 'From Dutch university (handles MVV/IND for you)', mandatory: true, format: 'Original' },
      { name: 'Passport', description: 'Valid for study duration + 6 months', mandatory: true, format: 'Original + copy' },
      { name: 'Passport Photos', description: 'Recent biometric photos', mandatory: true, format: 'Printed' },
      { name: 'Proof of Funds', description: 'Sufficient financial means (€900–€1200/month)', mandatory: true, format: 'Bank statement' },
      { name: 'Diploma/Transcripts', description: 'Previous education documents', mandatory: true, format: 'Certified copy with translation' },
    ],
    applicationProcess: [
      { step: 1, title: 'University Applies to IND', description: 'Dutch university submits your residence permit application to IND', estimatedTime: '2–4 weeks' },
      { step: 2, title: 'MVV Authorization', description: 'IND authorizes entry visa (MVV) — university notifies you', estimatedTime: '2 weeks' },
      { step: 3, title: 'Collect MVV', description: 'Collect MVV at Dutch embassy in home country', estimatedTime: '1 week' },
      { step: 4, title: 'Travel to Netherlands', description: 'Enter Netherlands within validity period', estimatedTime: '1 day' },
      { step: 5, title: 'Register with Municipality', description: 'Register at municipality (gemeente) and collect residence permit', estimatedTime: '1–2 weeks' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 12000, currency: 'EUR' }, proofOfFunds: ['Bank statements', 'Scholarship letter', 'Parental guarantee'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true },
    interviewRequirements: { required: false },
    processingTime: { minimum: '2 weeks', maximum: '6 weeks', average: '3 weeks' },
    postStudyWorkVisa: { available: true, duration: '1 year orientation year (Zoekjaar)', eligibility: ['Graduated from Dutch university'], applicationProcess: 'Apply for Zoekjaar (orientation year) permit within 3 years of graduation' },
    dependentVisa: { available: true, eligibleDependents: ['Spouse/partner', 'Children under 18'], requirements: ['Sufficient income', 'Proof of relationship'], workRights: 'Dependants can work with work permit' },
    importantNotes: ['Most universities handle visa process for you', 'Register with municipality (BRP) within 5 days of arrival', 'Health insurance is mandatory (Zorgverzekering) for EU residents'],
    usefulLinks: [{ title: 'IND - Study in Netherlands', url: 'https://ind.nl/en/study' }],
  },
  {
    country: 'South Korea',
    visaTypes: [{ name: 'D-2 Student Visa', description: 'For foreign students enrolled in Korean universities', duration: 'Up to 2 years (renewable)', processingTime: '3–4 weeks', fee: { amount: 60000, currency: 'KRW' } }],
    generalRequirements: ['Acceptance letter from Korean institution', 'Financial capability proof', 'Valid passport', 'Clean criminal record'],
    requiredDocuments: [
      { name: 'Acceptance Letter', description: 'From Korean university', mandatory: true, format: 'Original' },
      { name: 'Passport', description: 'Valid for study period', mandatory: true, format: 'Original' },
      { name: 'Application Form', description: 'Visa application form (Form 34)', mandatory: true, format: 'Printed' },
      { name: 'Financial Proof', description: 'Bank statement or scholarship letter showing ₩20M+ (approx)', mandatory: true, format: 'Original or certified' },
      { name: 'Photo', description: 'Recent passport photo (3.5cm × 4.5cm)', mandatory: true, format: 'Printed' },
      { name: 'Academic Records', description: 'Transcripts and graduation certificates', mandatory: true, format: 'Certified copy' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive Acceptance Letter', description: 'Get official acceptance from Korean university', estimatedTime: '1–2 months' },
      { step: 2, title: 'Prepare Documents', description: 'Collect all required documents, translate if necessary', estimatedTime: '2–3 weeks' },
      { step: 3, title: 'Apply at Korean Embassy', description: 'Submit visa application at Korean embassy/consulate', estimatedTime: '1 day' },
      { step: 4, title: 'Visa Processing', description: 'Embassy processes application', estimatedTime: '3–4 weeks' },
      { step: 5, title: 'Alien Registration', description: 'Register as alien at immigration office within 90 days of arrival', estimatedTime: '1 day' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 20000000, currency: 'KRW' }, proofOfFunds: ['Bank statements', 'KGSP scholarship letter', 'Sponsor guarantee'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true },
    interviewRequirements: { required: false },
    processingTime: { minimum: '3 weeks', maximum: '8 weeks', average: '4 weeks' },
    postStudyWorkVisa: { available: true, duration: '1–2 years (D-10 Job-seeking visa)', eligibility: ['Graduated from Korean university (bachelor\'s or higher)'], applicationProcess: 'Apply at immigration office for D-10 visa after graduation' },
    dependentVisa: { available: true, eligibleDependents: ['Spouse', 'Children'], requirements: ['F-3 family visit visa or F-1 co-habitation visa'], workRights: 'Dependants need separate work authorization' },
    importantNotes: ['Can work up to 20 hours/week during semester with work permit', 'TOPIK (Korean proficiency) helpful for daily life', 'National Health Insurance enrollment mandatory'],
    usefulLinks: [{ title: 'Study in Korea Official', url: 'https://www.studyinkorea.go.kr' }],
  },
  {
    country: 'France',
    visaTypes: [{ name: 'Long-Stay Student Visa (VLS-TS Étudiant)', description: 'For students enrolling in French higher education institutions', duration: '1 year (renewable)', processingTime: '3–6 weeks', fee: { amount: 99, currency: 'EUR' } }],
    generalRequirements: ['Acceptance letter from French institution', 'Proof of accommodation', 'Financial means (€615/month minimum)', 'Valid passport', 'Language proficiency (French or English)'],
    requiredDocuments: [
      { name: 'Acceptance Letter', description: 'From French educational institution or Campus France pre-registration', mandatory: true, format: 'Original' },
      { name: 'Passport', description: 'Valid at least 3 months beyond stay + copies', mandatory: true, format: 'Original + copy' },
      { name: 'Proof of Accommodation', description: 'Student housing reservation or host family certificate', mandatory: true, format: 'Original' },
      { name: 'Financial Guarantee', description: 'Proof of €615/month (bank statements or scholarship)', mandatory: true, format: 'Bank statements 3 months' },
      { name: 'Civil Status Documents', description: 'Birth certificate with translation if required', mandatory: true, format: 'Certified copy + translation' },
    ],
    applicationProcess: [
      { step: 1, title: 'Campus France Procedure', description: 'Register through Campus France portal (mandatory for many countries)', estimatedTime: '2–4 weeks' },
      { step: 2, title: 'Campus France Interview', description: 'Attend Campus France interview in home country', estimatedTime: '1 day' },
      { step: 3, title: 'Visa Application', description: 'Submit visa application at French consulate', estimatedTime: '1 day' },
      { step: 4, title: 'Visa Processing', description: 'Consulate processes application', estimatedTime: '3–6 weeks' },
      { step: 5, title: 'OFII Validation', description: 'Validate VLS-TS online within 3 months of arrival (obligatoire)', estimatedTime: '1 hour online' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 7380, currency: 'EUR' }, proofOfFunds: ['Bank statements', 'Eiffel scholarship letter', 'Parental guarantee with income proof'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true },
    interviewRequirements: { required: false },
    processingTime: { minimum: '3 weeks', maximum: '8 weeks', average: '4 weeks' },
    postStudyWorkVisa: { available: true, duration: '1 year (APS — Autorisation Provisoire de Séjour)', eligibility: ['Master\'s degree or higher from French institution'], applicationProcess: 'Apply at local prefecture after graduation' },
    dependentVisa: { available: true, eligibleDependents: ['Spouse', 'Children under 18'], requirements: ['Minimum income requirement', 'Proof of relationship', 'Accommodation proof'], workRights: 'Spouses can apply for work authorization' },
    importantNotes: ['Students can work up to 964 hours/year (60% of annual working time)', 'Social security (Sécurité sociale) enrollment through university', 'CAF housing allowance available for students'],
    usefulLinks: [{ title: 'Campus France', url: 'https://www.campusfrance.org/en' }, { title: 'French Consulate Visa', url: 'https://france-visas.gouv.fr/en_US/web/france-visas/' }],
  },
  {
    country: 'New Zealand',
    visaTypes: [{ name: 'Student Visa', description: 'For international students studying in New Zealand', duration: 'Course duration + 1 month', processingTime: '4–6 weeks', fee: { amount: 330, currency: 'NZD' } }],
    generalRequirements: ['Offer of place from New Zealand institution', 'Proof of funds', 'Valid passport', 'Health and character requirements'],
    requiredDocuments: [
      { name: 'Offer of Place', description: 'Acceptance letter from New Zealand institution', mandatory: true, format: 'Original or certified copy' },
      { name: 'Passport', description: 'Valid for study duration', mandatory: true, format: 'Original' },
      { name: 'Financial Proof', description: 'NZD 15,000/year for living expenses + tuition proof', mandatory: true, format: 'Bank statements' },
      { name: 'Medical Certificate', description: 'If studying 12+ months', mandatory: false, format: 'Immigration-approved doctor' },
      { name: 'Police Certificate', description: 'Character clearance from home country', mandatory: true, format: 'Original' },
    ],
    applicationProcess: [
      { step: 1, title: 'Receive Offer of Place', description: 'Get acceptance from New Zealand institution', estimatedTime: '1–4 weeks' },
      { step: 2, title: 'Prepare Documents', description: 'Gather financial and health documents', estimatedTime: '2–4 weeks' },
      { step: 3, title: 'Apply Online (Immigration NZ)', description: 'Submit application via Immigration NZ online portal', estimatedTime: '2–3 hours' },
      { step: 4, title: 'Medical/X-ray if required', description: 'Complete health screening if studying 12+ months', estimatedTime: '1–2 weeks' },
      { step: 5, title: 'Visa Decision', description: 'Immigration NZ processes and decides', estimatedTime: '4–6 weeks' },
    ],
    financialRequirements: { minimumBankBalance: { amount: 15000, currency: 'NZD' }, proofOfFunds: ['Bank statements', 'Scholarship letter', 'Sponsor declaration'], sponsorshipAllowed: true, workPermitAvailable: true },
    medicalRequirements: { medicalExamRequired: false, vaccinationsRequired: [], healthInsurance: { required: true } },
    biometrics: { required: true },
    interviewRequirements: { required: false },
    processingTime: { minimum: '3 weeks', maximum: '8 weeks', average: '5 weeks' },
    postStudyWorkVisa: { available: true, duration: '1–3 years (Post Study Work Visa)', eligibility: ['Completed 2+ year qualification in NZ', 'Graduated from listed NZ institution'], applicationProcess: 'Apply for Post Study Work Visa after graduation' },
    dependentVisa: { available: true, eligibleDependents: ['Spouse/partner', 'Children under 17'], requirements: ['Proof of relationship', 'Financial evidence'], workRights: 'Partners of student visa holders can apply for work visa' },
    importantNotes: ['Can work up to 20 hours/week during semester and full-time during holidays', 'Post-study work visa up to 3 years available'],
    usefulLinks: [{ title: 'Immigration NZ', url: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/student-visa' }],
  },
];

// ─── CSV parser ───────────────────────────────────────────────────────────────
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      University.deleteMany({}),
      Scholarship.deleteMany({}),
      VisaGuide.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing collections');

    // Admin user
    await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@studybridge.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('👤 Admin user created');

    // Parse CSV
    const csvPath = path.join(__dirname, '../data/universities_100.csv');
    const rows = await parseCSVFile(csvPath);

    // Filter valid rows and deduplicate by name
    const seen = new Set();
    const uniqueRows = rows.filter(row => {
      const name = (row['University Name'] || '').trim();
      if (!name || name.startsWith('Total') || name.startsWith('Countries') || name.startsWith('Approximate')) return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });

    console.log(`📋 Found ${uniqueRows.length} unique universities in CSV`);

    // Map rows to university documents
    const uniDocs = uniqueRows.map(rowToUniversity).filter(Boolean);

    // Insert one-by-one to guarantee each document persists
    let insertedCount = 0;
    for (const doc of uniDocs) {
      try {
        await University.create(doc);
        insertedCount++;
        if (insertedCount % 10 === 0 || insertedCount === uniDocs.length) {
          process.stdout.write(`\r🎓 Inserted ${insertedCount}/${uniDocs.length} universities...`);
        }
      } catch (e) {
        // Skip duplicates silently; log other errors
        if (e.code !== 11000) {
          process.stdout.write(`\n  ⚠ Skipped "${doc.name}": ${e.message.substring(0, 80)}\n`);
        }
      }
    }
    // Verify actual DB count
    const realUniCount = await University.countDocuments();
    console.log(`\n🎓 Seeded ${realUniCount} universities (verified in DB)`);

    // Scholarships
    for (const s of STANDALONE_SCHOLARSHIPS) {
      try { await Scholarship.create(s); } catch (e) { if (e.code !== 11000) console.error('Scholarship error:', e.message); }
    }
    const realScholCount = await Scholarship.countDocuments();
    console.log(`💰 Seeded ${realScholCount} scholarships (verified)`);

    // Visa guides
    for (const v of VISA_GUIDES) {
      try { await VisaGuide.create(v); } catch (e) { if (e.code !== 11000) console.error('Visa guide error:', e.message); }
    }
    const realVisaCount = await VisaGuide.countDocuments();
    console.log(`✈️  Seeded ${realVisaCount} visa guides (verified)`);

    // Final verification
    const finalUni = await University.countDocuments();
    console.log('\n✅ Database seeded successfully!');
    console.log('──────────────────────────────────────');
    console.log(`Universities : ${finalUni} (in DB)`);
    console.log(`Scholarships : ${realScholCount} (in DB)`);
    console.log(`Visa Guides  : ${realVisaCount} (in DB)`);
    console.log(`Admin email  : ${process.env.ADMIN_EMAIL || 'admin@studybridge.com'}`);
    console.log('──────────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
