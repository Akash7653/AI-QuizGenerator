import type { Difficulty, QuizConfig, QuizQuestion, QuestionType } from '@/types';

const TOPIC_SUGGESTIONS = [
  'Physics', 'Machine Learning', 'Python', 'Java', 'SQL', 'Mathematics',
  'Cloud Computing', 'Data Structures', 'Biology', 'Chemistry',
  'World History', 'Economics', 'JavaScript', 'Algorithms', 'Statistics',
  'Artificial Intelligence', 'Neural Networks', 'Operating Systems',
  'Computer Networks', 'Databases', 'Linear Algebra', 'Calculus',
  'Geography', 'Psychology', 'Philosophy',
];

export function getTopicSuggestions(): string[] {
  return TOPIC_SUGGESTIONS;
}

export function filterSuggestions(query: string): string[] {
  if (!query.trim()) return TOPIC_SUGGESTIONS.slice(0, 8);
  const q = query.toLowerCase();
  return TOPIC_SUGGESTIONS.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
}

// ---- Mock question banks per topic ----

const MCQ_TEMPLATES: Record<string, { q: string; options: string[]; answer: string; explanation: string }[]> = {
  'machine learning': [
    { q: 'Which algorithm is primarily used for classification tasks with labeled data?', options: ['K-Means', 'Linear Regression', 'Decision Tree', 'PCA'], answer: 'Decision Tree', explanation: 'Decision trees are supervised algorithms used for classification with labeled data.' },
    { q: 'What does the term "overfitting" mean in machine learning?', options: ['Model performs well on training but poorly on unseen data', 'Model is too simple', 'Training takes too long', 'Data has too many features'], answer: 'Model performs well on training but poorly on unseen data', explanation: 'Overfitting occurs when a model memorizes training data instead of generalizing.' },
    { q: 'Which metric is best for evaluating imbalanced classification?', options: ['Accuracy', 'F1-Score', 'Mean Squared Error', 'R²'], answer: 'F1-Score', explanation: 'F1-Score balances precision and recall, making it robust for imbalanced datasets.' },
    { q: 'What is gradient descent used for?', options: ['Data cleaning', 'Minimizing the loss function', 'Feature selection', 'Data augmentation'], answer: 'Minimizing the loss function', explanation: 'Gradient descent iteratively updates parameters to minimize the loss function.' },
    { q: 'Which type of learning uses unlabeled data?', options: ['Supervised', 'Unsupervised', 'Reinforcement', 'Semi-supervised'], answer: 'Unsupervised', explanation: 'Unsupervised learning finds patterns in data without labeled outputs.' },
    { q: 'What is the purpose of a validation set?', options: ['To train the model', 'To test final performance', 'To tune hyperparameters', 'To store data'], answer: 'To tune hyperparameters', explanation: 'The validation set is used to tune hyperparameters and prevent overfitting.' },
    { q: 'Which activation function outputs values between 0 and 1?', options: ['ReLU', 'Tanh', 'Sigmoid', 'Leaky ReLU'], answer: 'Sigmoid', explanation: 'The sigmoid function squashes values into the range (0, 1).' },
    { q: 'What does CNN stand for in deep learning?', options: ['Conditional Neural Network', 'Convolutional Neural Network', 'Cognitive Neural Network', 'Continuous Neural Network'], answer: 'Convolutional Neural Network', explanation: 'CNNs use convolutional layers and are widely used for image processing.' },
  ],
  'neural networks': [
    { q: 'What is a neuron\'s primary function in a neural network?', options: ['Store data', 'Apply weights and activation to inputs', 'Clean data', 'Display output'], answer: 'Apply weights and activation to inputs', explanation: 'A neuron computes a weighted sum of inputs and applies an activation function.' },
    { q: 'Which problem does the vanishing gradient affect?', options: ['Shallow networks', 'Deep networks', 'Single-layer networks', 'Linear models'], answer: 'Deep networks', explanation: 'Gradients shrink as they propagate back through many layers, hindencing learning.' },
    { q: 'What is backpropagation?', options: ['Forward pass only', 'Algorithm to compute gradients', 'Data preprocessing', 'A type of activation'], answer: 'Algorithm to compute gradients', explanation: 'Backpropagation computes gradients of the loss w.r.t. weights using the chain rule.' },
    { q: 'Which optimizer uses momentum and adaptive learning rates?', options: ['SGD', 'Adam', 'Batch GD', 'Newton'], answer: 'Adam', explanation: 'Adam combines momentum with per-parameter adaptive learning rates.' },
    { q: 'What does a dropout layer do?', options: ['Speeds up training', 'Randomly disables neurons during training to prevent overfitting', 'Adds noise to input', 'Increases learning rate'], answer: 'Randomly disables neurons during training to prevent overfitting', explanation: 'Dropout randomly zeroes neuron outputs during training, reducing co-adaptation.' },
    { q: 'Which architecture is best suited for sequential data?', options: ['CNN', 'RNN / LSTM', 'K-Means', 'PCA'], answer: 'RNN / LSTM', explanation: 'Recurrent networks maintain state across time steps, ideal for sequences.' },
    { q: 'What is the role of a bias term in a neuron?', options: ['Regularization', 'Shift the activation function', 'Reduce parameters', 'Normalize data'], answer: 'Shift the activation function', explanation: 'Bias allows the activation function to shift left/right independently of weights.' },
    { q: 'Which loss is typically used for multi-class classification?', options: ['MSE', 'Binary Cross-Entropy', 'Categorical Cross-Entropy', 'Huber'], answer: 'Categorical Cross-Entropy', explanation: 'Categorical cross-entropy measures dissimilarity across multiple classes.' },
  ],
  python: [
    { q: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'lambda'], answer: 'def', explanation: 'The def keyword is used to define functions in Python.' },
    { q: 'What is the output of 3 // 2 in Python?', options: ['1.5', '1', '2', '0'], answer: '1', explanation: 'The // operator performs floor division, returning the integer part.' },
    { q: 'Which data structure does NOT allow duplicates?', options: ['List', 'Tuple', 'Set', 'Array'], answer: 'Set', explanation: 'Sets automatically enforce uniqueness among elements.' },
    { q: 'What does len("hello") return?', options: ['4', '5', '6', 'Error'], answer: '5', explanation: 'len returns the number of characters in the string.' },
    { q: 'Which keyword handles exceptions in Python?', options: ['catch', 'except', 'rescue', 'handle'], answer: 'except', explanation: 'except is paired with try to handle exceptions.' },
    { q: 'What is a list comprehension?', options: ['A loop inside a function', 'A concise way to create lists', 'A type of dictionary', 'A module'], answer: 'A concise way to create lists', explanation: 'List comprehensions build lists from expressions in a single readable line.' },
    { q: 'Which module is used for regular expressions?', options: ['regex', 're', 'regexp', 'string'], answer: 're', explanation: 'The re module provides regular expression operations.' },
    { q: 'What does the with statement do?', options: ['Loops', 'Context management', 'Imports', 'Defines classes'], answer: 'Context management', explanation: 'with ensures resources are properly acquired and released.' },
  ],
  'data structures': [
    { q: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], answer: 'Stack', explanation: 'A stack is Last-In-First-Out: the last element pushed is the first popped.' },
    { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 'O(log n)', explanation: 'Binary search halves the search space each step, giving O(log n).' },
    { q: 'Which structure is best for BFS?', options: ['Stack', 'Queue', 'Heap', 'Hash Map'], answer: 'Queue', explanation: 'BFS uses a FIFO queue to explore nodes level by level.' },
    { q: 'What is a hash table\'s average lookup complexity?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 'O(1)', explanation: 'Hash tables provide average O(1) lookup via hashing.' },
    { q: 'Which tree maintains balance automatically?', options: ['Binary Tree', 'AVL Tree', 'General Tree', 'Trie'], answer: 'AVL Tree', explanation: 'AVL trees rotate on insert/delete to maintain a height balance factor.' },
    { q: 'What does a priority queue use under the hood?', options: ['Stack', 'Heap', 'Array', 'Queue'], answer: 'Heap', explanation: 'Heaps efficiently support extract-min/max for priority queues.' },
    { q: 'Which is a linear data structure?', options: ['Tree', 'Graph', 'Array', 'Heap'], answer: 'Array', explanation: 'Arrays store elements in contiguous, linear memory.' },
    { q: 'What is the worst-case time for quicksort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], answer: 'O(n²)', explanation: 'With poor pivot choices, quicksort degrades to O(n²).' },
  ],
  sql: [
    { q: 'Which clause filters rows in SQL?', options: ['WHERE', 'ORDER BY', 'GROUP BY', 'SELECT'], answer: 'WHERE', explanation: 'WHERE filters rows before grouping occurs.' },
    { q: 'Which keyword removes duplicates in results?', options: ['UNIQUE', 'DISTINCT', 'GROUP', 'LIMIT'], answer: 'DISTINCT', explanation: 'DISTINCT eliminates duplicate rows from the result set.' },
    { q: 'What does a JOIN do?', options: ['Combines rows from two tables', 'Sorts rows', 'Deletes rows', 'Creates indexes'], answer: 'Combines rows from two tables', explanation: 'JOIN combines rows based on a related column between tables.' },
    { q: 'Which command adds rows to a table?', options: ['ADD', 'INSERT', 'UPDATE', 'CREATE'], answer: 'INSERT', explanation: 'INSERT adds new rows into a table.' },
    { q: 'What is a primary key?', options: ['A foreign reference', 'A unique row identifier', 'An index', 'A constraint name'], answer: 'A unique row identifier', explanation: 'A primary key uniquely identifies each row and cannot be NULL.' },
    { q: 'Which aggregate function counts rows?', options: ['TOTAL', 'COUNT', 'SUM', 'AVG'], answer: 'COUNT', explanation: 'COUNT returns the number of rows matching a condition.' },
    { q: 'What does HAVING filter?', options: ['Rows before grouping', 'Groups after GROUP BY', 'Columns', 'Indexes'], answer: 'Groups after GROUP BY', explanation: 'HAVING filters groups, unlike WHERE which filters rows.' },
    { q: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: '3NF', explanation: 'Third Normal Form removes transitive dependencies between non-key attributes.' },
  ],
  physics: [
    { q: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton', explanation: 'Force is measured in newtons (N = kg·m/s²).' },
    { q: 'Which law states F = ma?', options: ["Newton's First", "Newton's Second", "Newton's Third", 'Hooke\'s Law'], answer: "Newton's Second", explanation: 'Newton\'s Second Law relates force, mass, and acceleration.' },
    { q: 'What does the speed of light equal in vacuum?', options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '1 × 10⁸ m/s', '3 × 10¹⁰ m/s'], answer: '3 × 10⁸ m/s', explanation: 'Light travels at approximately 3 × 10⁸ meters per second in vacuum.' },
    { q: 'Which quantity is conserved in an isolated system?', options: ['Velocity', 'Momentum', 'Acceleration', 'Force'], answer: 'Momentum', explanation: 'Total momentum is conserved when no external forces act on the system.' },
    { q: 'What is the unit of electric resistance?', options: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], answer: 'Ohm', explanation: 'Resistance is measured in ohms (Ω).' },
    { q: 'Which wave does NOT require a medium?', options: ['Sound', 'Water', 'Light', 'Seismic'], answer: 'Light', explanation: 'Light is an electromagnetic wave and can travel through vacuum.' },
    { q: 'What is kinetic energy proportional to?', options: ['Velocity', 'Velocity squared', 'Mass squared', 'Time'], answer: 'Velocity squared', explanation: 'KE = ½mv², so kinetic energy scales with the square of velocity.' },
    { q: 'Which particle has no electric charge?', options: ['Proton', 'Electron', 'Neutron', 'Positron'], answer: 'Neutron', explanation: 'Neutrons are electrically neutral.' },
  ],
  mathematics: [
    { q: 'What is the derivative of x²?', options: ['x', '2x', 'x²/2', '2'], answer: '2x', explanation: 'Using the power rule, d/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x²) = 2x.' },
    { q: 'What is the value of π (to 2 decimals)?', options: ['3.12', '3.14', '3.16', '3.18'], answer: '3.14', explanation: 'π is approximately 3.14159, commonly rounded to 3.14.' },
    { q: 'Which is a prime number?', options: ['9', '15', '17', '21'], answer: '17', explanation: '17 has no divisors other than 1 and itself.' },
    { q: 'What is the integral of 1/x dx?', options: ['x', 'ln|x| + C', '1/x²', 'e^x'], answer: 'ln|x| + C', explanation: 'The natural logarithm is the antiderivative of 1/x.' },
    { q: 'What is 7 × 8?', options: ['54', '56', '58', '64'], answer: '56', explanation: '7 × 8 = 56.' },
    { q: 'Which theorem relates the sides of a right triangle?', options: ['Pythagorean', 'Fermat', 'Bayes', 'Newton'], answer: 'Pythagorean', explanation: 'a² + b² = c² for right triangles.' },
    { q: 'What is the square root of 144?', options: ['10', '11', '12', '14'], answer: '12', explanation: '12 × 12 = 144.' },
    { q: 'Which is an irrational number?', options: ['0.5', '√2', '3/4', '7'], answer: '√2', explanation: '√2 cannot be expressed as a ratio of integers.' },
  ],
  java: [
    { q: 'Which keyword creates an object in Java?', options: ['create', 'new', 'make', 'instance'], answer: 'new', explanation: 'The new operator allocates memory and invokes a constructor.' },
    { q: 'What is the parent of all classes in Java?', options: ['Class', 'Object', 'Super', 'Main'], answer: 'Object', explanation: 'Every class implicitly extends java.lang.Object.' },
    { q: 'Which is NOT a primitive type in Java?', options: ['int', 'boolean', 'String', 'double'], answer: 'String', explanation: 'String is a class; primitives are int, boolean, double, char, etc.' },
    { q: 'What does JVM stand for?', options: ['Java Variable Machine', 'Java Virtual Machine', 'Java Verified Module', 'Joint Virtual Machine'], answer: 'Java Virtual Machine', explanation: 'The JVM executes Java bytecode.' },
    { q: 'Which keyword prevents method overriding?', options: ['static', 'final', 'private', 'abstract'], answer: 'final', explanation: 'A final method cannot be overridden by subclasses.' },
    { q: 'What is autoboxing?', options: ['Automatic import', 'Converting primitives to wrappers', 'Garbage collection', 'Loop unrolling'], answer: 'Converting primitives to wrappers', explanation: 'Autoboxing converts primitives like int to Integer automatically.' },
    { q: 'Which collection does NOT allow duplicates?', options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], answer: 'HashSet', explanation: 'Set implementations reject duplicate elements.' },
    { q: 'What does the static keyword mean?', options: ['Thread-safe', 'Belongs to the class, not instances', 'Immutable', 'Private'], answer: 'Belongs to the class, not instances', explanation: 'Static members are shared across all instances of the class.' },
  ],
  'cloud computing': [
    { q: 'Which model provides virtualized compute resources over the internet?', options: ['SaaS', 'PaaS', 'IaaS', 'DaaS'], answer: 'IaaS', explanation: 'IaaS provisions virtualized infrastructure like VMs and storage.' },
    { q: 'Which is a managed serverless compute service?', options: ['EC2', 'Lambda', 'S3', 'VPC'], answer: 'Lambda', explanation: 'AWS Lambda runs code without provisioning servers.' },
    { q: 'What does SaaS stand for?', options: ['System as a Service', 'Software as a Service', 'Storage as a Service', 'Security as a Service'], answer: 'Software as a Service', explanation: 'SaaS delivers software over the internet on a subscription basis.' },
    { q: 'Which is a cloud object storage service?', options: ['RDS', 'S3', 'EC2', 'CloudFront'], answer: 'S3', explanation: 'Amazon S3 stores objects (files) in buckets.' },
    { q: 'What is multi-cloud?', options: ['One cloud only', 'Using multiple cloud providers', 'Multiple regions in one provider', 'On-prem only'], answer: 'Using multiple cloud providers', explanation: 'Multi-cloud uses services from more than one provider to avoid lock-in.' },
    { q: 'Which concept scales resources automatically based on demand?', options: ['Load balancing', 'Auto-scaling', 'Sharding', 'Caching'], answer: 'Auto-scaling', explanation: 'Auto-scaling adjusts the number of instances based on metrics.' },
    { q: 'What is a container orchestration platform?', options: ['Kubernetes', 'MySQL', 'Redis', 'Nginx'], answer: 'Kubernetes', explanation: 'Kubernetes automates deployment and scaling of containers.' },
    { q: 'Which is a benefit of cloud computing?', options: ['Fixed capacity', 'Pay-as-you-go pricing', 'Manual provisioning', 'Higher latency'], answer: 'Pay-as-you-go pricing', explanation: 'Cloud pricing scales with usage, reducing upfront costs.' },
  ],
};

const GENERIC_TEMPLATES = [
  { q: 'What is the primary focus of {topic}?', options: ['A core concept', 'An unrelated idea', 'A deprecated method', 'A random fact'], answer: 'A core concept', explanation: '{topic} centers on foundational concepts and principles.' },
  { q: 'Which best describes a key principle of {topic}?', options: ['Systematic study and application', 'Guessing', 'Ignoring context', 'Memorization only'], answer: 'Systematic study and application', explanation: '{topic} relies on structured understanding and practical application.' },
  { q: 'Why is {topic} important?', options: ['It solves real-world problems', 'It is optional', 'It is outdated', 'It has no use'], answer: 'It solves real-world problems', explanation: '{topic} provides tools and frameworks to address practical problems.' },
  { q: 'Which is a fundamental component of {topic}?', options: ['Core terminology', 'Random data', 'Unrelated fields', 'Personal opinion'], answer: 'Core terminology', explanation: 'Understanding key terms is essential to mastering {topic}.' },
  { q: 'What approach does {topic} typically use?', options: ['Structured methodology', 'Trial and error only', 'Memorization', 'Guesswork'], answer: 'Structured methodology', explanation: '{topic} applies systematic methods to analyze and solve problems.' },
  { q: 'Which is a common misconception about {topic}?', options: ['It is only for experts', 'It is widely applicable', 'It has clear principles', 'It evolves over time'], answer: 'It is only for experts', explanation: '{topic} is accessible to learners at many levels, not just experts.' },
  { q: 'What supports learning in {topic}?', options: ['Practice and examples', 'Avoiding study', 'Ignoring fundamentals', 'Skipping theory'], answer: 'Practice and examples', explanation: 'Hands-on practice reinforces theoretical understanding in {topic}.' },
  { q: 'Which best describes the scope of {topic}?', options: ['Broad and interdisciplinary', 'Extremely narrow', 'Irrelevant', 'Static and unchanging'], answer: 'Broad and interdisciplinary', explanation: '{topic} often intersects with multiple related fields.' },
];

const TF_TEMPLATES: Record<string, { q: string; answer: boolean; explanation: string }[]> = {
  'machine learning': [
    { q: 'Supervised learning requires labeled training data.', answer: true, explanation: 'Supervised learning maps inputs to known labeled outputs.' },
    { q: 'K-Means is a supervised learning algorithm.', answer: false, explanation: 'K-Means is unsupervised; it clusters without labeled outputs.' },
    { q: 'Cross-validation helps detect overfitting.', answer: true, explanation: 'Cross-validation evaluates generalization across data splits.' },
    { q: 'A larger neural network always performs better.', answer: false, explanation: 'Larger networks can overfit; capacity must match the task.' },
    { q: 'Regularization reduces model complexity.', answer: true, explanation: 'Regularization penalizes large weights to simplify models.' },
    { q: 'Reinforcement learning uses reward signals.', answer: true, explanation: 'Agents learn by maximizing cumulative rewards.' },
    { q: 'Feature scaling never affects model performance.', answer: false, explanation: 'Many algorithms (e.g., SVM, KNN) are sensitive to feature scale.' },
    { q: 'The learning rate controls step size in gradient descent.', answer: true, explanation: 'The learning rate scales the update applied to parameters.' },
  ],
  'neural networks': [
    { q: 'ReLU can output negative values.', answer: false, explanation: 'ReLU outputs zero for negative inputs, max(0, x).' },
    { q: 'Batch normalization stabilizes training.', answer: true, explanation: 'BatchNorm normalizes layer inputs, reducing internal covariate shift.' },
    { q: 'More layers always eliminate overfitting.', answer: false, explanation: 'Deeper networks can overfit more without regularization.' },
    { q: 'Dropout is only used at inference time.', answer: false, explanation: 'Dropout is active during training and disabled at inference.' },
    { q: 'The softmax function outputs a probability distribution.', answer: true, explanation: 'Softmax normalizes outputs to sum to 1 across classes.' },
    { q: 'Weight initialization does not affect training.', answer: false, explanation: 'Poor initialization can cause vanishing/exploding gradients.' },
    { q: 'LSTMs address the vanishing gradient problem.', answer: true, explanation: 'LSTM gating mechanisms preserve long-range dependencies.' },
    { q: 'Activation functions introduce non-linearity.', answer: true, explanation: 'Without non-linear activations, networks collapse to linear maps.' },
  ],
  python: [
    { q: 'Python is a dynamically typed language.', answer: true, explanation: 'Variable types are checked at runtime in Python.' },
    { q: 'Tuples are mutable in Python.', answer: false, explanation: 'Tuples are immutable; lists are mutable.' },
    { q: 'Python supports multiple inheritance.', answer: true, explanation: 'Python classes can inherit from multiple parent classes.' },
    { q: 'In Python, indentation is optional.', answer: false, explanation: 'Indentation defines code blocks and is required.' },
    { q: 'Lists in Python can contain mixed types.', answer: true, explanation: 'Python lists can hold elements of any type.' },
    { q: 'Dictionaries use index-based access like lists.', answer: false, explanation: 'Dictionaries are accessed by keys, not numeric indices.' },
    { q: 'The GIL allows true multi-threading for CPU tasks in Python.', answer: false, explanation: 'The GIL serializes bytecode execution, limiting CPU threading.' },
    { q: 'List comprehensions are faster than equivalent for-loops.', answer: true, explanation: 'Comprehensions are optimized at the C level in CPython.' },
  ],
  'data structures': [
    { q: 'A stack supports O(1) push and pop.', answer: true, explanation: 'Stacks operate on the top element in constant time.' },
    { q: 'A binary search tree guarantees O(log n) search in all cases.', answer: false, explanation: 'Unbalanced BSTs can degrade to O(n).' },
    { q: 'Hash maps provide average O(1) lookup.', answer: true, explanation: 'Good hash functions distribute keys evenly for O(1) access.' },
    { q: 'Linked lists allow O(1) random access.', answer: false, explanation: 'Linked lists require traversal; random access is O(n).' },
    { q: 'A heap is a complete binary tree.', answer: true, explanation: 'Heaps maintain the complete-tree property at all times.' },
    { q: 'Graphs can be represented with adjacency lists or matrices.', answer: true, explanation: 'Both representations are common, with different trade-offs.' },
    { q: 'Quicksort is a stable sorting algorithm.', answer: false, explanation: 'Quicksort does not preserve the order of equal elements.' },
    { q: 'A queue uses FIFO ordering.', answer: true, explanation: 'Queues remove the oldest element first (First-In-First-Out).' },
  ],
  sql: [
    { q: 'SQL is a declarative query language.', answer: true, explanation: 'SQL describes what to retrieve, not how.' },
    { q: 'NULL equals NULL in SQL comparisons.', answer: false, explanation: 'NULL = NULL evaluates to UNKNOWN, not TRUE.' },
    { q: 'A foreign key can reference a primary key in another table.', answer: true, explanation: 'Foreign keys enforce referential integrity across tables.' },
    { q: 'The GROUP BY clause must precede WHERE logically.', answer: false, explanation: 'WHERE filters before grouping; GROUP BY comes after WHERE.' },
    { q: 'Indexes speed up read queries but slow down writes.', answer: true, explanation: 'Indexes add lookup overhead to inserts and updates.' },
    { q: 'ACID stands for Atomicity, Consistency, Isolation, Durability.', answer: true, explanation: 'These properties guarantee reliable database transactions.' },
    { q: 'A view stores physical data like a table.', answer: false, explanation: 'A view is a virtual table defined by a stored query.' },
    { q: 'UNION combines result sets and removes duplicates.', answer: true, explanation: 'UNION removes duplicates; UNION ALL keeps them.' },
  ],
  physics: [
    { q: 'Energy is always conserved in an isolated system.', answer: true, explanation: 'The first law of thermodynamics states energy conservation.' },
    { q: 'Light travels faster in glass than in vacuum.', answer: false, explanation: 'Light slows down in denser media like glass.' },
    { q: 'Gravity is a fundamental force.', answer: true, explanation: 'Gravity is one of the four fundamental interactions.' },
    { q: 'A vector has only magnitude.', answer: false, explanation: 'Vectors have both magnitude and direction.' },
    { q: 'The acceleration due to gravity on Earth is about 9.8 m/s².', answer: true, explanation: 'Standard gravity g ≈ 9.81 m/s² at Earth\'s surface.' },
    { q: 'Sound can travel through a vacuum.', answer: false, explanation: 'Sound requires a medium; it cannot cross a vacuum.' },
    { q: 'Mass and weight are the same quantity.', answer: false, explanation: 'Mass is intrinsic; weight is the force due to gravity.' },
    { q: 'Entropy in an isolated system tends to increase.', answer: true, explanation: 'The second law of thermodynamics states entropy increases.' },
  ],
  mathematics: [
    { q: 'Zero is a natural number in all conventions.', answer: false, explanation: 'Some definitions include 0; others start natural numbers at 1.' },
    { q: 'The square root of a negative number is real.', answer: false, explanation: 'It is imaginary; √(-1) = i.' },
    { q: 'A derivative measures instantaneous rate of change.', answer: true, explanation: 'Derivatives give the slope of a function at a point.' },
    { q: 'The sum of angles in a triangle is 360°.', answer: false, explanation: 'The sum is 180° in Euclidean geometry.' },
    { q: 'Integration is the reverse of differentiation.', answer: true, explanation: 'The fundamental theorem of calculus links them.' },
    { q: 'Every even number greater than 2 is the sum of two primes (proven).', answer: false, explanation: 'Goldbach\'s conjecture remains unproven.' },
    { q: 'e is an irrational number.', answer: true, explanation: 'Euler\'s number e ≈ 2.718 is irrational.' },
    { q: 'A matrix with determinant zero is invertible.', answer: false, explanation: 'Determinant zero means the matrix is singular (non-invertible).' },
  ],
  java: [
    { q: 'Java is a compiled and interpreted language.', answer: true, explanation: 'Java compiles to bytecode, which the JVM interprets/JITs.' },
    { q: 'Java supports operator overloading.', answer: false, explanation: 'Java deliberately omits user-defined operator overloading.' },
    { q: 'All objects in Java are allocated on the heap.', answer: true, explanation: 'Object instances live on the heap; primitives on the stack.' },
    { q: 'Interfaces can contain method implementations in modern Java.', answer: true, explanation: 'Since Java 8, interfaces support default and static methods.' },
    { q: 'Garbage collection is manual in Java.', answer: false, explanation: 'The JVM automatically manages memory via garbage collection.' },
    { q: 'Java programs are platform-independent at the bytecode level.', answer: true, explanation: 'Bytecode runs on any JVM, enabling write-once run-anywhere.' },
    { q: 'A final class can be subclassed.', answer: false, explanation: 'final classes cannot be extended.' },
    { q: 'Threads in Java share the same memory space.', answer: true, explanation: 'Threads within a process share heap and class metadata.' },
  ],
  'cloud computing': [
    { q: 'Cloud computing relies on pay-as-you-go pricing.', answer: true, explanation: 'Resources are billed based on usage.' },
    { q: 'A private cloud is accessible to the public internet.', answer: false, explanation: 'Private clouds are restricted to a single organization.' },
    { q: 'Serverless computing eliminates all server management for users.', answer: true, explanation: 'Providers manage servers; users focus on code.' },
    { q: 'Containers are heavier than virtual machines.', answer: false, explanation: 'Containers share the OS kernel and are lighter than VMs.' },
    { q: 'IaaS provides virtualized computing infrastructure.', answer: true, explanation: 'IaaS offers VMs, storage, and networking as a service.' },
    { q: 'Cloud storage is always free.', answer: false, explanation: 'Cloud storage incurs costs based on capacity and usage.' },
    { q: 'Auto-scaling adjusts resources based on demand.', answer: true, explanation: 'Auto-scaling adds or removes instances dynamically.' },
    { q: 'A region in the cloud contains exactly one data center.', answer: false, explanation: 'A region typically contains multiple availability zones.' },
  ],
};

const GENERIC_TF = [
  { q: '{topic} is a well-established field of study.', answer: true, explanation: '{topic} has recognized principles and a body of knowledge.' },
  { q: 'Understanding fundamentals is unnecessary in {topic}.', answer: false, explanation: 'Fundamentals form the basis for advanced work in {topic}.' },
  { q: 'Practical application is a key part of {topic}.', answer: true, explanation: '{topic} combines theory with hands-on practice.' },
  { q: '{topic} has no real-world relevance.', answer: false, explanation: '{topic} is widely applied across industries and disciplines.' },
  { q: 'Continuous learning is important in {topic}.', answer: true, explanation: '{topic} evolves, requiring ongoing study.' },
  { q: 'Memorization alone is sufficient to master {topic}.', answer: false, explanation: 'True mastery requires understanding, not just memorization.' },
  { q: 'Problem-solving is central to {topic}.', answer: true, explanation: '{topic} develops analytical and problem-solving skills.' },
  { q: '{topic} is static and never changes.', answer: false, explanation: '{topic} advances with new research and tools.' },
];

const SHORT_TEMPLATES: Record<string, { q: string; answer: string; explanation: string }[]> = {
  'machine learning': [
    { q: 'Name one common method to prevent overfitting.', answer: 'Regularization (or dropout, cross-validation, more data)', explanation: 'Regularization and dropout are standard anti-overfitting techniques.' },
    { q: 'What does SVM stand for?', answer: 'Support Vector Machine', explanation: 'SVMs find optimal separating hyperplanes for classification.' },
    { q: 'Define supervised learning in one sentence.', answer: 'Learning from labeled input-output pairs to predict outputs.', explanation: 'Supervised learning maps inputs to known target labels.' },
    { q: 'What loss is used for linear regression?', answer: 'Mean Squared Error (MSE)', explanation: 'MSE measures average squared prediction error.' },
    { q: 'What is a confusion matrix?', answer: 'A table summarizing true/false positives and negatives.', explanation: 'It visualizes classification performance across classes.' },
    { q: 'Name one dimensionality reduction technique.', answer: 'PCA (Principal Component Analysis)', explanation: 'PCA projects data onto lower-dimensional subspaces.' },
    { q: 'What does a learning rate control?', answer: 'The step size in gradient descent updates.', explanation: 'Learning rate scales how much weights change per step.' },
    { q: 'What is one-hot encoding?', answer: 'Representing categories as binary vectors with one 1.', explanation: 'One-hot encoding turns categories into numeric form for models.' },
  ],
  'neural networks': [
    { q: 'What does ReLU stand for?', answer: 'Rectified Linear Unit', explanation: 'ReLU outputs max(0, x) and is the most common hidden activation.' },
    { q: 'Name one function of an activation function.', answer: 'Introduce non-linearity.', explanation: 'Non-linearities let networks model complex functions.' },
    { q: 'What is a weight in a neural network?', answer: 'A parameter scaling an input\'s contribution.', explanation: 'Weights are learned parameters that shape the model.' },
    { q: 'What does epoch mean?', answer: 'One full pass through the training dataset.', explanation: 'An epoch covers every training example once.' },
    { q: 'Name one optimizer used to train neural networks.', answer: 'Adam (or SGD, RMSprop)', explanation: 'Optimizers update weights using computed gradients.' },
    { q: 'What problem do residual connections (skip connections) solve?', answer: 'Vanishing gradients in very deep networks.', explanation: 'Skip connections let gradients flow directly to earlier layers.' },
    { q: 'What is a batch in training?', answer: 'A subset of training examples processed together.', explanation: 'Mini-batch training balances efficiency and stability.' },
    { q: 'What does softmax output?', answer: 'A probability distribution across classes.', explanation: 'Softmax exponentiates and normalizes logits to sum to 1.' },
  ],
  python: [
    { q: 'What keyword defines a function?', answer: 'def', explanation: 'def introduces a function definition.' },
    { q: 'Name a Python data type that is immutable.', answer: 'Tuple (or str, int, float)', explanation: 'Tuples and strings cannot be changed after creation.' },
    { q: 'What does pip do?', answer: 'Installs Python packages.', explanation: 'pip is the Python package installer.' },
    { q: 'How do you start a comment in Python?', answer: 'With the # symbol.', explanation: '# begins a single-line comment.' },
    { q: 'What does import do?', answer: 'Brings a module\'s names into scope.', explanation: 'import loads a module for use in the current file.' },
    { q: 'Name one way to iterate over a list.', answer: 'A for loop.', explanation: 'for loops iterate elements directly or via range.' },
    { q: 'What is a dictionary?', answer: 'A mapping of keys to values.', explanation: 'Dicts store key-value pairs with O(1) average lookup.' },
    { q: 'What does len() return for a string?', answer: 'The number of characters.', explanation: 'len counts characters in a string.' },
  ],
  'data structures': [
    { q: 'Name a LIFO data structure.', answer: 'Stack', explanation: 'Stacks remove the most recently added element first.' },
    { q: 'What is the time complexity of accessing an array element by index?', answer: 'O(1)', explanation: 'Arrays support constant-time indexed access.' },
    { q: 'Name a self-balancing tree.', answer: 'AVL tree (or Red-Black tree)', explanation: 'Self-balancing trees keep height logarithmic.' },
    { q: 'What does BFS stand for?', answer: 'Breadth-First Search', explanation: 'BFS explores nodes level by level using a queue.' },
    { q: 'What is a hash collision?', answer: 'Two keys mapping to the same hash bucket.', explanation: 'Collisions are resolved via chaining or open addressing.' },
    { q: 'Name a stable sorting algorithm.', answer: 'Merge sort', explanation: 'Merge sort preserves the order of equal elements.' },
    { q: 'What structure does a heap resemble?', answer: 'A complete binary tree.', explanation: 'Heaps maintain heap-order in a complete binary tree.' },
    { q: 'What is amortized analysis?', answer: 'Analyzing average cost over a sequence of operations.', explanation: 'Amortized analysis smooths occasional expensive operations.' },
  ],
  sql: [
    { q: 'What keyword filters rows?', answer: 'WHERE', explanation: 'WHERE restricts rows before grouping.' },
    { q: 'What does JOIN do?', answer: 'Combines rows from two tables.', explanation: 'JOINs merge tables on a related column.' },
    { q: 'Name one aggregate function.', answer: 'COUNT (or SUM, AVG, MAX, MIN)', explanation: 'Aggregate functions compute a single value from a set.' },
    { q: 'What does DISTINCT do?', answer: 'Removes duplicate rows.', explanation: 'DISTINCT keeps only unique rows in the result.' },
    { q: 'What is a primary key?', answer: 'A unique identifier for each row.', explanation: 'Primary keys are unique and non-null.' },
    { q: 'What does ORDER BY do?', answer: 'Sorts the result set.', explanation: 'ORDER BY sorts rows by one or more columns.' },
    { q: 'Name one type of JOIN.', answer: 'INNER JOIN (or LEFT, RIGHT, FULL)', explanation: 'JOIN types determine which rows are retained.' },
    { q: 'What does HAVING filter?', answer: 'Groups after GROUP BY.', explanation: 'HAVING filters aggregated groups.' },
  ],
  physics: [
    { q: 'State Newton\'s second law in symbols.', answer: 'F = ma', explanation: 'Force equals mass times acceleration.' },
    { q: 'What is the unit of energy?', answer: 'Joule', explanation: 'Energy is measured in joules (N·m).' },
    { q: 'What does the first law of thermodynamics state?', answer: 'Energy is conserved.', explanation: 'Energy cannot be created or destroyed, only transformed.' },
    { q: 'Name a vector quantity.', answer: 'Velocity (or force, acceleration)', explanation: 'Vectors have magnitude and direction.' },
    { q: 'What is the speed of light in vacuum (approx)?', answer: '3 × 10⁸ m/s', explanation: 'Light speed c ≈ 299,792,458 m/s.' },
    { q: 'What does Ohm\'s law state?', answer: 'V = IR', explanation: 'Voltage equals current times resistance.' },
    { q: 'Name a fundamental force.', answer: 'Gravity (or electromagnetism, strong, weak)', explanation: 'There are four fundamental interactions.' },
    { q: 'What is kinetic energy?', answer: 'Energy of motion, ½mv².', explanation: 'KE depends on mass and the square of velocity.' },
  ],
  mathematics: [
    { q: 'What is the derivative of sin(x)?', answer: 'cos(x)', explanation: 'd/dx sin(x) = cos(x).' },
    { q: 'State the Pythagorean theorem.', answer: 'a² + b² = c²', explanation: 'For right triangles, the hypotenuse squared equals the sum of legs squared.' },
    { q: 'What is the integral of 1/x?', answer: 'ln|x| + C', explanation: 'The natural log is the antiderivative of 1/x.' },
    { q: 'What is 12 × 12?', answer: '144', explanation: '12 squared equals 144.' },
    { q: 'Name an irrational number.', answer: 'π (or √2, e)', explanation: 'Irrational numbers cannot be expressed as p/q.' },
    { q: 'What is the value of 2³?', answer: '8', explanation: '2 × 2 × 2 = 8.' },
    { q: 'What is a prime number?', answer: 'A number with exactly two divisors: 1 and itself.', explanation: 'Primes have no other factors.' },
    { q: 'What is the derivative of a constant?', answer: '0', explanation: 'Constants do not change, so their derivative is zero.' },
  ],
  java: [
    { q: 'What keyword creates an object?', answer: 'new', explanation: 'new allocates memory and calls a constructor.' },
    { q: 'What is the superclass of all Java classes?', answer: 'Object', explanation: 'java.lang.Object is the root of the class hierarchy.' },
    { q: 'Name a Java primitive type.', answer: 'int (or boolean, double, char)', explanation: 'Java has eight primitive types.' },
    { q: 'What does JVM stand for?', answer: 'Java Virtual Machine', explanation: 'The JVM executes Java bytecode.' },
    { q: 'What keyword prevents inheritance?', answer: 'final', explanation: 'A final class cannot be subclassed.' },
    { q: 'What is autoboxing?', answer: 'Automatic conversion from primitive to wrapper.', explanation: 'e.g., int to Integer happens automatically.' },
    { q: 'Name a Java collection that rejects duplicates.', answer: 'HashSet (or any Set)', explanation: 'Sets enforce uniqueness.' },
    { q: 'What does the static keyword indicate?', answer: 'A member belongs to the class, not instances.', explanation: 'Static members are shared across instances.' },
  ],
  'cloud computing': [
    { q: 'What does IaaS stand for?', answer: 'Infrastructure as a Service', explanation: 'IaaS provides virtualized compute resources.' },
    { q: 'Name a serverless compute service.', answer: 'AWS Lambda (or Azure Functions, Cloud Functions)', explanation: 'Serverless platforms run code without managing servers.' },
    { q: 'What does SaaS stand for?', answer: 'Software as a Service', explanation: 'SaaS delivers applications over the internet.' },
    { q: 'Name a cloud object storage service.', answer: 'Amazon S3 (or Azure Blob, GCS)', explanation: 'Object stores hold files as objects in buckets.' },
    { q: 'What is auto-scaling?', answer: 'Automatically adjusting resources based on demand.', explanation: 'Auto-scaling adds or removes instances to match load.' },
    { q: 'Name a container orchestration platform.', answer: 'Kubernetes', explanation: 'Kubernetes manages containerized workloads at scale.' },
    { q: 'What is a region in cloud terms?', answer: 'A geographic area containing multiple data centers.', explanation: 'Regions host availability zones for resilience.' },
    { q: 'What does PaaS provide?', answer: 'A platform to build and deploy apps without managing infrastructure.', explanation: 'PaaS abstracts servers, OS, and runtime.' },
  ],
};

const GENERIC_SHORT = [
  { q: 'Define {topic} in one sentence.', answer: '{topic} is a field that studies core principles and their applications.', explanation: '{topic} has foundational concepts worth knowing.' },
  { q: 'Name one key concept in {topic}.', answer: 'Core principles and terminology.', explanation: 'Key terms anchor understanding in {topic}.' },
  { q: 'Why is {topic} useful?', answer: 'It solves real-world problems.', explanation: '{topic} applies to many practical domains.' },
  { q: 'Name one way to study {topic}.', answer: 'Practice with examples.', explanation: 'Hands-on practice reinforces {topic} concepts.' },
  { q: 'What is a common challenge in {topic}?', answer: 'Bridging theory and practice.', explanation: 'Applying concepts is often harder than learning them.' },
  { q: 'Give one application of {topic}.', answer: 'Solving structured problems.', explanation: '{topic} underpins many analytical methods.' },
  { q: 'What supports mastery of {topic}?', answer: 'Consistent practice and review.', explanation: 'Spaced repetition helps retain {topic} knowledge.' },
  { q: 'Name a skill developed by {topic}.', answer: 'Analytical thinking.', explanation: '{topic} cultivates structured reasoning.' },
];

function pickN<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const result: T[] = [];
  const pool = [...arr];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillTemplate(t: string, topic: string): string {
  return t.replace(/\{topic\}/g, topic);
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function pickTypes(qType: QuestionType, n: number): ('mcq' | 'truefalse' | 'short')[] {
  if (qType === 'Mixed') {
    const dist: ('mcq' | 'truefalse' | 'short')[] = [];
    const mcqCount = Math.ceil(n * 0.5);
    const tfCount = Math.ceil(n * 0.25);
    const shortCount = n - mcqCount - tfCount;
    for (let i = 0; i < mcqCount; i++) dist.push('mcq');
    for (let i = 0; i < tfCount; i++) dist.push('truefalse');
    for (let i = 0; i < shortCount; i++) dist.push('short');
    return shuffle(dist);
  }
  const map: Record<Exclude<QuestionType, 'Mixed'>, 'mcq' | 'truefalse' | 'short'> = {
    'MCQ': 'mcq',
    'True/False': 'truefalse',
    'Short Answer': 'short',
  };
  return Array(n).fill(map[qType as Exclude<QuestionType, 'Mixed'>]);
}

interface McqItem { q: string; options: string[]; answer: string; explanation: string }
interface TfItem { q: string; answer: boolean; explanation: string }
interface ShortItem { q: string; answer: string; explanation: string }

function getBank(topic: string): { mcq: McqItem[]; tf: TfItem[]; short: ShortItem[] } {
  const key = topic.toLowerCase();
  return {
    mcq: (MCQ_TEMPLATES[key] ?? GENERIC_TEMPLATES) as McqItem[],
    tf: (TF_TEMPLATES[key] ?? GENERIC_TF) as TfItem[],
    short: (SHORT_TEMPLATES[key] ?? GENERIC_SHORT) as ShortItem[],
  };
}

function adjustDifficulty(d: Difficulty, q: string): string {
  if (d === 'Beginner') return q.replace(/Which|What is|Name one/g, 'Which');
  return q;
}

export function generateQuiz(config: QuizConfig): QuizQuestion[] {
  const bank = getBank(config.topic);
  const types = pickTypes(config.questionType, config.numQuestions);

  const mcqPool = pickN(bank.mcq, config.numQuestions);
  const tfPool = pickN(bank.tf, config.numQuestions);
  const shortPool = pickN(bank.short, config.numQuestions);

  let mcqIdx = 0, tfIdx = 0, shortIdx = 0;
  const questions: QuizQuestion[] = types.map((t) => {
    const source = config.sourceType === 'pdf' && config.fileName
      ? `${config.fileName} · p.${Math.floor(Math.random() * 12) + 1}`
      : undefined;
    const baseDifficulty = config.difficulty;

    if (t === 'mcq') {
      const item = mcqPool[mcqIdx++ % mcqPool.length];
      const q = fillTemplate(item.q, config.topic);
      const options = item.options;
      const answer = item.answer;
      const explanation = fillTemplate(item.explanation, config.topic);
      return {
        id: genId(),
        type: 'mcq',
        question: adjustDifficulty(baseDifficulty, q),
        options: shuffle(options),
        correctAnswer: answer,
        explanation,
        source,
        topic: config.topic,
        difficulty: baseDifficulty,
      };
    }
    if (t === 'truefalse') {
      const item = tfPool[tfIdx++ % tfPool.length];
      const q = fillTemplate(item.q, config.topic);
      const answer = item.answer;
      const explanation = fillTemplate(item.explanation, config.topic);
      return {
        id: genId(),
        type: 'truefalse',
        question: adjustDifficulty(baseDifficulty, q),
        options: ['True', 'False'],
        correctAnswer: answer ? 'True' : 'False',
        explanation,
        source,
        topic: config.topic,
        difficulty: baseDifficulty,
      };
    }
    // short
    const item = shortPool[shortIdx++ % shortPool.length];
    const q = fillTemplate(item.q, config.topic);
    const answer = fillTemplate(item.answer, config.topic);
    const explanation = fillTemplate(item.explanation, config.topic);
    return {
      id: genId(),
      type: 'short',
      question: adjustDifficulty(baseDifficulty, q),
      correctAnswer: answer,
      explanation,
      source,
      topic: config.topic,
      difficulty: baseDifficulty,
    };
  });

  return config.randomizeQuestions ? shuffle(questions) : questions;
}

export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/[.,;:!?]+$/g, '');
}

export function isShortAnswerCorrect(user: string, correct: string): boolean {
  const u = normalizeAnswer(user);
  const c = normalizeAnswer(correct);
  if (!u) return false;
  if (u === c) return true;
  // Accept if the user answer contains the core correct answer (first phrase before parentheses)
  const core = c.split('(')[0].trim();
  if (core.length > 2 && u.includes(core)) return true;
  // Token overlap heuristic
  const uTokens = new Set(u.split(/\s+/));
  const cTokens = c.split(/\s+/);
  const overlap = cTokens.filter((t) => uTokens.has(t)).length;
  return overlap >= Math.max(2, Math.ceil(cTokens.length * 0.6));
}
