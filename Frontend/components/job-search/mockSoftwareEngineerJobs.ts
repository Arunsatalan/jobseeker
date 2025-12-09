import { Job } from './types'

// Mock data for 15 Software Engineer jobs
export const MOCK_SOFTWARE_ENGINEER_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Shopify',
    companyLogo: '/logos/shopify.png',
    location: 'Toronto, ON',
    postedTime: '2 days ago',
    jobType: 'Full-time',
    salary: '$120,000 - $160,000',
    description: `We are looking for a Senior Software Engineer to join our dynamic team. You'll work on cutting-edge projects using modern technologies including React, Node.js, and GraphQL.

Key responsibilities include:
- Developing scalable web applications
- Mentoring junior developers
- Participating in technical architecture decisions
- Collaborating with cross-functional teams

This is an excellent opportunity for someone who wants to make a significant impact in a fast-growing company.`,
    requirements: [
      '5+ years of software development experience',
      'Strong proficiency in JavaScript and TypeScript',
      'Experience with React and Node.js',
      'Knowledge of database systems (PostgreSQL, MongoDB)',
      'Experience with cloud platforms (AWS, GCP)',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ],
    benefits: [
      'Comprehensive health insurance',
      'Flexible work arrangements',
      'Professional development budget',
      'Stock options',
      'Unlimited PTO',
      'Modern office workspace'
    ],
    badges: ['Remote', 'Visa Support', 'Hot'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 92,
    isBookmarked: false,
    applicationInstructions: 'Click Apply Now to submit your application through our careers portal. Please include your resume and a brief cover letter explaining your interest in this role.'
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'RBC',
    location: 'Vancouver, BC',
    postedTime: '1 day ago',
    jobType: 'Full-time',
    salary: '$100,000 - $130,000',
    description: `Join our technology team as a Full Stack Developer where you'll build innovative financial applications. You'll work with modern web technologies and contribute to products that serve millions of customers.

In this role, you will:
- Develop responsive web applications using React and Node.js
- Design and implement RESTful APIs
- Work with cloud infrastructure (AWS/Azure)
- Collaborate with UX/UI designers and product managers

We're looking for someone passionate about creating exceptional user experiences in the fintech space.`,
    requirements: [
      '3+ years of full-stack development experience',
      'Proficiency in React, Node.js, and modern JavaScript',
      'Experience with databases (SQL and NoSQL)',
      'Knowledge of cloud platforms (AWS, Azure, or GCP)',
      'Understanding of RESTful API design',
      'Experience with version control (Git)',
      'Strong problem-solving abilities'
    ],
    benefits: [
      'Competitive salary and bonuses',
      'Health and dental coverage',
      'Retirement savings plan',
      'Professional development opportunities',
      'Flexible hybrid work model'
    ],
    badges: ['Hybrid', 'Visa Support'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: true,
    isBookmarked: true,
    applicationInstructions: 'Apply directly through our website. We review applications on a rolling basis and will contact qualified candidates within 2 weeks.'
  },
  {
    id: '3',
    title: 'Junior Software Engineer',
    company: 'Wealthsimple',
    location: 'Montreal, QC',
    postedTime: '3 days ago',
    jobType: 'Full-time',
    salary: '$65,000 - $85,000',
    description: `We're seeking a talented Junior Software Engineer to join our engineering team. This is a perfect opportunity for someone with 1-2 years of experience to grow their career in fintech.

You'll be responsible for:
- Writing clean, maintainable code
- Participating in code reviews and team discussions
- Learning new technologies and frameworks
- Contributing to our microservices architecture

This role offers mentorship from senior engineers and exposure to complex financial systems.`,
    requirements: [
      '1-2 years of software development experience',
      'Knowledge of at least one programming language (JavaScript, Python, Java, etc.)',
      'Understanding of web development fundamentals',
      'Familiarity with version control (Git)',
      'Strong willingness to learn',
      'Good communication skills'
    ],
    benefits: [
      'Mentorship program',
      'Learning and development budget',
      'Health insurance',
      'Flexible work hours',
      'Modern development tools'
    ],
    badges: ['Entry-Level', 'Remote'],
    isRemote: true,
    hasVisaSupport: false,
    isEntryLevel: true,
    isNew: false,
    matchScore: 78,
    isBookmarked: false,
    applicationInstructions: 'Please submit your resume and a brief cover letter explaining your interest in software engineering.'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CIBC',
    location: 'Toronto, ON',
    postedTime: '4 days ago',
    jobType: 'Full-time',
    salary: '$110,000 - $140,000',
    description: `Join our DevOps team to build and maintain scalable infrastructure for our banking applications. You'll work with cutting-edge cloud technologies and automation tools.

Key responsibilities:
- Design and implement CI/CD pipelines
- Manage cloud infrastructure (AWS, Kubernetes)
- Automate deployment and monitoring processes
- Ensure system reliability and security
- Collaborate with development teams

We're looking for someone passionate about infrastructure as code and automation.`,
    requirements: [
      '4+ years of DevOps or infrastructure experience',
      'Strong experience with AWS or Azure',
      'Proficiency in infrastructure as code (Terraform, CloudFormation)',
      'Experience with containerization (Docker, Kubernetes)',
      'Knowledge of CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
      'Scripting skills (Python, Bash)',
      'Understanding of monitoring and logging tools'
    ],
    benefits: [
      'Competitive compensation package',
      'Comprehensive benefits',
      'Professional development opportunities',
      'Flexible work arrangements',
      'Pension plan'
    ],
    badges: ['Hybrid', 'Security Clearance'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 85,
    isBookmarked: false,
    applicationInstructions: 'Apply through our careers portal with your resume and relevant certifications.'
  },
  {
    id: '5',
    title: 'Frontend Developer',
    company: 'Lululemon',
    location: 'Vancouver, BC',
    postedTime: '1 week ago',
    jobType: 'Full-time',
    salary: '$90,000 - $120,000',
    description: `Create exceptional user experiences for our e-commerce platform. You'll work with modern frontend technologies to build responsive, accessible web applications.

What you'll do:
- Develop responsive web applications using React
- Implement pixel-perfect designs
- Optimize for performance and accessibility
- Collaborate with design and backend teams
- Participate in code reviews and technical discussions

Join us in creating digital experiences that inspire and empower our community.`,
    requirements: [
      '3+ years of frontend development experience',
      'Expert knowledge of React and modern JavaScript',
      'Experience with CSS-in-JS or styled-components',
      'Understanding of web performance optimization',
      'Knowledge of accessibility standards (WCAG)',
      'Experience with testing frameworks',
      'Strong attention to detail'
    ],
    benefits: [
      'Competitive salary',
      'Employee discount on products',
      'Health and wellness benefits',
      'Flexible work options',
      'Professional development support'
    ],
    badges: ['Remote', 'Wellness'],
    isRemote: true,
    hasVisaSupport: false,
    isEntryLevel: false,
    isNew: false,
    matchScore: 88,
    isBookmarked: false,
    applicationInstructions: 'Submit your portfolio along with your resume showcasing your frontend work.'
  },
  {
    id: '6',
    title: 'Backend Engineer',
    company: 'Square',
    location: 'Toronto, ON',
    postedTime: '5 days ago',
    jobType: 'Full-time',
    salary: '$115,000 - $145,000',
    description: `Build scalable backend services for our payment processing platform. You'll work with microservices architecture and modern backend technologies.

Responsibilities include:
- Design and implement RESTful APIs
- Work with distributed systems and databases
- Ensure system scalability and reliability
- Participate in system architecture decisions
- Mentor junior engineers

We're looking for someone who loves solving complex technical challenges.`,
    requirements: [
      '4+ years of backend development experience',
      'Strong proficiency in Java, Python, or Go',
      'Experience with microservices architecture',
      'Knowledge of databases (PostgreSQL, Redis, Elasticsearch)',
      'Understanding of distributed systems',
      'Experience with message queues (Kafka, RabbitMQ)',
      'Strong problem-solving skills'
    ],
    benefits: [
      'Competitive salary and equity',
      'Comprehensive health benefits',
      'Flexible work arrangements',
      'Professional development budget',
      'Modern office spaces'
    ],
    badges: ['Remote', 'Equity'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 90,
    isBookmarked: false,
    applicationInstructions: 'Apply through our careers page with your resume and GitHub profile.'
  },
  {
    id: '7',
    title: 'Software Engineering Intern',
    company: 'Microsoft',
    location: 'Vancouver, BC',
    postedTime: '2 weeks ago',
    jobType: 'Internship',
    salary: '$25 - $35/hour',
    description: `Join Microsoft's internship program and work on real projects that impact millions of users. This is a 12-month internship with potential for full-time conversion.

What you'll do:
- Work on Azure cloud services or Office 365 products
- Collaborate with experienced engineers
- Learn Microsoft's development practices
- Participate in intern development programs
- Present your work to senior leadership

This is an incredible opportunity to launch your career at a technology leader.`,
    requirements: [
      'Currently pursuing Computer Science or related degree',
      'Strong programming skills in at least one language',
      'Knowledge of data structures and algorithms',
      'Experience with web development preferred',
      'Good academic standing',
      'Strong communication skills'
    ],
    benefits: [
      'Competitive hourly pay',
      'Housing stipend (if eligible)',
      'Learning and development opportunities',
      'Mentorship from senior engineers',
      'Potential for full-time offer'
    ],
    badges: ['Internship', 'Housing Stipend'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: true,
    isNew: false,
    matchScore: 95,
    isBookmarked: false,
    applicationInstructions: 'Apply through Microsoft Careers with your resume and academic transcript.'
  },
  {
    id: '8',
    title: 'Mobile App Developer',
    company: 'Rogers Communications',
    location: 'Toronto, ON',
    postedTime: '6 days ago',
    jobType: 'Full-time',
    salary: '$95,000 - $125,000',
    description: `Develop innovative mobile applications for our telecommunications services. You'll work with React Native and native iOS/Android development.

Key responsibilities:
- Build cross-platform mobile applications
- Implement new features and maintain existing apps
- Collaborate with product and design teams
- Optimize app performance and user experience
- Work with backend APIs and services

Join us in creating mobile experiences that connect Canadians.`,
    requirements: [
      '3+ years of mobile development experience',
      'Strong experience with React Native',
      'Knowledge of iOS/Android native development',
      'Experience with mobile app stores and deployment',
      'Understanding of mobile UI/UX principles',
      'Knowledge of RESTful APIs',
      'Experience with version control'
    ],
    benefits: [
      'Competitive salary',
      'Comprehensive benefits package',
      'Mobile phone allowance',
      'Professional development',
      'Flexible work options'
    ],
    badges: ['Mobile', 'Hybrid'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 82,
    isBookmarked: false,
    applicationInstructions: 'Submit your resume and links to your app store profiles.'
  },
  {
    id: '9',
    title: 'Data Engineer',
    company: 'Air Canada',
    location: 'Montreal, QC',
    postedTime: '1 week ago',
    jobType: 'Full-time',
    salary: '$105,000 - $135,000',
    description: `Build data pipelines and infrastructure to support our analytics and machine learning initiatives. You'll work with big data technologies in the aviation industry.

What you'll do:
- Design and implement data pipelines
- Work with cloud data platforms (AWS, GCP)
- Build ETL processes for large datasets
- Collaborate with data scientists and analysts
- Ensure data quality and reliability
- Optimize data storage and processing

Help us transform how we use data to improve customer experiences.`,
    requirements: [
      '4+ years of data engineering experience',
      'Strong experience with Python or Java',
      'Knowledge of big data tools (Spark, Hadoop)',
      'Experience with cloud data platforms',
      'SQL and database knowledge',
      'Understanding of data modeling',
      'Experience with ETL processes'
    ],
    benefits: [
      'Competitive salary',
      'Travel benefits',
      'Health and dental coverage',
      'Retirement savings plan',
      'Professional development'
    ],
    badges: ['Travel Benefits', 'Hybrid'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 87,
    isBookmarked: false,
    applicationInstructions: 'Apply through our careers portal with your resume and relevant experience.'
  },
  {
    id: '10',
    title: 'Security Engineer',
    company: 'TD Bank',
    location: 'Toronto, ON',
    postedTime: '3 days ago',
    jobType: 'Full-time',
    salary: '$125,000 - $155,000',
    description: `Protect our financial systems and customer data as a Security Engineer. You'll work on cutting-edge security technologies and threat detection.

Responsibilities include:
- Implement security controls and monitoring
- Conduct security assessments and penetration testing
- Develop incident response procedures
- Work with cloud security platforms
- Collaborate with development teams on secure coding
- Stay current with security threats and trends

Play a critical role in keeping our banking systems secure.`,
    requirements: [
      '5+ years of security engineering experience',
      'Knowledge of security frameworks and standards',
      'Experience with security tools and technologies',
      'Understanding of cloud security (AWS, Azure)',
      'Programming skills (Python, Go)',
      'Knowledge of networking and systems',
      'Security certifications preferred'
    ],
    benefits: [
      'Competitive compensation',
      'Comprehensive benefits',
      'Security clearance support',
      'Professional development',
      'Flexible work arrangements'
    ],
    badges: ['Security Clearance', 'Hybrid'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 89,
    isBookmarked: false,
    applicationInstructions: 'Apply through our careers site. Security clearance may be required.'
  },
  {
    id: '11',
    title: 'QA Automation Engineer',
    company: 'Intuit',
    location: 'Vancouver, BC',
    postedTime: '4 days ago',
    jobType: 'Full-time',
    salary: '$95,000 - $125,000',
    description: `Build automated testing frameworks for our financial software products. You'll ensure quality and reliability across our entire product suite.

What you'll do:
- Develop and maintain automated test suites
- Implement CI/CD testing pipelines
- Work with Selenium, Appium, and other testing tools
- Collaborate with development teams
- Create test strategies and plans
- Analyze test results and improve coverage

Help us deliver high-quality software to millions of customers.`,
    requirements: [
      '3+ years of QA automation experience',
      'Strong programming skills (Java, Python, JavaScript)',
      'Experience with testing frameworks',
      'Knowledge of CI/CD tools',
      'Understanding of software testing principles',
      'Experience with API testing',
      'Strong analytical skills'
    ],
    benefits: [
      'Competitive salary',
      'Stock options',
      'Health benefits',
      'Flexible work options',
      'Professional development'
    ],
    badges: ['Remote', 'Equity'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 83,
    isBookmarked: false,
    applicationInstructions: 'Submit your resume and examples of your automation work.'
  },
  {
    id: '12',
    title: 'Machine Learning Engineer',
    company: 'Uber',
    location: 'Toronto, ON',
    postedTime: '1 week ago',
    jobType: 'Full-time',
    salary: '$140,000 - $180,000',
    description: `Build machine learning models that power our ride-sharing and delivery platforms. You'll work with massive datasets and cutting-edge ML technologies.

Key responsibilities:
- Develop and deploy ML models at scale
- Work with distributed computing frameworks
- Collaborate with data scientists and engineers
- Optimize model performance and accuracy
- Build ML infrastructure and tools
- Research new ML techniques and applications

Shape the future of transportation and logistics with AI.`,
    requirements: [
      '4+ years of ML engineering experience',
      'Strong Python programming skills',
      'Experience with ML frameworks (TensorFlow, PyTorch)',
      'Knowledge of distributed systems',
      'Understanding of statistics and algorithms',
      'Experience with big data tools',
      'PhD in ML/AI preferred'
    ],
    benefits: [
      'Competitive salary and equity',
      'Comprehensive benefits',
      'Flexible work arrangements',
      'Research budget',
      'Conference attendance'
    ],
    badges: ['Remote', 'Equity', 'Research'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 94,
    isBookmarked: false,
    applicationInstructions: 'Apply with your resume, GitHub profile, and ML project examples.'
  },
  {
    id: '13',
    title: 'Site Reliability Engineer',
    company: 'Netflix',
    location: 'Vancouver, BC',
    postedTime: '5 days ago',
    jobType: 'Full-time',
    salary: '$130,000 - $170,000',
    description: `Ensure the reliability and scalability of our streaming platform. You'll work on systems that serve hundreds of millions of users worldwide.

What you'll do:
- Design and implement reliable systems
- Build monitoring and alerting systems
- Automate operational processes
- Participate in incident response
- Work with microservices and cloud infrastructure
- Collaborate with development teams

Help us maintain 99.99% uptime for our global user base.`,
    requirements: [
      '4+ years of SRE or DevOps experience',
      'Strong programming skills',
      'Experience with cloud platforms (AWS, GCP)',
      'Knowledge of monitoring tools (Prometheus, Grafana)',
      'Understanding of distributed systems',
      'Experience with incident management',
      'Strong problem-solving abilities'
    ],
    benefits: [
      'Competitive salary and equity',
      'Comprehensive benefits',
      'Flexible work arrangements',
      'Professional development',
      'Global travel opportunities'
    ],
    badges: ['Remote', 'Equity'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 91,
    isBookmarked: false,
    applicationInstructions: 'Apply through our careers page with your resume and relevant experience.'
  },
  {
    id: '14',
    title: 'Blockchain Developer',
    company: 'Coinbase',
    location: 'Toronto, ON',
    postedTime: '2 weeks ago',
    jobType: 'Full-time',
    salary: '$120,000 - $160,000',
    description: `Build the future of finance with blockchain technology. You'll work on cryptocurrency exchange platforms and decentralized applications.

Responsibilities include:
- Develop smart contracts and dApps
- Work with blockchain protocols (Ethereum, Bitcoin)
- Build secure cryptocurrency systems
- Collaborate with security and compliance teams
- Optimize blockchain performance
- Research new blockchain technologies

Join us in shaping the future of digital finance.`,
    requirements: [
      '3+ years of blockchain development experience',
      'Strong Solidity programming skills',
      'Experience with Ethereum development',
      'Knowledge of cryptography and security',
      'Understanding of DeFi protocols',
      'Experience with web3 libraries',
      'Strong understanding of blockchain concepts'
    ],
    benefits: [
      'Competitive salary and crypto bonuses',
      'Comprehensive benefits',
      'Flexible work arrangements',
      'Professional development',
      'Crypto industry exposure'
    ],
    badges: ['Remote', 'Crypto', 'Equity'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 93,
    isBookmarked: false,
    applicationInstructions: 'Apply with your resume and blockchain project portfolio.'
  },
  {
    id: '15',
    title: 'Technical Lead',
    company: 'Atlassian',
    location: 'Montreal, QC',
    postedTime: '6 days ago',
    jobType: 'Full-time',
    salary: '$150,000 - $190,000',
    description: `Lead a team of software engineers in building collaboration tools used by millions. You'll mentor developers and drive technical excellence.

What you'll do:
- Lead and mentor a team of engineers
- Architect scalable software solutions
- Drive technical decisions and best practices
- Collaborate with product and design teams
- Participate in hiring and team growth
- Represent engineering in cross-functional initiatives

Shape the technical direction of products that transform how teams work.`,
    requirements: [
      '7+ years of software development experience',
      '3+ years of technical leadership experience',
      'Strong technical skills across the stack',
      'Experience with agile development',
      'Excellent communication and leadership skills',
      'Track record of mentoring and team development',
      'Experience with scaling engineering teams'
    ],
    benefits: [
      'Competitive salary and equity',
      'Comprehensive benefits',
      'Flexible work arrangements',
      'Professional development budget',
      'Conference and training support'
    ],
    badges: ['Leadership', 'Remote', 'Equity'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 96,
    isBookmarked: false,
    applicationInstructions: 'Apply with your resume and leadership experience examples.'
  }
]