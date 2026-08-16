"""
Topic categories and subtopics for the quiz system.
This provides a comprehensive categorization system for educational content.
"""

TOPIC_CATEGORIES = {
    "Technology": {
        "description": "Programming, development, and technical topics",
        "icon": "💻",
        "topics": [
            {
                "name": "Java",
                "description": "Java programming language, OOP concepts, and frameworks",
                "subtopics": ["Java Basics", "OOP Concepts", "Collections", "Multithreading", "Exception Handling", "Streams", "Java 8+ Features"]
            },
            {
                "name": "Python",
                "description": "Python programming, data structures, and libraries",
                "subtopics": ["Python Basics", "Data Structures", "OOP", "File Handling", "Decorators", "Python Libraries", "Advanced Python"]
            },
            {
                "name": "C",
                "description": "C programming language fundamentals and memory management",
                "subtopics": ["C Basics", "Pointers", "Arrays", "Functions", "Memory Management", "Preprocessor", "File I/O"]
            },
            {
                "name": "C++",
                "description": "C++ programming with STL and advanced features",
                "subtopics": ["C++ Basics", "OOP in C++", "STL", "Templates", "Memory Management", "Exception Handling", "Modern C++"]
            },
            {
                "name": "JavaScript",
                "description": "JavaScript programming for web development",
                "subtopics": ["JS Basics", "DOM Manipulation", "ES6+", "Async Programming", "Closures", "Promises", "Node.js Basics"]
            },
            {
                "name": "TypeScript",
                "description": "TypeScript for type-safe JavaScript development",
                "subtopics": ["TypeScript Basics", "Types", "Interfaces", "Generics", "Decorators", "Advanced Types", "Configuration"]
            },
            {
                "name": "Data Structures",
                "description": "Fundamental data structures and algorithms",
                "subtopics": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Hash Tables"]
            },
            {
                "name": "Algorithms",
                "description": "Algorithm design and analysis",
                "subtopics": ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms", "Recursion", "Divide & Conquer", "Graph Algorithms"]
            },
            {
                "name": "Object-Oriented Programming",
                "description": "OOP principles and design patterns",
                "subtopics": ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Design Patterns", "SOLID Principles", "UML"]
            },
            {
                "name": "DBMS",
                "description": "Database management systems and SQL",
                "subtopics": ["Normalization", "SQL Basics", "Advanced SQL", "Transactions", "Indexing", "Database Design", "NoSQL Basics"]
            },
            {
                "name": "SQL",
                "description": "Structured Query Language and database queries",
                "subtopics": ["SELECT Queries", "JOIN Operations", "Aggregation", "Subqueries", "Window Functions", "Stored Procedures", "Database Administration"]
            },
            {
                "name": "Operating Systems",
                "description": "OS concepts, processes, and memory management",
                "subtopics": ["Process Management", "Memory Management", "File Systems", "I/O Management", "Deadlocks", "Scheduling", "Security"]
            },
            {
                "name": "Computer Networks",
                "description": "Networking protocols and architectures",
                "subtopics": ["OSI Model", "TCP/IP", "HTTP/HTTPS", "Network Security", "Routing", "DNS", "Network Protocols"]
            },
            {
                "name": "Software Engineering",
                "description": "Software development methodologies and practices",
                "subtopics": ["SDLC", "Agile", "Scrum", "Testing", "Version Control", "CI/CD", "Code Review"]
            },
            {
                "name": "Software Testing",
                "description": "Testing methodologies and quality assurance",
                "subtopics": ["Unit Testing", "Integration Testing", "System Testing", "Test Automation", "Performance Testing", "Security Testing", "TDD"]
            },
            {
                "name": "Web Development",
                "description": "Full-stack web development technologies",
                "subtopics": ["HTML/CSS", "JavaScript", "Frontend Frameworks", "Backend Development", "APIs", "Web Security", "Performance"]
            },
            {
                "name": "HTML",
                "description": "HTML markup and web structure",
                "subtopics": ["HTML Basics", "Forms", "Semantic HTML", "HTML5 Features", "Accessibility", "SEO Basics", "Meta Tags"]
            },
            {
                "name": "CSS",
                "description": "CSS styling and responsive design",
                "subtopics": ["CSS Basics", "Flexbox", "Grid", "Responsive Design", "Animations", "Preprocessors", "CSS Frameworks"]
            },
            {
                "name": "React",
                "description": "React.js library for building user interfaces",
                "subtopics": ["React Basics", "Components", "State Management", "Hooks", "Redux", "React Router", "Performance"]
            },
            {
                "name": "Node.js",
                "description": "Node.js runtime and server-side JavaScript",
                "subtopics": ["Node Basics", "Express.js", "REST APIs", "Middleware", "Authentication", "Database Integration", "Deployment"]
            },
            {
                "name": "Express.js",
                "description": "Express.js web framework for Node.js",
                "subtopics": ["Express Basics", "Routing", "Middleware", "Templates", "Error Handling", "Security", "API Design"]
            },
            {
                "name": "REST APIs",
                "description": "RESTful API design and implementation",
                "subtopics": ["REST Principles", "API Design", "HTTP Methods", "Authentication", "Documentation", "Testing", "Versioning"]
            },
            {
                "name": "Git & GitHub",
                "description": "Version control with Git and collaboration",
                "subtopics": ["Git Basics", "Branching", "Merging", "GitHub Features", "Collaboration", "CI/CD", "Git Workflow"]
            },
            {
                "name": "Cloud Computing",
                "description": "Cloud services and deployment strategies",
                "subtopics": ["Cloud Basics", "AWS", "Azure", "GCP", "Serverless", "Containers", "Cloud Security"]
            },
            {
                "name": "DevOps",
                "description": "Development operations and infrastructure",
                "subtopics": ["CI/CD", "Docker", "Kubernetes", "Infrastructure as Code", "Monitoring", "Configuration Management", "Automation"]
            },
            {
                "name": "Docker",
                "description": "Containerization with Docker",
                "subtopics": ["Docker Basics", "Dockerfile", "Docker Compose", "Networking", "Volumes", "Security", "Orchestration"]
            },
            {
                "name": "Kubernetes",
                "description": "Container orchestration with Kubernetes",
                "subtopics": ["K8s Basics", "Pods", "Services", "Deployments", "ConfigMaps", "Ingress", "Monitoring"]
            },
            {
                "name": "System Design",
                "description": "Large-scale system design and architecture",
                "subtopics": ["Scalability", "Load Balancing", "Caching", "Database Design", "Microservices", "Message Queues", "System Architecture"]
            },
            {
                "name": "Cybersecurity",
                "description": "Security principles and practices",
                "subtopics": ["Security Basics", "Encryption", "Network Security", "Web Security", "Authentication", "Security Testing", "Compliance"]
            },
            {
                "name": "Artificial Intelligence",
                "description": "AI concepts and machine learning fundamentals",
                "subtopics": ["AI Basics", "Machine Learning", "Neural Networks", "NLP", "Computer Vision", "AI Ethics", "AI Applications"]
            },
            {
                "name": "Machine Learning",
                "description": "ML algorithms and model training",
                "subtopics": ["ML Basics", "Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation", "Deep Learning", "ML Deployment"]
            },
            {
                "name": "Deep Learning",
                "description": "Neural networks and deep learning architectures",
                "subtopics": ["Neural Networks", "CNN", "RNN", "Transformers", "Transfer Learning", "Optimization", "Frameworks"]
            },
            {
                "name": "Generative AI",
                "description": "Generative AI models and applications",
                "subtopics": ["LLMs", "Image Generation", "Prompt Engineering", "Fine-tuning", "AI Safety", "Applications", "Ethics"]
            },
            {
                "name": "Natural Language Processing",
                "description": "NLP techniques and text processing",
                "subtopics": ["Text Processing", "Tokenization", "Sentiment Analysis", "Named Entity Recognition", "Text Classification", "Transformers", "NLP Applications"]
            },
            {
                "name": "Data Science",
                "description": "Data analysis and visualization",
                "subtopics": ["Data Analysis", "Visualization", "Statistics", "Data Cleaning", "Exploratory Analysis", "Feature Engineering", "Data Storytelling"]
            },
            {
                "name": "Big Data",
                "description": "Big data technologies and processing",
                "subtopics": ["Hadoop", "Spark", "Data Lakes", "Stream Processing", "NoSQL", "Data Warehousing", "Big Data Architecture"]
            },
            {
                "name": "Linux",
                "description": "Linux operating system and commands",
                "subtopics": ["Linux Basics", "File System", "Commands", "Shell Scripting", "Process Management", "Permissions", "System Administration"]
            },
            {
                "name": "Computer Architecture",
                "description": "Computer organization and architecture",
                "subtopics": ["CPU Architecture", "Memory Hierarchy", "Pipelining", "Instruction Sets", "Performance", "Parallel Processing", "Computer Organization"]
            },
            {
                "name": "Compiler Design",
                "description": "Compiler construction and optimization",
                "subtopics": ["Lexical Analysis", "Parsing", "Semantic Analysis", "Code Generation", "Optimization", "Runtime", "Compiler Architecture"]
            },
            {
                "name": "Distributed Systems",
                "description": "Distributed computing concepts",
                "subtopics": ["Distributed Computing", "Consensus", "Distributed Databases", "Message Passing", "Fault Tolerance", "Scalability", "Distributed Algorithms"]
            }
        ]
    },
    "Placement": {
        "description": "Placement preparation and aptitude topics",
        "icon": "🎯",
        "topics": [
            {
                "name": "Quantitative Aptitude",
                "description": "Mathematical aptitude for placements",
                "subtopics": ["Percentages", "Profit & Loss", "Time & Work", "Time Speed Distance", "Probability", "Permutations", "Combinations", "Number Systems", "Ratios", "Averages"]
            },
            {
                "name": "Logical Reasoning",
                "description": "Logical and analytical reasoning",
                "subtopics": ["Series Completion", "Analogy", "Classification", "Blood Relations", "Direction Sense", "Syllogisms", "Venn Diagrams", "Puzzles", "Logical Deduction"]
            },
            {
                "name": "Verbal Ability",
                "description": "English language and communication skills",
                "subtopics": ["Grammar", "Vocabulary", "Comprehension", "Sentence Correction", "Synonyms", "Antonyms", "Idioms", "Para Jumbles"]
            },
            {
                "name": "Numerical Ability",
                "description": "Numerical problem-solving skills",
                "subtopics": ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics", "Data Interpretation", "Word Problems"]
            },
            {
                "name": "Data Interpretation",
                "description": "Interpreting and analyzing data",
                "subtopics": ["Tables", "Charts", "Graphs", "Caselets", "Data Sufficiency", "Pie Charts", "Line Graphs"]
            },
            {
                "name": "Analytical Reasoning",
                "description": "Analytical and critical thinking",
                "subtopics": ["Critical Reasoning", "Decision Making", "Problem Solving", "Pattern Recognition", "Logical Puzzles", "Seating Arrangement", "Scheduling"]
            },
            {
                "name": "Coding Fundamentals",
                "description": "Basic programming concepts for interviews",
                "subtopics": ["Variables", "Loops", "Conditions", "Functions", "Arrays", "Strings", "Basic Algorithms"]
            },
            {
                "name": "Pseudocode",
                "description": "Understanding and writing pseudocode",
                "subtopics": ["Pseudocode Basics", "Flowcharts", "Algorithm Design", "Logic Building", "Problem Analysis", "Code Structure", "Optimization"]
            },
            {
                "name": "Technical Interview",
                "description": "Technical interview preparation",
                "subtopics": ["Data Structures", "Algorithms", "System Design", "Database Design", "OS Concepts", "Networking Basics", "Project Discussion"]
            },
            {
                "name": "HR Interview",
                "description": "HR interview preparation and soft skills",
                "subtopics": ["Introduction", "Strengths/Weaknesses", "Situational Questions", "Company Research", "Career Goals", "Teamwork", "Communication"]
            },
            {
                "name": "Campus Placement Preparation",
                "description": "Comprehensive campus placement preparation",
                "subtopics": ["Aptitude", "Technical", "Communication", "Group Discussion", "Resume Building", "Mock Interviews", "Time Management"]
            }
        ]
    },
    "Cognizant Placement": {
        "description": "Cognizant-specific placement preparation",
        "icon": "🏢",
        "topics": [
            {
                "name": "Cognizant Coding",
                "description": "Coding questions for Cognizant placements",
                "subtopics": ["Cognizant Coding Pattern", "Common Coding Questions", "String Manipulation", "Array Problems", "Matrix Operations", "Recursion", "Dynamic Programming"]
            },
            {
                "name": "Cognizant Aptitude",
                "description": "Aptitude questions for Cognizant",
                "subtopics": ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Pattern Recognition", "Series Completion", "Data Interpretation", "Problem Solving"]
            },
            {
                "name": "Cognizant Logical Reasoning",
                "description": "Logical reasoning for Cognizant",
                "subtopics": ["Analytical Reasoning", "Logical Puzzles", "Syllogisms", "Blood Relations", "Direction Sense", "Seating Arrangement", "Venn Diagrams"]
            },
            {
                "name": "Cognizant Verbal Ability",
                "description": "Verbal ability for Cognizant",
                "subtopics": ["Grammar", "Vocabulary", "Comprehension", "Sentence Correction", "Synonyms/Antonyms", "Idioms/Phrases", "Para Jumbles"]
            },
            {
                "name": "Cognizant Technical MCQs",
                "description": "Technical MCQs for Cognizant",
                "subtopics": ["Java MCQs", "Python MCQs", "C MCQs", "DBMS MCQs", "OS MCQs", "Network MCQs", "General CS MCQs"]
            },
            {
                "name": "Cognizant DBMS",
                "description": "DBMS questions for Cognizant",
                "subtopics": ["SQL Queries", "Normalization", "Transactions", "Indexing", "Database Design", "ER Models", "PL/SQL"]
            },
            {
                "name": "Cognizant OOP",
                "description": "OOP concepts for Cognizant",
                "subtopics": ["Classes & Objects", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Design Patterns", "SOLID Principles"]
            },
            {
                "name": "Cognizant OS",
                "description": "Operating Systems for Cognizant",
                "subtopics": ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Scheduling", "Synchronization", "OS Basics"]
            },
            {
                "name": "Cognizant Computer Networks",
                "description": "Network concepts for Cognizant",
                "subtopics": ["OSI Model", "TCP/IP", "HTTP/HTTPS", "Network Security", "Routing", "Protocols", "Network Basics"]
            },
            {
                "name": "Cognizant SQL",
                "description": "SQL specific questions for Cognizant",
                "subtopics": ["SELECT Queries", "JOIN Operations", "Aggregation", "Subqueries", "Window Functions", "Stored Procedures", "Database Administration"]
            },
            {
                "name": "Cognizant Programming",
                "description": "General programming for Cognizant",
                "subtopics": ["C Programming", "Java Programming", "Python Programming", "Problem Solving", "Algorithm Implementation", "Code Optimization", "Debugging"]
            },
            {
                "name": "Cognizant Pseudocode",
                "description": "Pseudocode questions for Cognizant",
                "subtopics": ["Pseudocode Analysis", "Flowchart Interpretation", "Logic Building", "Algorithm Design", "Pattern Recognition", "Code Tracing", "Output Prediction"]
            },
            {
                "name": "Cognizant Interview Preparation",
                "description": "Interview preparation for Cognizant",
                "subtopics": ["Technical Interview", "HR Interview", "Group Discussion", "Resume Preparation", "Company Research", "Mock Interviews", "Soft Skills"]
            }
        ]
    },
    "Business": {
        "description": "Business, management, and marketing topics",
        "icon": "📊",
        "topics": [
            {
                "name": "Business Fundamentals",
                "description": "Basic business concepts and principles",
                "subtopics": ["Business Models", "Business Strategy", "Market Analysis", "Competitive Analysis", "Business Planning", "Finance Basics", "Operations"]
            },
            {
                "name": "Entrepreneurship",
                "description": "Starting and managing businesses",
                "subtopics": ["Startup Basics", "Business Planning", "Funding", "Marketing", "Team Building", "Growth Strategy", "Exit Strategy"]
            },
            {
                "name": "Marketing",
                "description": "Marketing principles and strategies",
                "subtopics": ["Digital Marketing", "Content Marketing", "Social Media", "SEO", "Email Marketing", "Brand Strategy", "Market Research"]
            },
            {
                "name": "Digital Marketing",
                "description": "Online marketing techniques",
                "subtopics": ["SEO", "SEM", "Social Media Marketing", "Content Marketing", "Email Marketing", "Analytics", "Advertising"]
            },
            {
                "name": "Branding",
                "description": "Brand development and management",
                "subtopics": ["Brand Identity", "Brand Strategy", "Brand Positioning", "Brand Communication", "Brand Management", "Visual Identity", "Brand Equity"]
            },
            {
                "name": "Sales",
                "description": "Sales techniques and strategies",
                "subtopics": ["Sales Process", "Negotiation", "Closing Techniques", "Customer Relationship", "B2B Sales", "B2C Sales", "Sales Strategy"]
            },
            {
                "name": "Finance Fundamentals",
                "description": "Basic financial concepts",
                "subtopics": ["Financial Statements", "Budgeting", "Cash Flow", "Financial Analysis", "Investment Basics", "Risk Management", "Financial Planning"]
            },
            {
                "name": "Accounting Fundamentals",
                "description": "Basic accounting principles",
                "subtopics": ["Financial Accounting", "Managerial Accounting", "Cost Accounting", "Taxation", "Auditing", "Financial Reporting", "Accounting Standards"]
            },
            {
                "name": "Business Strategy",
                "description": "Strategic business planning",
                "subtopics": ["Strategic Planning", "Competitive Strategy", "Growth Strategy", "Market Strategy", "Innovation Strategy", "Business Transformation", "Strategic Management"]
            },
            {
                "name": "Economics",
                "description": "Economic principles and concepts",
                "subtopics": ["Microeconomics", "Macroeconomics", "Supply & Demand", "Market Structures", "Economic Policy", "International Economics", "Economic Indicators"]
            },
            {
                "name": "Management",
                "description": "Business management principles",
                "subtopics": ["Operations Management", "Project Management", "Team Management", "Leadership", "Organizational Behavior", "Change Management", "Strategic Management"]
            },
            {
                "name": "Human Resources",
                "description": "HR management and practices",
                "subtopics": ["Recruitment", "Training & Development", "Performance Management", "Compensation", "Employee Relations", "HR Strategy", "Organizational Development"]
            },
            {
                "name": "Project Management",
                "description": "Project management methodologies",
                "subtopics": ["Project Planning", "Agile", "Scrum", "Risk Management", "Resource Management", "Project Monitoring", "Project Closure"]
            },
            {
                "name": "Product Management",
                "description": "Product development and management",
                "subtopics": ["Product Strategy", "Product Development", "Market Research", "User Research", "Roadmap Planning", "Product Launch", "Product Analytics"]
            },
            {
                "name": "E-commerce",
                "description": "Electronic business and commerce",
                "subtopics": ["E-commerce Models", "Online Retail", "Payment Systems", "Logistics", "Customer Experience", "Digital Marketing", "E-commerce Technology"]
            },
            {
                "name": "Business Analytics",
                "description": "Data analytics for business",
                "subtopics": ["Data Analysis", "Business Intelligence", "Predictive Analytics", "Data Visualization", "KPIs", "Dashboarding", "Decision Making"]
            }
        ]
    },
    "Science": {
        "description": "Scientific and educational topics",
        "icon": "🔬",
        "topics": [
            {
                "name": "Physics",
                "description": "Physics concepts and principles",
                "subtopics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics", "Waves", "Fluid Dynamics"]
            },
            {
                "name": "Chemistry",
                "description": "Chemistry fundamentals and applications",
                "subtopics": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry", "Analytical Chemistry", "Chemical Bonding", "Periodic Table"]
            },
            {
                "name": "Biology",
                "description": "Biological sciences and life sciences",
                "subtopics": ["Cell Biology", "Genetics", "Ecology", "Evolution", "Human Biology", "Microbiology", "Biochemistry"]
            },
            {
                "name": "Space & Astronomy",
                "description": "Space science and astronomy",
                "subtopics": ["Solar System", "Stars & Galaxies", "Cosmology", "Space Exploration", "Astrophysics", "Planetary Science", "Space Technology"]
            },
            {
                "name": "Environment",
                "description": "Environmental science and sustainability",
                "subtopics": ["Climate Change", "Ecosystems", "Biodiversity", "Pollution", "Conservation", "Sustainability", "Environmental Policy"]
            }
        ]
    },
    "General Knowledge": {
        "description": "General knowledge and educational topics",
        "icon": "🌍",
        "topics": [
            {
                "name": "World History",
                "description": "Major world historical events and periods",
                "subtopics": ["Ancient History", "Medieval History", "Modern History", "World Wars", "Cold War", "Civilizations", "Historical Figures"]
            },
            {
                "name": "Indian History",
                "description": "Indian historical events and heritage",
                "subtopics": ["Ancient India", "Medieval India", "Modern India", "Freedom Movement", "Indian Empire", "Cultural Heritage", "Historical Monuments"]
            },
            {
                "name": "Geography",
                "description": "World geography and physical geography",
                "subtopics": ["Physical Geography", "Human Geography", "World Geography", "Maps & Cartography", "Climate", "Natural Resources", "Geographical Features"]
            },
            {
                "name": "World Geography",
                "description": "Global geographical knowledge",
                "subtopics": ["Continents", "Oceans", "Countries & Capitals", "Major Cities", "Landforms", "Climate Zones", "Natural Wonders"]
            },
            {
                "name": "Indian Polity",
                "description": "Indian political system and governance",
                "subtopics": ["Constitution", "Government Structure", "Political Parties", "Elections", "Judiciary", "Federalism", "Governance"]
            },
            {
                "name": "Economics",
                "description": "Economic concepts and policies",
                "subtopics": ["Microeconomics", "Macroeconomics", "Indian Economy", "Global Economy", "Economic Policies", "Financial Markets", "Trade & Commerce"]
            },
            {
                "name": "General Knowledge",
                "description": "Miscellaneous general knowledge topics",
                "subtopics": ["Current Affairs", "Books & Authors", "Awards & Honors", "Sports", "Art & Culture", "Science & Technology", "Important Dates"]
            }
        ]
    },
    "Medical": {
        "description": "Medical and health education topics",
        "icon": "⚕️",
        "topics": [
            {
                "name": "Human Anatomy",
                "description": "Human body structure and systems",
                "subtopics": ["Skeletal System", "Muscular System", "Nervous System", "Circulatory System", "Respiratory System", "Digestive System", "Endocrine System"]
            },
            {
                "name": "Physiology",
                "description": "Human body functions and processes",
                "subtopics": ["Cell Physiology", "System Physiology", "Neurophysiology", "Cardiovascular Physiology", "Respiratory Physiology", "Renal Physiology", "Gastrointestinal Physiology"]
            },
            {
                "name": "Basic Medicine",
                "description": "Fundamental medical concepts",
                "subtopics": ["Pathology", "Pharmacology Basics", "Microbiology", "Immunology", "Clinical Medicine", "Diagnostics", "Treatment Principles"]
            },
            {
                "name": "Pharmacology",
                "description": "Drug actions and medical treatments",
                "subtopics": ["Drug Classification", "Pharmacokinetics", "Pharmacodynamics", "Clinical Pharmacology", "Therapeutics", "Drug Interactions", "Side Effects"]
            },
            {
                "name": "Medical History",
                "description": "History of medicine and medical discoveries",
                "subtopics": ["Ancient Medicine", "Medical Revolution", "Modern Medicine", "Medical Discoveries", "Medical Pioneers", "Evolution of Treatment", "Medical Technology"]
            },
            {
                "name": "Public Health",
                "description": "Public health and community medicine",
                "subtopics": ["Epidemiology", "Health Promotion", "Disease Prevention", "Health Policy", "Global Health", "Environmental Health", "Health Education"]
            },
            {
                "name": "Nutrition",
                "description": "Nutrition science and dietary health",
                "subtopics": ["Macronutrients", "Micronutrients", "Dietary Guidelines", "Nutritional Disorders", "Clinical Nutrition", "Sports Nutrition", "Public Health Nutrition"]
            },
            {
                "name": "Genetics",
                "description": "Genetic principles and inheritance",
                "subtopics": ["Mendelian Genetics", "Molecular Genetics", "Population Genetics", "Medical Genetics", "Genetic Disorders", "Gene Therapy", "Genomics"]
            },
            {
                "name": "Microbiology",
                "description": "Microorganisms and their effects",
                "subtopics": ["Bacteriology", "Virology", "Mycology", "Parasitology", "Immunology", "Clinical Microbiology", "Antimicrobial Therapy"]
            },
            {
                "name": "First Aid Basics",
                "description": "Basic first aid and emergency response",
                "subtopics": ["CPR Basics", "Wound Care", "Burn Treatment", "Fracture Management", "Choking", "Allergic Reactions", "Emergency Response"]
            }
        ]
    }
}

# Flatten topics for easier access
ALL_TOPICS = []
for category_name, category_data in TOPIC_CATEGORIES.items():
    for topic in category_data["topics"]:
        ALL_TOPICS.append({
            "name": topic["name"],
            "category": category_name,
            "description": topic["description"],
            "subtopics": topic["subtopics"]
        })