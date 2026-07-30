const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Announcement = require('./models/Announcement');

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing sample dataset...');
    await User.deleteMany({ role: { $ne: 'admin' } }); // keep admin account
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Announcement.deleteMany({});

    console.log('Creating individual password hashes (name+123)...');
    const salt = await bcrypt.genSalt(10);
    const hash = (pwd) => bcrypt.hashSync(pwd, salt);

    // ==========================================
    // 1. RECRUITER / COMPANY USERS (5 Companies)
    // ==========================================
    console.log('Seeding 5 Company Recruiter accounts with company@gmail.com and company123 passwords...');
    const companiesData = [
      {
        role: 'company',
        status: 'active',
        companyName: 'TechCorp Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop',
        email: 'techcorp@gmail.com',
        password: hash('techcorp123'),
        fullName: 'Sarah Jenkins',
        recruiterName: 'Sarah Jenkins',
        recruiterDesignation: 'Head of Talent Acquisition',
        phone: '+91 9876543210',
        contactNumber: '+91 9876543210',
        industryType: 'Information Technology & Cloud',
        companyDescription: 'TechCorp Solutions is a global enterprise software and digital transformation company powering Fortune 500 tech systems.',
        website: 'https://techcorp.com',
        headquarters: 'Bengaluru, India',
        officeLocations: ['Bengaluru', 'Hyderabad', 'Pune'],
        companySize: 4500,
        yearOfEstablishment: 2008,
      },
      {
        role: 'company',
        status: 'active',
        companyName: 'DataSystems Global',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop',
        email: 'datasystems@gmail.com',
        password: hash('datasystems123'),
        fullName: 'Mark Redman',
        recruiterName: 'Mark Redman',
        recruiterDesignation: 'Lead University Recruiter',
        phone: '+91 9812345678',
        contactNumber: '+91 9812345678',
        industryType: 'Big Data & AI Analytics',
        companyDescription: 'Pioneering artificial intelligence and big data analytics infrastructure for healthcare, finance, and logistics.',
        website: 'https://datasystems.io',
        headquarters: 'Hyderabad, India',
        officeLocations: ['Hyderabad', 'Gurugram', 'Mumbai'],
        companySize: 2100,
        yearOfEstablishment: 2012,
      },
      {
        role: 'company',
        status: 'active',
        companyName: 'CloudScale Innovations',
        companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31727202b3?w=120&auto=format&fit=crop',
        email: 'cloudscale@gmail.com',
        password: hash('cloudscale123'),
        fullName: 'Priya Sharma',
        recruiterName: 'Priya Sharma',
        recruiterDesignation: 'HR Manager - Early Careers',
        phone: '+91 9988776655',
        contactNumber: '+91 9988776655',
        industryType: 'Cloud Infrastructure & SaaS',
        companyDescription: 'Building resilient multi-cloud management platforms and automated DevOps container orchestrations.',
        website: 'https://cloudscale.net',
        headquarters: 'Pune, India',
        officeLocations: ['Pune', 'Bengaluru', 'Noida'],
        companySize: 1200,
        yearOfEstablishment: 2016,
      },
      {
        role: 'company',
        status: 'pending',
        companyName: 'NextGen Robotics',
        companyLogo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&auto=format&fit=crop',
        email: 'nextgen@gmail.com',
        password: hash('nextgen123'),
        fullName: 'David Miller',
        recruiterName: 'David Miller',
        recruiterDesignation: 'Senior HR Specialist',
        phone: '+91 9765432109',
        contactNumber: '+91 9765432109',
        industryType: 'Robotics & Hardware Systems',
        companyDescription: 'Designing autonomous warehouse robots and industrial IoT control systems for global supply chains.',
        website: 'https://nextgenrobotics.ai',
        headquarters: 'Chennai, India',
        officeLocations: ['Chennai', 'Bengaluru'],
        companySize: 850,
        yearOfEstablishment: 2018,
      },
      {
        role: 'company',
        status: 'rejected',
        companyName: 'CyberFortress Networks',
        companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop',
        email: 'cyberfortress@gmail.com',
        password: hash('cyberfortress123'),
        fullName: 'Elena Vance',
        recruiterName: 'Elena Vance',
        recruiterDesignation: 'Director of HR Operations',
        phone: '+91 9654321098',
        contactNumber: '+91 9654321098',
        industryType: 'Cyber Security & Network Defense',
        companyDescription: 'Next-generation zero-trust threat intelligence and automated endpoint protection security solutions.',
        website: 'https://cyberfortress.sec',
        headquarters: 'Noida, India',
        officeLocations: ['Noida', 'Gurugram'],
        companySize: 500,
        yearOfEstablishment: 2020,
      },
      {
        role: 'company',
        status: 'pending',
        companyName: 'Quantum AI Labs',
        companyLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop',
        email: 'quantum@gmail.com',
        password: hash('quantum123'),
        fullName: 'Dr. Alex Mercer',
        recruiterName: 'Dr. Alex Mercer',
        recruiterDesignation: 'Head of Research Recruitment',
        phone: '+91 9543210987',
        contactNumber: '+91 9543210987',
        industryType: 'Quantum Computing & Deep Learning',
        companyDescription: 'Building quantum algorithms and GPU-accelerated computing clusters for genomic research and finance.',
        website: 'https://quantumai.io',
        headquarters: 'Bengaluru, India',
        officeLocations: ['Bengaluru'],
        companySize: 300,
        yearOfEstablishment: 2022,
      },
      {
        role: 'company',
        status: 'pending',
        companyName: 'Starlight Interactive Media',
        companyLogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&auto=format&fit=crop',
        email: 'starlight@gmail.com',
        password: hash('starlight123'),
        fullName: 'Rhea Kapoor',
        recruiterName: 'Rhea Kapoor',
        recruiterDesignation: 'Talent Acquisition Partner',
        phone: '+91 9432109876',
        contactNumber: '+91 9432109876',
        industryType: 'Interactive Gaming & 3D Media',
        companyDescription: 'Developing Unreal Engine 5 AAA games and immersive virtual reality simulation platforms.',
        website: 'https://starlight.game',
        headquarters: 'Mumbai, India',
        officeLocations: ['Mumbai', 'Pune'],
        companySize: 650,
        yearOfEstablishment: 2019,
      },
    ];

    const insertedCompanies = await User.insertMany(companiesData);
    console.log(`Created ${insertedCompanies.length} company accounts.`);

    const techCorp = insertedCompanies[0];
    const dataSys = insertedCompanies[1];
    const cloudScale = insertedCompanies[2];
    const nextGen = insertedCompanies[3];
    const cyberFort = insertedCompanies[4];

    // ==========================================
    // 2. STUDENT USERS (10 Students)
    // ==========================================
    console.log('Seeding 10 Student accounts with name@gmail.com and name123 passwords...');
    const studentsData = [
      {
        role: 'student',
        status: 'active',
        fullName: 'Aarav Sharma',
        email: 'aarav@gmail.com',
        password: hash('aarav123'),
        phone: '+91 9123456789',
        gender: 'Male',
        dateOfBirth: new Date('2003-05-14'),
        address: 'MG Road, Indiranagar, Bengaluru',
        collegeName: 'National Institute of Technology',
        university: 'VTU State University',
        branch: 'Computer Science & Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 8.8,
        tenthPercentage: 92.5,
        twelfthPercentage: 90.0,
        activeBacklogs: 0,
        programmingSkills: ['JavaScript', 'TypeScript', 'Python', 'C++'],
        technicalSkills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Docker'],
        certifications: ['AWS Certified Developer Associate', 'Meta Front-End Professional'],
        languagesKnown: ['English', 'Hindi', 'Kannada'],
        preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune'],
        linkedinProfile: 'https://linkedin.com/in/aaravsharma',
        githubProfile: 'https://github.com/aaravsharma',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        projects: [
          { title: 'Distributed E-Commerce Platform', description: 'Built a microservice-based store using Node.js, Redis, and React.', technologies: ['Node.js', 'React', 'Docker'] }
        ],
        internships: [
          { company: 'InnoTech Labs', role: 'Software Engineering Intern', duration: '6 Months', description: 'Optimized REST API endpoints reducing response latency by 35%.' }
        ]
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Ananya Patel',
        email: 'ananya@gmail.com',
        password: hash('ananya123'),
        phone: '+91 9234567890',
        gender: 'Female',
        dateOfBirth: new Date('2003-09-22'),
        address: 'Hitech City, Hyderabad',
        collegeName: 'Indian Institute of Information Technology',
        university: 'IIIT Hyderabad',
        branch: 'Information Technology',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 9.2,
        tenthPercentage: 95.2,
        twelfthPercentage: 94.5,
        activeBacklogs: 0,
        programmingSkills: ['Java', 'Python', 'SQL'],
        technicalSkills: ['Spring Boot', 'PostgreSQL', 'Microservices', 'Kubernetes'],
        certifications: ['Oracle Certified Java SE Professional', 'Google Cloud Engineer'],
        languagesKnown: ['English', 'Hindi', 'Gujarati'],
        preferredLocations: ['Hyderabad', 'Bengaluru'],
        linkedinProfile: 'https://linkedin.com/in/ananyapatel',
        githubProfile: 'https://github.com/ananyapatel',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        projects: [
          { title: 'Banking Transaction Processing Engine', description: 'High-throughput payment Gateway simulation handling 10k transactions/sec.', technologies: ['Java', 'Spring Boot', 'Kafka'] }
        ]
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Rohan Verma',
        email: 'rohan@gmail.com',
        password: hash('rohan123'),
        phone: '+91 9345678901',
        gender: 'Male',
        dateOfBirth: new Date('2003-01-10'),
        address: 'Kothrud, Pune',
        collegeName: 'Pune College of Engineering',
        university: 'Savitribai Phule Pune University',
        branch: 'Electronics & Communication',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 7.9,
        tenthPercentage: 85.0,
        twelfthPercentage: 82.4,
        activeBacklogs: 0,
        programmingSkills: ['C++', 'Embedded C', 'Python'],
        technicalSkills: ['ARM Cortex', 'RTOS', 'MATLAB', 'IoT Protocols'],
        certifications: ['Embedded Systems Specialist Certification'],
        languagesKnown: ['English', 'Hindi', 'Marathi'],
        preferredLocations: ['Pune', 'Bengaluru'],
        linkedinProfile: 'https://linkedin.com/in/rohanverma',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Priya Nair',
        email: 'priya@gmail.com',
        password: hash('priya123'),
        phone: '+91 9456789012',
        gender: 'Female',
        dateOfBirth: new Date('2003-11-30'),
        address: 'Marine Drive, Kochi',
        collegeName: 'National Institute of Technology Calicut',
        university: 'APJ Abdul Kalam Technological University',
        branch: 'Computer Science & Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 8.5,
        tenthPercentage: 90.8,
        twelfthPercentage: 88.6,
        activeBacklogs: 0,
        programmingSkills: ['Python', 'R', 'SQL', 'JavaScript'],
        technicalSkills: ['PyTorch', 'Scikit-Learn', 'FastAPI', 'Pandas', 'Tableau'],
        certifications: ['TensorFlow Developer Certificate', 'AWS ML Specialty'],
        languagesKnown: ['English', 'Malayalam', 'Hindi'],
        preferredLocations: ['Bengaluru', 'Chennai', 'Remote'],
        linkedinProfile: 'https://linkedin.com/in/priyanair',
        githubProfile: 'https://github.com/priyanair',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Vikram Singh',
        email: 'vikram@gmail.com',
        password: hash('vikram123'),
        phone: '+91 9567890123',
        gender: 'Male',
        dateOfBirth: new Date('2002-12-05'),
        address: 'Civil Lines, Jaipur',
        collegeName: 'Malaviya National Institute of Technology',
        university: 'MNIT Jaipur',
        branch: 'Mechanical Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 7.2,
        tenthPercentage: 80.0,
        twelfthPercentage: 78.5,
        activeBacklogs: 1,
        programmingSkills: ['Python', 'C'],
        technicalSkills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'PLC Programming'],
        languagesKnown: ['English', 'Hindi'],
        preferredLocations: ['Noida', 'Gurugram', 'Pune']
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Sneha Gupta',
        email: 'sneha@gmail.com',
        password: hash('sneha123'),
        phone: '+91 9678901234',
        gender: 'Female',
        dateOfBirth: new Date('2003-04-18'),
        address: 'Salt Lake City, Kolkata',
        collegeName: 'Jadavpur University',
        university: 'Jadavpur University',
        branch: 'Electrical Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 8.1,
        tenthPercentage: 88.0,
        twelfthPercentage: 86.2,
        activeBacklogs: 0,
        programmingSkills: ['C++', 'Python', 'MATLAB'],
        technicalSkills: ['Control Systems', 'Power Electronics', 'LabVIEW', 'Arduino'],
        certifications: ['MATLAB Master Certified'],
        languagesKnown: ['English', 'Bengali', 'Hindi'],
        preferredLocations: ['Kolkata', 'Bengaluru', 'Noida']
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Rahul Das',
        email: 'rahul@gmail.com',
        password: hash('rahul123'),
        phone: '+91 9789012345',
        gender: 'Male',
        dateOfBirth: new Date('2003-07-25'),
        address: 'Bandra West, Mumbai',
        collegeName: 'Veermata Jijabai Technological Institute',
        university: 'Mumbai University',
        branch: 'Computer Science & Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 9.5,
        tenthPercentage: 98.0,
        twelfthPercentage: 96.4,
        activeBacklogs: 0,
        programmingSkills: ['Go', 'Rust', 'TypeScript', 'C++'],
        technicalSkills: ['Kubernetes', 'gRPC', 'PostgreSQL', 'GraphQL', 'AWS'],
        certifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Solutions Architect'],
        languagesKnown: ['English', 'Hindi', 'Gujarati'],
        preferredLocations: ['Mumbai', 'Bengaluru', 'Remote'],
        linkedinProfile: 'https://linkedin.com/in/rahuldasdev',
        githubProfile: 'https://github.com/rahuldasdev',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Ishita Roy',
        email: 'ishita@gmail.com',
        password: hash('ishita123'),
        phone: '+91 9890123456',
        gender: 'Female',
        dateOfBirth: new Date('2003-02-14'),
        address: 'Sector 62, Noida',
        collegeName: 'Delhi Technological University',
        university: 'DTU Delhi',
        branch: 'Information Technology',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 8.0,
        tenthPercentage: 86.5,
        twelfthPercentage: 84.0,
        activeBacklogs: 0,
        programmingSkills: ['HTML', 'CSS', 'JavaScript', 'PHP'],
        technicalSkills: ['Vue.js', 'Bootstrap', 'MySQL', 'WordPress'],
        languagesKnown: ['English', 'Hindi'],
        preferredLocations: ['Noida', 'Gurugram', 'Delhi']
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Aditya Joshi',
        email: 'aditya@gmail.com',
        password: hash('aditya123'),
        phone: '+91 9901234567',
        gender: 'Male',
        dateOfBirth: new Date('2002-10-10'),
        address: 'Viman Nagar, Pune',
        collegeName: 'College of Engineering Pune',
        university: 'COEP Tech',
        branch: 'Civil Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 6.8,
        tenthPercentage: 75.0,
        twelfthPercentage: 72.0,
        activeBacklogs: 2,
        programmingSkills: ['Python'],
        technicalSkills: ['MS Excel', 'STAAD Pro', 'Revit'],
        languagesKnown: ['English', 'Hindi', 'Marathi'],
        preferredLocations: ['Pune', 'Mumbai']
      },
      {
        role: 'student',
        status: 'active',
        fullName: 'Kavya Menon',
        email: 'kavya@gmail.com',
        password: hash('kavya123'),
        phone: '+91 9012345678',
        gender: 'Female',
        dateOfBirth: new Date('2003-08-08'),
        address: 'Velachery, Chennai',
        collegeName: 'College of Engineering Guindy',
        university: 'Anna University',
        branch: 'Computer Science & Engineering',
        currentSemester: 8,
        graduationYear: 2026,
        cgpa: 8.6,
        tenthPercentage: 91.0,
        twelfthPercentage: 89.5,
        activeBacklogs: 0,
        programmingSkills: ['Kotlin', 'Java', 'Dart', 'JavaScript'],
        technicalSkills: ['Android SDK', 'Flutter', 'Firebase', 'SQLite'],
        certifications: ['Google Associate Android Developer'],
        languagesKnown: ['English', 'Tamil', 'Malayalam'],
        preferredLocations: ['Chennai', 'Bengaluru'],
        linkedinProfile: 'https://linkedin.com/in/kavyamenon',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ];

    const insertedStudents = await User.insertMany(studentsData);
    console.log(`Created ${insertedStudents.length} student accounts.`);

    const sAarav = insertedStudents[0];
    const sAnanya = insertedStudents[1];
    const sRohan = insertedStudents[2];
    const sPriya = insertedStudents[3];
    const sVikram = insertedStudents[4];
    const sSneha = insertedStudents[5];
    const sRahul = insertedStudents[6];
    const sIshita = insertedStudents[7];
    const sAditya = insertedStudents[8];
    const sKavya = insertedStudents[9];

    // ==========================================
    // 3. JOB VACANCIES (10 Job Drives)
    // ==========================================
    console.log('Seeding 10 Job Drives...');
    const jobsData = [
      {
        company: techCorp._id,
        companyName: techCorp.companyName,
        title: 'Graduate Full Stack Software Engineer',
        jobRole: 'Software Engineer',
        package: '14 LPA',
        employmentType: 'Full Time',
        location: 'Bengaluru / Hyderabad',
        workMode: 'Hybrid',
        description: 'Join our flagship engineering cohort to build modern React and Node.js microservices serving millions of web users globally.',
        requiredSkills: ['React.js', 'Node.js', 'MongoDB', 'REST APIs'],
        requiredProgrammingLanguages: ['JavaScript', 'TypeScript', 'Python'],
        minimumCgpa: 7.5,
        maximumBacklogs: 0,
        minimumTenthPercentage: 75,
        minimumTwelfthPercentage: 75,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        eligibleGraduationYear: [2026],
        applicationDeadline: new Date('2026-08-30'),
        interviewDate: new Date('2026-09-05'),
        interviewTime: '10:00 AM IST',
        interviewVenue: 'TechCorp Innovation Tower, Outer Ring Rd, Bengaluru',
        interviewRounds: ['Online Coding Assessment', 'Technical System Design Round', 'HR Cultural Round'],
        status: 'Open',
      },
      {
        company: techCorp._id,
        companyName: techCorp.companyName,
        title: 'Backend Core Systems Developer',
        jobRole: 'Backend Engineer',
        package: '16 LPA',
        employmentType: 'Full Time',
        location: 'Bengaluru',
        workMode: 'On-site',
        description: 'Architect low-latency streaming pipelines, Redis cache clusters, and transactional microservices in Golang or Java.',
        requiredSkills: ['Spring Boot', 'Go', 'PostgreSQL', 'Redis', 'Kafka'],
        requiredProgrammingLanguages: ['Java', 'Go', 'C++'],
        minimumCgpa: 8.0,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        eligibleGraduationYear: [2026],
        applicationDeadline: new Date('2026-08-25'),
        interviewDate: new Date('2026-09-02'),
        interviewRounds: ['Data Structures Test', 'Backend System Architecture', 'Director Interview'],
        status: 'Open',
      },
      {
        company: dataSys._id,
        companyName: dataSys.companyName,
        title: 'Associate Data & Analytics Engineer',
        jobRole: 'Data Engineer',
        package: '12 LPA',
        employmentType: 'Full Time',
        location: 'Hyderabad',
        workMode: 'Hybrid',
        description: 'Construct automated ETL pipelines, data warehouses, and SQL analytical views for automated business intelligence.',
        requiredSkills: ['SQL', 'Spark', 'Python', 'Snowflake', 'Airflow'],
        requiredProgrammingLanguages: ['Python', 'SQL', 'Scala'],
        minimumCgpa: 7.5,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        eligibleGraduationYear: [2026],
        applicationDeadline: new Date('2026-08-28'),
        interviewDate: new Date('2026-09-10'),
        status: 'Open',
      },
      {
        company: dataSys._id,
        companyName: dataSys.companyName,
        title: 'AI / Machine Learning Research Specialist',
        jobRole: 'ML Engineer',
        package: '18 LPA',
        employmentType: 'Full Time',
        location: 'Hyderabad / Gurugram',
        workMode: 'On-site',
        description: 'Train Large Language Models (LLMs), vision transformers, and predictive neural networks using PyTorch and CUDA GPUs.',
        requiredSkills: ['PyTorch', 'TensorFlow', 'Deep Learning', 'Computer Vision', 'NLP'],
        requiredProgrammingLanguages: ['Python', 'C++'],
        minimumCgpa: 8.5,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        eligibleGraduationYear: [2026],
        applicationDeadline: new Date('2026-09-01'),
        status: 'Open',
      },
      {
        company: cloudScale._id,
        companyName: cloudScale.companyName,
        title: 'Cloud Infrastructure & DevOps Engineer',
        jobRole: 'DevOps Engineer',
        package: '15 LPA',
        employmentType: 'Full Time',
        location: 'Pune',
        workMode: 'Remote',
        description: 'Automate Infrastructure-as-Code (Terraform), manage Kubernetes clusters, and build robust GitHub Action CI/CD pipelines.',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
        requiredProgrammingLanguages: ['Python', 'Bash', 'Go'],
        minimumCgpa: 8.0,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      },
      {
        company: cloudScale._id,
        companyName: cloudScale.companyName,
        title: 'Frontend UI/UX Product Developer',
        jobRole: 'Frontend Developer',
        package: '11 LPA',
        employmentType: 'Full Time',
        location: 'Pune / Bengaluru',
        workMode: 'Hybrid',
        description: 'Craft sleek, responsive user interfaces and interactive analytics dashboards using React 18, HTML5, CSS3, and Tailwind.',
        requiredSkills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
        requiredProgrammingLanguages: ['JavaScript', 'TypeScript'],
        minimumCgpa: 7.0,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      },
      {
        company: nextGen._id,
        companyName: nextGen.companyName,
        title: 'Embedded Robotics Systems Engineer',
        jobRole: 'Embedded Engineer',
        package: '10 LPA',
        employmentType: 'Full Time',
        location: 'Chennai',
        workMode: 'On-site',
        description: 'Develop real-time firmware for microcontroller sensors, motor drivers, and automated autonomous warehouse vehicles.',
        requiredSkills: ['C++', 'Embedded C', 'RTOS', 'Microcontrollers', 'CAN Bus'],
        requiredProgrammingLanguages: ['C++', 'C', 'Python'],
        minimumCgpa: 7.5,
        maximumBacklogs: 1,
        eligibleDepartments: ['Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      },
      {
        company: nextGen._id,
        companyName: nextGen.companyName,
        title: 'Site Reliability & Automation Engineer',
        jobRole: 'SRE Engineer',
        package: '13 LPA',
        employmentType: 'Full Time',
        location: 'Chennai / Bengaluru',
        workMode: 'Hybrid',
        description: 'Monitor robot telemetry feeds, design automated self-healing scripts, and maintain 99.99% server availability.',
        requiredSkills: ['Linux', 'Prometheus', 'Grafana', 'Python', 'Networking'],
        requiredProgrammingLanguages: ['Python', 'Shell'],
        minimumCgpa: 7.5,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      },
      {
        company: cyberFort._id,
        companyName: cyberFort.companyName,
        title: 'Cyber Threat & Security Analyst',
        jobRole: 'Security Engineer',
        package: '12 LPA',
        employmentType: 'Full Time',
        location: 'Noida',
        workMode: 'On-site',
        description: 'Perform penetration testing, audit vulnerability scans, and investigate endpoint security incident logs.',
        requiredSkills: ['Ethical Hacking', 'Penetration Testing', 'Wireshark', 'Metasploit', 'SOC'],
        requiredProgrammingLanguages: ['Python', 'C', 'Bash'],
        minimumCgpa: 7.5,
        maximumBacklogs: 0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      },
      {
        company: techCorp._id,
        companyName: techCorp.companyName,
        title: 'Software Development Engineering Intern',
        jobRole: 'Software Intern',
        package: '6 LPA (35k/mo Stipend)',
        employmentType: 'Internship',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        description: '6-month intensive internship program with hands-on exposure to cloud production microservices and UI components.',
        requiredSkills: ['JavaScript', 'HTML/CSS', 'Git', 'Data Structures'],
        requiredProgrammingLanguages: ['JavaScript', 'Java', 'Python'],
        minimumCgpa: 7.0,
        maximumBacklogs: 1,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        eligibleGraduationYear: [2026],
        status: 'Open',
      }
    ];

    const insertedJobsList = await Job.insertMany(jobsData);
    console.log(`Created ${insertedJobsList.length} Job vacancies.`);

    const jFullStack = insertedJobsList[0];
    const jBackend = insertedJobsList[1];
    const jDataEng = insertedJobsList[2];
    const jAiMl = insertedJobsList[3];
    const jDevOps = insertedJobsList[4];
    const jFrontend = insertedJobsList[5];
    const jEmbedded = insertedJobsList[6];
    const jSre = insertedJobsList[7];
    const jSecurity = insertedJobsList[8];
    const jIntern = insertedJobsList[9];

    // ==========================================
    // 4. APPLICATIONS (15 Applications & Rounds)
    // ==========================================
    console.log('Seeding 15 Applications with interview schedules & selection outcomes...');
    
    const applicationsData = [
      // 1. Aarav -> FullStack (SELECTED)
      {
        student: sAarav._id,
        company: techCorp._id,
        job: jFullStack._id,
        jobTitle: jFullStack.title,
        companyName: techCorp.companyName,
        role: jFullStack.jobRole,
        package: jFullStack.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.8 >= 7.5', '0 Backlogs'] },
        applicationDate: new Date('2026-07-01'),
        rounds: [
          { title: 'Online Assessment', status: 'completed', date: new Date('2026-07-05'), result: 'passed', feedback: 'Scored 98/100 in coding logic and DS questions.' },
          { title: 'Technical System Design', status: 'completed', date: new Date('2026-07-12'), result: 'passed', feedback: 'Excellent grasp of React state management and MongoDB query indexing.' },
          { title: 'HR Manager Interview', status: 'selected', date: new Date('2026-07-18'), result: 'passed', feedback: 'Outstanding communication and cultural alignment. Final Offer Issued.' }
        ],
        feedback: 'Congratulations! Official offer letter of 14 LPA sent via email.'
      },

      // 2. Ananya -> Backend Core Systems (SELECTED)
      {
        student: sAnanya._id,
        company: techCorp._id,
        job: jBackend._id,
        jobTitle: jBackend.title,
        companyName: techCorp.companyName,
        role: jBackend.jobRole,
        package: jBackend.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 9.2 >= 8.0'] },
        applicationDate: new Date('2026-07-02'),
        rounds: [
          { title: 'Data Structures Assessment', status: 'completed', date: new Date('2026-07-06'), result: 'passed', feedback: 'Solved all 3 graph and dynamic programming questions.' },
          { title: 'Backend System Architecture', status: 'completed', date: new Date('2026-07-14'), result: 'passed', feedback: 'Designed fault-tolerant payment engine with Kafka streams.' },
          { title: 'Director HR Interview', status: 'selected', date: new Date('2026-07-20'), result: 'passed', feedback: 'Top candidate of cohort. Selected for 16 LPA role.' }
        ],
        feedback: 'Official Offer Confirmed: 16 LPA CTC.'
      },

      // 3. Rahul -> AI / ML Specialist (SELECTED)
      {
        student: sRahul._id,
        company: dataSys._id,
        job: jAiMl._id,
        jobTitle: jAiMl.title,
        companyName: dataSys.companyName,
        role: jAiMl.jobRole,
        package: jAiMl.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 9.5 >= 8.5'] },
        applicationDate: new Date('2026-07-03'),
        rounds: [
          { title: 'ML Math & Coding Round', status: 'completed', date: new Date('2026-07-08'), result: 'passed', feedback: 'Perfect score on linear algebra, PyTorch backpropagation math.' },
          { title: 'AI Model Architecture Interview', status: 'completed', date: new Date('2026-07-16'), result: 'passed', feedback: 'Demonstrated deep comprehension of Transformer self-attention mechanisms.' },
          { title: 'VP Engineering Interview', status: 'selected', date: new Date('2026-07-22'), result: 'passed', feedback: 'Selected for flagship AI Research role.' }
        ],
        feedback: 'Official Offer Issued: 18 LPA Package.'
      },

      // 4. Priya -> Data Analytics Engineer (SELECTED)
      {
        student: sPriya._id,
        company: dataSys._id,
        job: jDataEng._id,
        jobTitle: jDataEng.title,
        companyName: dataSys.companyName,
        role: jDataEng.jobRole,
        package: jDataEng.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.5 >= 7.5'] },
        applicationDate: new Date('2026-07-04'),
        rounds: [
          { title: 'SQL & Data Pipeline Test', status: 'completed', date: new Date('2026-07-09'), result: 'passed', feedback: 'Clean SQL window functions and PySpark joins.' },
          { title: 'Data Architecture Interview', status: 'completed', date: new Date('2026-07-17'), result: 'passed', feedback: 'Strong understanding of Snowflake schemas and Airflow DAGs.' },
          { title: 'HR Round', status: 'selected', date: new Date('2026-07-24'), result: 'passed', feedback: 'Selected for Data Engineer position.' }
        ],
        feedback: 'Official Offer Confirmed: 12 LPA CTC.'
      },

      // 5. Kavya -> DevOps Engineer (SELECTED)
      {
        student: sKavya._id,
        company: cloudScale._id,
        job: jDevOps._id,
        jobTitle: jDevOps.title,
        companyName: cloudScale.companyName,
        role: jDevOps.jobRole,
        package: jDevOps.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.6 >= 8.0'] },
        applicationDate: new Date('2026-07-05'),
        rounds: [
          { title: 'Docker & Kubernetes Practical', status: 'completed', date: new Date('2026-07-10'), result: 'passed', feedback: 'Deployed multi-node K8s cluster with ingress controller in 25 mins.' },
          { title: 'DevOps System Architecture', status: 'selected', date: new Date('2026-07-19'), result: 'passed', feedback: 'Excellent knowledge of Terraform and GitHub Actions.' }
        ],
        feedback: 'Official Offer Confirmed: 15 LPA CTC.'
      },

      // 6. Sneha -> Embedded Robotics Engineer (SELECTED)
      {
        student: sSneha._id,
        company: nextGen._id,
        job: jEmbedded._id,
        jobTitle: jEmbedded.title,
        companyName: nextGen.companyName,
        role: jEmbedded.jobRole,
        package: jEmbedded.package,
        employmentType: 'Full Time',
        status: 'Selected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.1 >= 7.5'] },
        applicationDate: new Date('2026-07-06'),
        rounds: [
          { title: 'Microcontroller C++ Test', status: 'completed', date: new Date('2026-07-11'), result: 'passed', feedback: 'Solved embedded RTOS interrupt handler challenge.' },
          { title: 'Hardware Design Interview', status: 'selected', date: new Date('2026-07-21'), result: 'passed', feedback: 'Strong electrical circuits knowledge. Selected for 10 LPA offer.' }
        ],
        feedback: 'Official Offer Confirmed: 10 LPA CTC.'
      },

      // 7. Rohan -> Embedded Robotics (REJECTED)
      {
        student: sRohan._id,
        company: nextGen._id,
        job: jEmbedded._id,
        jobTitle: jEmbedded.title,
        companyName: nextGen.companyName,
        role: jEmbedded.jobRole,
        package: jEmbedded.package,
        employmentType: 'Full Time',
        status: 'Rejected',
        eligibility: { isEligible: true, reasons: ['CGPA 7.9 >= 7.5'] },
        applicationDate: new Date('2026-07-07'),
        rounds: [
          { title: 'Microcontroller C++ Test', status: 'completed', date: new Date('2026-07-11'), result: 'failed', feedback: 'Failed RTOS memory management timer questions.' }
        ],
        rejectionReason: 'Weak technical foundation in RTOS memory management and C++ pointers.',
        feedback: 'Improve C++ memory management concepts and reapply in future drives.'
      },

      // 8. Ishita -> Frontend Developer (REJECTED)
      {
        student: sIshita._id,
        company: cloudScale._id,
        job: jFrontend._id,
        jobTitle: jFrontend.title,
        companyName: cloudScale.companyName,
        role: jFrontend.jobRole,
        package: jFrontend.package,
        employmentType: 'Full Time',
        status: 'Rejected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.0 >= 7.0'] },
        applicationDate: new Date('2026-07-08'),
        rounds: [
          { title: 'React.js Coding Round', status: 'completed', date: new Date('2026-07-13'), result: 'failed', feedback: 'Could not complete state management hook implementation within time limit.' }
        ],
        rejectionReason: 'Insufficient hands-on experience with modern React 18 hooks and async state updates.',
        feedback: 'Focus on React custom hooks and asynchronous state handling.'
      },

      // 9. Vikram -> Software Intern (REJECTED)
      {
        student: sVikram._id,
        company: techCorp._id,
        job: jIntern._id,
        jobTitle: jIntern.title,
        companyName: techCorp.companyName,
        role: jIntern.jobRole,
        package: jIntern.package,
        employmentType: 'Internship',
        status: 'Rejected',
        eligibility: { isEligible: false, reasons: ['Department Mechanical Engineering not in eligible branches'] },
        applicationDate: new Date('2026-07-09'),
        rejectionReason: 'Department mismatch: Drive restricted to CS/IT/ECE students.',
        feedback: 'Application auto-rejected due to department eligibility requirements.'
      },

      // 10. Aditya -> Software Intern (REJECTED)
      {
        student: sAditya._id,
        company: techCorp._id,
        job: jIntern._id,
        jobTitle: jIntern.title,
        companyName: techCorp.companyName,
        role: jIntern.jobRole,
        package: jIntern.package,
        employmentType: 'Internship',
        status: 'Rejected',
        eligibility: { isEligible: false, reasons: ['2 Active Backlogs exceeds maximum 1 backlog'] },
        applicationDate: new Date('2026-07-10'),
        rejectionReason: 'Exceeded maximum backlog criteria (Candidate has 2 active backlogs, drive limit is 1).',
        feedback: 'Clear active backlogs to meet campus placement drive eligibility.'
      },

      // 11. Aarav -> Backend Core Systems (REJECTED)
      {
        student: sAarav._id,
        company: techCorp._id,
        job: jBackend._id,
        jobTitle: jBackend.title,
        companyName: techCorp.companyName,
        role: jBackend.jobRole,
        package: jBackend.package,
        employmentType: 'Full Time',
        status: 'Rejected',
        eligibility: { isEligible: true, reasons: ['CGPA 8.8 >= 8.0'] },
        applicationDate: new Date('2026-07-03'),
        rounds: [
          { title: 'Data Structures Assessment', status: 'completed', date: new Date('2026-07-06'), result: 'passed', feedback: 'Passed coding test.' },
          { title: 'Backend System Architecture', status: 'completed', date: new Date('2026-07-14'), result: 'failed', feedback: 'Preferred Full Stack role offer over pure backend.' }
        ],
        rejectionReason: 'Candidate selected for Full Stack role at TechCorp.',
        feedback: 'Candidate accepted another offer within TechCorp.'
      },

      // 12. Ananya -> AI / ML Specialist (IN PROGRESS)
      {
        student: sAnanya._id,
        company: dataSys._id,
        job: jAiMl._id,
        jobTitle: jAiMl.title,
        companyName: dataSys.companyName,
        role: jAiMl.jobRole,
        package: jAiMl.package,
        employmentType: 'Full Time',
        status: 'Technical Interview',
        eligibility: { isEligible: true, reasons: ['CGPA 9.2 >= 8.5'] },
        applicationDate: new Date('2026-07-12'),
        rounds: [
          { title: 'ML Math & Coding Round', status: 'completed', date: new Date('2026-07-18'), result: 'passed', feedback: 'Excellent test performance.' },
          { title: 'AI Model Architecture Interview', status: 'pending', date: new Date('2026-08-05'), time: '11:00 AM IST', venue: 'Google Meet', meetingLink: 'https://meet.google.com/abc-defg-hij', dressCode: 'Formal', requiredDocuments: ['Resume', 'Transcripts'] }
        ]
      },

      // 13. Rahul -> Full Stack Engineer (REJECTED)
      {
        student: sRahul._id,
        company: techCorp._id,
        job: jFullStack._id,
        jobTitle: jFullStack.title,
        companyName: techCorp.companyName,
        role: jFullStack.jobRole,
        package: jFullStack.package,
        employmentType: 'Full Time',
        status: 'Rejected',
        eligibility: { isEligible: true, reasons: ['CGPA 9.5 >= 7.5'] },
        applicationDate: new Date('2026-07-02'),
        rounds: [
          { title: 'Online Assessment', status: 'completed', date: new Date('2026-07-05'), result: 'passed', feedback: 'Perfect coding test.' }
        ],
        rejectionReason: 'Candidate accepted 18 LPA AI Specialist offer at DataSystems.',
        feedback: 'Offer declined by candidate.'
      },

      // 14. Ishita -> SRE Engineer (RESUME UNDER REVIEW)
      {
        student: sIshita._id,
        company: nextGen._id,
        job: jSre._id,
        jobTitle: jSre.title,
        companyName: nextGen.companyName,
        role: jSre.jobRole,
        package: jSre.package,
        employmentType: 'Full Time',
        status: 'Resume Under Review',
        eligibility: { isEligible: true, reasons: ['CGPA 8.0 >= 7.5'] },
        applicationDate: new Date('2026-07-20')
      },

      // 15. Priya -> Cyber Security Analyst (ONLINE ASSESSMENT)
      {
        student: sPriya._id,
        company: cyberFort._id,
        job: jSecurity._id,
        jobTitle: jSecurity.title,
        companyName: cyberFort.companyName,
        role: jSecurity.jobRole,
        package: jSecurity.package,
        employmentType: 'Full Time',
        status: 'Online Assessment',
        eligibility: { isEligible: true, reasons: ['CGPA 8.5 >= 7.5'] },
        applicationDate: new Date('2026-07-22'),
        rounds: [
          { title: 'Cyber Security Online Screening Test', status: 'pending', date: new Date('2026-08-08'), time: '02:00 PM IST', venue: 'Online Assessment Portal', dressCode: 'Smart Casual' }
        ]
      }
    ];

    const insertedApplications = await Application.insertMany(applicationsData);
    console.log(`Created ${insertedApplications.length} Applications with full interview histories.`);

    // ==========================================
    // 5. ANNOUNCEMENTS (4 Notices)
    // ==========================================
    console.log('Seeding Placement Announcements...');
    const announcementsData = [
      {
        title: 'TechCorp Solutions Campus Drive 2026 Announcement',
        content: 'TechCorp Solutions has officially opened registrations for Full Stack and Backend Engineering roles offering up to 16 LPA. Eligible CS & IT students must apply before August 25th.',
        createdBy: techCorp._id,
      },
      {
        title: 'DataSystems Global AI Specialist Shortlist Released',
        content: 'Congratulations to all candidates shortlisted for the AI / ML Specialist technical interview round at DataSystems Global. Please check your interview schedules under your Applications dashboard.',
        createdBy: dataSys._id,
      },
      {
        title: 'Resume & LinkedIn Verification Drive for 2026 Batch',
        content: 'All final-year students are instructed to update their CGPA, active backlogs status, and upload their updated PDF resumes before applying to upcoming campus recruitment drives.',
        createdBy: techCorp._id,
      },
      {
        title: 'Upcoming Mock Technical Interviews & Resume Workshop',
        content: 'The Training & Placement Cell will be conducting mock technical interviews and system design workshops this Saturday at the Main Auditorium. Attendance is mandatory for registered students.',
        createdBy: cloudScale._id,
      }
    ];

    await Announcement.insertMany(announcementsData);
    console.log('Seeded 4 Placement Notices.');

    console.log('SUCCESS: Database populated with realistic email and password dataset!');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR during seeding:', error);
    process.exit(1);
  }
};

seed();
