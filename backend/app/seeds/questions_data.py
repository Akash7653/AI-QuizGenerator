"""
Sample question bank for local quiz generation.
This provides fallback questions when Gemini API is unavailable.
"""

SAMPLE_QUESTIONS = {
    "Java": [
        {
            "question_text": "Which of the following is not a Java keyword?",
            "question_type": "mcq",
            "options": ["interface", "super", "then", "extends"],
            "correct_answer": "then",
            "explanation": "'then' is not a Java keyword. interface, super, and extends are valid Java keywords.",
            "difficulty": "easy",
            "topic": "Java",
            "subtopic": "Java Basics"
        },
        {
            "question_text": "What is the default value of an int variable in Java?",
            "question_type": "mcq",
            "options": ["0", "null", "undefined", "-1"],
            "correct_answer": "0",
            "explanation": "The default value of an int variable in Java is 0.",
            "difficulty": "easy",
            "topic": "Java",
            "subtopic": "Java Basics"
        },
        {
            "question_text": "Which method is used to start a thread in Java?",
            "question_type": "mcq",
            "options": ["run()", "start()", "init()", "begin()"],
            "correct_answer": "start()",
            "explanation": "The start() method is used to start a thread in Java. The run() method contains the code to be executed.",
            "difficulty": "medium",
            "topic": "Java",
            "subtopic": "Multithreading"
        },
        {
            "question_text": "Java supports multiple inheritance through interfaces.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Java supports multiple inheritance through interfaces, but not through classes to avoid the diamond problem.",
            "difficulty": "medium",
            "topic": "Java",
            "subtopic": "OOP Concepts"
        }
    ],
    "Python": [
        {
            "question_text": "Which of the following is the correct way to create a list in Python?",
            "question_type": "mcq",
            "options": ["list = []", "list = ()", "list = {}", "list = <>"],
            "correct_answer": "list = []",
            "explanation": "Lists in Python are created using square brackets []. () creates tuples, {} creates dictionaries.",
            "difficulty": "easy",
            "topic": "Python",
            "subtopic": "Python Basics"
        },
        {
            "question_text": "What is the output of print(2 ** 3)?",
            "question_type": "mcq",
            "options": ["6", "8", "9", "5"],
            "correct_answer": "8",
            "explanation": "The ** operator is used for exponentiation in Python. 2 ** 3 = 2^3 = 8.",
            "difficulty": "easy",
            "topic": "Python",
            "subtopic": "Python Basics"
        },
        {
            "question_text": "Which keyword is used to define a function in Python?",
            "question_type": "mcq",
            "options": ["function", "func", "def", "define"],
            "correct_answer": "def",
            "explanation": "The 'def' keyword is used to define a function in Python.",
            "difficulty": "easy",
            "topic": "Python",
            "subtopic": "Python Basics"
        },
        {
            "question_text": "Python is a statically typed language.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "Python is a dynamically typed language, meaning variable types are determined at runtime.",
            "difficulty": "easy",
            "topic": "Python",
            "subtopic": "Python Basics"
        }
    ],
    "Data Structures": [
        {
            "question_text": "Which data structure follows the LIFO principle?",
            "question_type": "mcq",
            "options": ["Queue", "Stack", "Array", "Linked List"],
            "correct_answer": "Stack",
            "explanation": "Stack follows the Last In First Out (LIFO) principle, where the last element added is the first one to be removed.",
            "difficulty": "easy",
            "topic": "Data Structures",
            "subtopic": "Stacks"
        },
        {
            "question_text": "What is the time complexity of binary search?",
            "question_type": "mcq",
            "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            "correct_answer": "O(log n)",
            "explanation": "Binary search has O(log n) time complexity as it divides the search space in half with each iteration.",
            "difficulty": "medium",
            "topic": "Algorithms",
            "subtopic": "Searching"
        },
        {
            "question_text": "A linked list allows random access to elements.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "Linked lists do not allow random access. Elements must be accessed sequentially from the head.",
            "difficulty": "easy",
            "topic": "Data Structures",
            "subtopic": "Linked Lists"
        }
    ],
    "DBMS": [
        {
            "question_text": "Which SQL clause is used to filter records?",
            "question_type": "mcq",
            "options": ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
            "correct_answer": "WHERE",
            "explanation": "The WHERE clause is used to filter records based on specified conditions.",
            "difficulty": "easy",
            "topic": "DBMS",
            "subtopic": "SQL Basics"
        },
        {
            "question_text": "What does ACID stand for in database transactions?",
            "question_type": "mcq",
            "options": ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Consistency, Integrity, Durability", "Atomicity, Consistency, Isolation, Dependency", "Atomicity, Complexity, Isolation, Durability"],
            "correct_answer": "Atomicity, Consistency, Isolation, Durability",
            "explanation": "ACID stands for Atomicity, Consistency, Isolation, and Durability - the key properties of database transactions.",
            "difficulty": "medium",
            "topic": "DBMS",
            "subtopic": "Transactions"
        },
        {
            "question_text": "Normalization reduces data redundancy.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Normalization is the process of organizing data to reduce redundancy and improve data integrity.",
            "difficulty": "easy",
            "topic": "DBMS",
            "subtopic": "Normalization"
        }
    ],
    "Operating Systems": [
        {
            "question_text": "Which scheduling algorithm gives the minimum average waiting time?",
            "question_type": "mcq",
            "options": ["FCFS", "SJF", "Round Robin", "Priority"],
            "correct_answer": "SJF",
            "explanation": "Shortest Job First (SJF) scheduling gives the minimum average waiting time among all scheduling algorithms.",
            "difficulty": "medium",
            "topic": "Operating Systems",
            "subtopic": "Scheduling"
        },
        {
            "question_text": "Deadlock can occur in a system with four necessary conditions.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Deadlock requires four conditions: mutual exclusion, hold and wait, no preemption, and circular wait.",
            "difficulty": "medium",
            "topic": "Operating Systems",
            "subtopic": "Deadlocks"
        }
    ],
    "Computer Networks": [
        {
            "question_text": "Which protocol is used for secure web browsing?",
            "question_type": "mcq",
            "options": ["HTTP", "HTTPS", "FTP", "SMTP"],
            "correct_answer": "HTTPS",
            "explanation": "HTTPS (HTTP Secure) is used for secure web browsing, encrypting the communication between browser and server.",
            "difficulty": "easy",
            "topic": "Computer Networks",
            "subtopic": "HTTP/HTTPS"
        },
        {
            "question_text": "IP address 192.168.1.1 belongs to which class?",
            "question_type": "mcq",
            "options": ["Class A", "Class B", "Class C", "Class D"],
            "correct_answer": "Class C",
            "explanation": "IP addresses starting with 192-223 belong to Class C, which is commonly used for small networks.",
            "difficulty": "medium",
            "topic": "Computer Networks",
            "subtopic": "Network Protocols"
        },
        {
            "question_text": "OSI model has 7 layers.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "The OSI (Open Systems Interconnection) model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.",
            "difficulty": "easy",
            "topic": "Computer Networks",
            "subtopic": "OSI Model"
        }
    ],
    "Quantitative Aptitude": [
        {
            "question_text": "If a shirt costs $120 after a 20% discount, what was the original price?",
            "question_type": "mcq",
            "options": ["$150", "$144", "$140", "$160"],
            "correct_answer": "$150",
            "explanation": "Let original price = x. After 20% discount: x - 0.2x = 0.8x = 120. So x = 120/0.8 = $150.",
            "difficulty": "medium",
            "topic": "Quantitative Aptitude",
            "subtopic": "Percentages"
        },
        {
            "question_text": "What is 15% of 200?",
            "question_type": "mcq",
            "options": ["25", "30", "35", "40"],
            "correct_answer": "30",
            "explanation": "15% of 200 = (15/100) × 200 = 15 × 2 = 30.",
            "difficulty": "easy",
            "topic": "Quantitative Aptitude",
            "subtopic": "Percentages"
        },
        {
            "question_text": "If 5 workers can complete a task in 10 days, how many days will 10 workers need?",
            "question_type": "mcq",
            "options": ["5 days", "8 days", "10 days", "20 days"],
            "correct_answer": "5 days",
            "explanation": "This is an inverse proportion problem. More workers = less time. 10 workers is double 5 workers, so time is halved: 10/2 = 5 days.",
            "difficulty": "medium",
            "topic": "Quantitative Aptitude",
            "subtopic": "Time & Work"
        }
    ],
    "Logical Reasoning": [
        {
            "question_text": "If 'APPLE' is coded as '50', then 'MANGO' is coded as?",
            "question_type": "mcq",
            "options": ["50", "55", "60", "65"],
            "correct_answer": "55",
            "explanation": "APPLE: A(1) + P(16) + P(16) + L(12) + E(5) = 50. MANGO: M(13) + A(1) + N(14) + G(7) + O(15) = 50.",
            "difficulty": "medium",
            "topic": "Logical Reasoning",
            "subtopic": "Series Completion"
        },
        {
            "question_text": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            "question_type": "mcq",
            "options": ["40", "42", "44", "46"],
            "correct_answer": "42",
            "explanation": "The pattern is +4, +6, +8, +10, +12. So 30 + 12 = 42.",
            "difficulty": "easy",
            "topic": "Logical Reasoning",
            "subtopic": "Series Completion"
        }
    ],
    "Cognizant Aptitude": [
        {
            "question_text": "A train 200m long running at 60 km/hr crosses another train 300m long running in opposite direction at 40 km/hr. Time taken to cross is?",
            "question_type": "mcq",
            "options": ["18 seconds", "20 seconds", "22 seconds", "24 seconds"],
            "correct_answer": "18 seconds",
            "explanation": "Relative speed = 60 + 40 = 100 km/hr = 100 × (5/18) m/s. Total distance = 200 + 300 = 500m. Time = 500/(100 × 5/18) = 18 seconds.",
            "difficulty": "hard",
            "topic": "Cognizant Aptitude",
            "subtopic": "Time Speed Distance"
        },
        {
            "question_text": "If A:B = 2:3 and B:C = 4:5, then A:C is?",
            "question_type": "mcq",
            "options": ["2:5", "8:15", "4:5", "3:5"],
            "correct_answer": "8:15",
            "explanation": "A:B = 2:3 = 8:12, B:C = 4:5 = 12:15. So A:B:C = 8:12:15, thus A:C = 8:15.",
            "difficulty": "medium",
            "topic": "Cognizant Aptitude",
            "subtopic": "Ratios"
        }
    ],
    "General Knowledge": [
        {
            "question_text": "What is the capital of Australia?",
            "question_type": "mcq",
            "options": ["Sydney", "Melbourne", "Canberra", "Perth"],
            "correct_answer": "Canberra",
            "explanation": "Canberra is the capital of Australia, not Sydney (which is the largest city) or Melbourne.",
            "difficulty": "easy",
            "topic": "General Knowledge",
            "subtopic": "World Geography"
        },
        {
            "question_text": "Who wrote 'Romeo and Juliet'?",
            "question_type": "mcq",
            "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
            "correct_answer": "William Shakespeare",
            "explanation": "William Shakespeare wrote the famous tragedy 'Romeo and Juliet' around 1595.",
            "difficulty": "easy",
            "topic": "General Knowledge",
            "subtopic": "World History"
        }
    ]
}

# Get questions for a specific topic
def get_questions_for_topic(topic_name, count=5):
    """Get sample questions for a specific topic."""
    questions = SAMPLE_QUESTIONS.get(topic_name, [])
    if not questions:
        # Return generic questions if topic not found
        return SAMPLE_QUESTIONS.get("General Knowledge", [])[:count]
    return questions[:count]

# Get all available topics
def get_available_topics():
    """Get list of topics with available questions."""
    return list(SAMPLE_QUESTIONS.keys())