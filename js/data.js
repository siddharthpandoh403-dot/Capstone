(function () {
  function topic(id, title, description, estimate) {
    return {
      id: id,
      title: title,
      description: description,
      estimate: estimate,
      status: "not-started"
    };
  }

  function question(questionText, options, answerIndex, explanation, weakArea) {
    return {
      question: questionText,
      options: options,
      answerIndex: answerIndex,
      explanation: explanation,
      weakArea: weakArea
    };
  }

  const roadmaps = {
    "Web Development": [
      {
        phase: "Phase 1: Foundations",
        topics: [
          topic("web-html-basics", "HTML Fundamentals", "Learn semantic structure, forms, media, and accessible markup.", "1 week"),
          topic("web-css-basics", "CSS Fundamentals", "Understand selectors, box model, spacing, colors, and responsive styling.", "1 week"),
          topic("web-js-basics", "JavaScript Basics", "Cover variables, functions, DOM basics, events, and control flow.", "2 weeks")
        ]
      },
      {
        phase: "Phase 2: Responsive Interfaces",
        topics: [
          topic("web-layouts", "Responsive Layouts", "Build flexible layouts using Flexbox, Grid, and media queries.", "1 week"),
          topic("web-dom", "DOM Manipulation", "Create interactive UI patterns with event-driven JavaScript.", "1 week"),
          topic("web-forms", "Forms and Validation", "Handle inputs, validation states, and user-friendly feedback.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Production Skills",
        topics: [
          topic("web-api", "APIs and Async JavaScript", "Use fetch, promises, async and await, and basic JSON workflows.", "1 week"),
          topic("web-performance", "Performance and Accessibility", "Improve loading, usability, keyboard support, and semantics.", "1 week"),
          topic("web-projects", "Portfolio Projects", "Ship polished projects that show real frontend ability.", "2 weeks")
        ]
      }
    ],
    "Machine Learning": [
      {
        phase: "Phase 1: Mathematical Base",
        topics: [
          topic("ml-python", "Python for ML", "Use NumPy-style thinking, functions, files, and data manipulation basics.", "1 week"),
          topic("ml-linear-algebra", "Linear Algebra Essentials", "Cover vectors, matrices, dot product, and transformations.", "2 weeks"),
          topic("ml-statistics", "Probability and Statistics", "Learn distributions, mean, variance, correlation, and hypothesis intuition.", "2 weeks")
        ]
      },
      {
        phase: "Phase 2: Core ML Concepts",
        topics: [
          topic("ml-supervised", "Supervised Learning", "Understand regression, classification, training data, and evaluation.", "2 weeks"),
          topic("ml-unsupervised", "Unsupervised Learning", "Explore clustering, dimensionality reduction, and pattern discovery.", "1 week"),
          topic("ml-metrics", "Model Evaluation", "Use accuracy, precision, recall, F1-score, and validation methods.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Applied Practice",
        topics: [
          topic("ml-feature-engineering", "Feature Engineering", "Prepare stronger input data for better models.", "1 week"),
          topic("ml-model-tuning", "Model Tuning", "Adjust hyperparameters and compare model performance thoughtfully.", "1 week"),
          topic("ml-projects", "Mini ML Projects", "Build practical prediction and classification workflows.", "2 weeks")
        ]
      }
    ],
    "Android Development": [
      {
        phase: "Phase 1: Android Basics",
        topics: [
          topic("android-java-kotlin", "Java or Kotlin Basics", "Strengthen syntax, OOP, collections, and null-safety concepts.", "2 weeks"),
          topic("android-studio", "Android Studio Workflow", "Set up projects, emulators, layouts, and Gradle basics conceptually.", "1 week"),
          topic("android-ui", "UI Components", "Use activities, layouts, buttons, lists, and navigation basics.", "2 weeks")
        ]
      },
      {
        phase: "Phase 2: App Logic",
        topics: [
          topic("android-lifecycle", "Activity Lifecycle", "Understand app state, recreation, and lifecycle-aware design.", "1 week"),
          topic("android-storage", "Local Storage", "Work with preferences, files, and local databases.", "1 week"),
          topic("android-networking", "Networking Basics", "Fetch remote data and handle loading, success, and failure states.", "1 week")
        ]
      },
      {
        phase: "Phase 3: App Quality",
        topics: [
          topic("android-architecture", "Architecture Patterns", "Explore MVVM, separation of concerns, and cleaner app design.", "1 week"),
          topic("android-testing", "Testing and Debugging", "Use logs, breakpoints, and unit or UI test foundations.", "1 week"),
          topic("android-project", "Capstone App", "Build a complete app with polished flows and reusable screens.", "2 weeks")
        ]
      }
    ],
    "Data Science": [
      {
        phase: "Phase 1: Data Foundations",
        topics: [
          topic("ds-python", "Python for Data Work", "Learn data-focused Python workflows with files and collections.", "1 week"),
          topic("ds-spreadsheets", "Spreadsheets and Cleaning", "Understand tabular thinking, filtering, and missing data handling.", "1 week"),
          topic("ds-statistics", "Statistics Basics", "Cover descriptive stats, sampling, and data interpretation.", "2 weeks")
        ]
      },
      {
        phase: "Phase 2: Analysis",
        topics: [
          topic("ds-pandas", "Pandas-Style Analysis", "Group, filter, transform, and summarize structured data.", "2 weeks"),
          topic("ds-visualization", "Data Visualization", "Present findings with clean charts and stories.", "1 week"),
          topic("ds-sql", "SQL for Data Science", "Query datasets for reporting and exploration.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Applied Projects",
        topics: [
          topic("ds-eda", "Exploratory Data Analysis", "Ask questions, inspect patterns, and generate insights.", "1 week"),
          topic("ds-storytelling", "Insight Communication", "Turn analysis into decisions and clear narratives.", "1 week"),
          topic("ds-projects", "Portfolio Case Studies", "Build end-to-end analyses on practical datasets.", "2 weeks")
        ]
      }
    ],
    "DSA & Competitive Coding": [
      {
        phase: "Phase 1: Problem Solving Base",
        topics: [
          topic("dsa-complexity", "Time and Space Complexity", "Estimate runtime and memory tradeoffs before coding.", "1 week"),
          topic("dsa-arrays-strings", "Arrays and Strings", "Practice traversal, searching, and two-pointer patterns.", "2 weeks"),
          topic("dsa-recursion", "Recursion Basics", "Build recursive thinking with small problems and stack tracing.", "1 week")
        ]
      },
      {
        phase: "Phase 2: Core Data Structures",
        topics: [
          topic("dsa-linkedlist-stack-queue", "Linked List, Stack, Queue", "Use linear structures to solve practical interview problems.", "2 weeks"),
          topic("dsa-trees-graphs", "Trees and Graphs", "Traverse hierarchical and network-shaped data.", "2 weeks"),
          topic("dsa-hashing", "Hashing", "Use frequency maps and constant-time lookup effectively.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Competitive Patterns",
        topics: [
          topic("dsa-dp", "Dynamic Programming", "Break overlapping subproblems into efficient state transitions.", "2 weeks"),
          topic("dsa-greedy", "Greedy and Binary Search", "Recognize optimization patterns and decision boundaries.", "1 week"),
          topic("dsa-contests", "Contest Practice", "Solve timed problems and review editorials strategically.", "2 weeks")
        ]
      }
    ],
    Cybersecurity: [
      {
        phase: "Phase 1: Core Security Concepts",
        topics: [
          topic("cyber-networking", "Networking Basics", "Understand packets, protocols, ports, and common network services.", "2 weeks"),
          topic("cyber-linux", "Linux Fundamentals", "Use shell commands, permissions, and system navigation confidently.", "1 week"),
          topic("cyber-security-principles", "CIA Triad and Threats", "Learn confidentiality, integrity, availability, and attack types.", "1 week")
        ]
      },
      {
        phase: "Phase 2: Defensive and Offensive Basics",
        topics: [
          topic("cyber-web-security", "Web Security Basics", "Explore authentication, session issues, XSS, and SQL injection awareness.", "2 weeks"),
          topic("cyber-cryptography", "Cryptography Concepts", "Study hashing, encryption, keys, and secure communication basics.", "1 week"),
          topic("cyber-tools", "Security Tools", "Use scanners, packet analyzers, and basic recon workflows responsibly.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Hands-On Practice",
        topics: [
          topic("cyber-labs", "Capture-the-Flag Labs", "Practice with legal sandbox environments and guided exercises.", "2 weeks"),
          topic("cyber-hardening", "System Hardening", "Reduce attack surface with safer configurations and updates.", "1 week"),
          topic("cyber-reporting", "Incident Documentation", "Write clear notes, findings, and remediation steps.", "1 week")
        ]
      }
    ],
    "Cloud Computing": [
      {
        phase: "Phase 1: Cloud Foundations",
        topics: [
          topic("cloud-basics", "Cloud Concepts", "Learn IaaS, PaaS, SaaS, elasticity, and shared responsibility.", "1 week"),
          topic("cloud-networking", "Cloud Networking", "Understand regions, zones, VPCs, subnets, and internet access.", "1 week"),
          topic("cloud-storage", "Cloud Storage", "Compare object, block, and file storage use cases.", "1 week")
        ]
      },
      {
        phase: "Phase 2: Core Services",
        topics: [
          topic("cloud-compute", "Compute Services", "Use virtual machines, containers, and serverless ideas appropriately.", "2 weeks"),
          topic("cloud-databases", "Managed Databases", "Explore relational, NoSQL, backups, and availability concerns.", "1 week"),
          topic("cloud-security", "Cloud Security", "Apply IAM, least privilege, and secure architecture basics.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Deployment Skills",
        topics: [
          topic("cloud-monitoring", "Monitoring and Logging", "Track health, metrics, and operational signals in production.", "1 week"),
          topic("cloud-devops", "CI/CD and Automation", "Understand deployment pipelines and repeatable infrastructure.", "1 week"),
          topic("cloud-projects", "Cloud Projects", "Deploy real applications and document architecture decisions.", "2 weeks")
        ]
      }
    ],
    "UI/UX Design": [
      {
        phase: "Phase 1: Design Thinking",
        topics: [
          topic("uiux-principles", "Visual Design Principles", "Study hierarchy, balance, contrast, alignment, and spacing.", "1 week"),
          topic("uiux-ux-basics", "UX Foundations", "Understand user goals, pain points, and interaction clarity.", "1 week"),
          topic("uiux-research", "User Research Basics", "Gather insight through interviews, observation, and feedback.", "1 week")
        ]
      },
      {
        phase: "Phase 2: Interface Craft",
        topics: [
          topic("uiux-wireframes", "Wireframing", "Sketch low-fidelity flows before visual polish.", "1 week"),
          topic("uiux-components", "Design Systems", "Create reusable components, tokens, and consistent patterns.", "2 weeks"),
          topic("uiux-prototyping", "Prototyping", "Build interactive flows and validate navigation decisions.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Product Readiness",
        topics: [
          topic("uiux-accessibility", "Accessibility", "Design for readability, contrast, focus states, and inclusive UX.", "1 week"),
          topic("uiux-handoff", "Developer Handoff", "Document spacing, states, and behavior clearly for implementation.", "1 week"),
          topic("uiux-case-study", "Portfolio Case Study", "Present process, decisions, and measurable outcomes.", "2 weeks")
        ]
      }
    ],
    "Python Programming": [
      {
        phase: "Phase 1: Python Foundations",
        topics: [
          topic("python-syntax", "Syntax and Variables", "Learn Python syntax, data types, input, output, and operators.", "1 week"),
          topic("python-control-flow", "Control Flow", "Use conditions, loops, and basic problem solving.", "1 week"),
          topic("python-functions", "Functions and Modules", "Write reusable logic and organize code into modules.", "1 week")
        ]
      },
      {
        phase: "Phase 2: Data and OOP",
        topics: [
          topic("python-collections", "Lists, Tuples, Dictionaries, Sets", "Use built-in data structures effectively.", "2 weeks"),
          topic("python-oop", "Object-Oriented Programming", "Understand classes, objects, inheritance, and encapsulation.", "2 weeks"),
          topic("python-files", "File Handling", "Read and write files safely and clearly.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Applied Python",
        topics: [
          topic("python-exceptions", "Exceptions and Debugging", "Handle errors and diagnose common issues.", "1 week"),
          topic("python-libraries", "Useful Libraries", "Work with standard modules and practical utility packages.", "1 week"),
          topic("python-projects", "Mini Projects", "Build scripts and small applications to reinforce fluency.", "2 weeks")
        ]
      }
    ],
    "Java Programming": [
      {
        phase: "Phase 1: Java Core",
        topics: [
          topic("java-syntax", "Java Syntax and Data Types", "Learn classes, methods, variables, and type system basics.", "1 week"),
          topic("java-control-flow", "Control Flow and Loops", "Practice conditions, loops, and method design.", "1 week"),
          topic("java-oop-basics", "OOP Fundamentals", "Understand class design, objects, and constructors.", "2 weeks")
        ]
      },
      {
        phase: "Phase 2: Intermediate Java",
        topics: [
          topic("java-inheritance", "Inheritance and Polymorphism", "Reuse behavior while keeping designs maintainable.", "1 week"),
          topic("java-collections", "Collections Framework", "Use lists, sets, maps, and iteration patterns.", "2 weeks"),
          topic("java-exceptions", "Exceptions and File Handling", "Write safer programs with explicit error handling.", "1 week")
        ]
      },
      {
        phase: "Phase 3: Practical Java",
        topics: [
          topic("java-dsa", "Java for DSA", "Use Java effectively in problem solving and interviews.", "1 week"),
          topic("java-multithreading", "Multithreading Basics", "Understand concurrency concepts at an introductory level.", "1 week"),
          topic("java-projects", "Project Building", "Create console or GUI apps that consolidate your learning.", "2 weeks")
        ]
      }
    ]
  };

  const studyMaterials = {
    html: {
      explanation: "HTML gives structure to web pages through semantic elements that describe content meaning, not just appearance.",
      keyConcepts: ["Semantic tags", "Forms", "Accessibility", "Document structure"],
      mistakes: ["Using div for everything", "Skipping labels on inputs", "Ignoring heading hierarchy"],
      analogy: "HTML is like the architectural blueprint of a building. It decides where each room exists before decoration starts.",
      codeExample: "<form><label for=\"email\">Email</label><input id=\"email\" type=\"email\" required></form>"
    },
    css: {
      explanation: "CSS controls presentation, spacing, visual hierarchy, and responsive behavior so interfaces feel intentional and usable.",
      keyConcepts: ["Box model", "Flexbox", "Grid", "Responsive design"],
      mistakes: ["Overusing fixed widths", "Ignoring mobile screens", "Using random colors without a system"],
      analogy: "If HTML is the blueprint, CSS is the interior design and layout system that makes the space attractive and functional.",
      codeExample: ".card { display: grid; gap: 16px; padding: 24px; border-radius: 20px; }"
    },
    javascript: {
      explanation: "JavaScript adds behavior and logic to web apps, allowing them to respond to user actions and dynamic data.",
      keyConcepts: ["Variables", "Functions", "Events", "DOM manipulation", "Async workflows"],
      mistakes: ["Mutating state carelessly", "Forgetting null checks", "Blocking UI with tangled logic"],
      analogy: "JavaScript is the control room operator that listens to signals and decides what should happen next.",
      codeExample: "button.addEventListener('click', () => { message.textContent = 'Saved successfully'; });"
    },
    python: {
      explanation: "Python is a readable, general-purpose language used for automation, analysis, backend logic, scripting, and machine learning.",
      keyConcepts: ["Indentation", "Functions", "Lists and dictionaries", "Loops", "Modules"],
      mistakes: ["Mixing tabs and spaces", "Forgetting list mutability behavior", "Ignoring exception handling"],
      analogy: "Python is like a well-organized notebook where simple syntax lets you focus on problem solving instead of ceremony.",
      codeExample: "scores = [80, 90, 70]\naverage = sum(scores) / len(scores)\nprint(average)"
    },
    machineLearning: {
      explanation: "Machine learning teaches systems to detect patterns from data and make predictions or decisions without manually defining every rule.",
      keyConcepts: ["Training data", "Features", "Labels", "Overfitting", "Evaluation metrics"],
      mistakes: ["Training on noisy or biased data", "Ignoring validation", "Using accuracy alone on imbalanced data"],
      analogy: "It is like teaching with examples instead of giving a full rulebook. Better examples usually lead to better understanding.",
      codeExample: "model.fit(X_train, y_train)\npredictions = model.predict(X_test)"
    },
    dataScience: {
      explanation: "Data science combines analysis, statistics, and communication to turn raw data into useful decisions and stories.",
      keyConcepts: ["Cleaning data", "EDA", "Visualization", "Statistics", "Storytelling"],
      mistakes: ["Skipping data cleaning", "Showing charts without context", "Assuming correlation means causation"],
      analogy: "Data science is like investigating a case where the clues are scattered across rows and columns.",
      codeExample: "summary = df.groupby('category')['sales'].mean()"
    },
    dsa: {
      explanation: "Data structures and algorithms help you model information well and solve problems efficiently under constraints.",
      keyConcepts: ["Complexity", "Arrays", "Recursion", "Hashing", "Trees", "Dynamic programming"],
      mistakes: ["Coding before planning", "Ignoring edge cases", "Choosing inefficient structures by habit"],
      analogy: "It is like packing for a trip. The right bag and organization make everything easier to access and manage.",
      codeExample: "const seen = new Set();\nfor (const value of arr) {\n  if (seen.has(value)) return true;\n  seen.add(value);\n}"
    },
    java: {
      explanation: "Java is a strongly typed, object-oriented language widely used in enterprise software, Android foundations, and problem solving.",
      keyConcepts: ["Classes", "Objects", "Inheritance", "Collections", "Exceptions"],
      mistakes: ["Confusing primitive and reference types", "Ignoring access modifiers", "Forgetting to close resources"],
      analogy: "Java is like a well-regulated workshop where every tool has a defined place and type.",
      codeExample: "List<Integer> nums = new ArrayList<>();\nnums.add(10);\nSystem.out.println(nums.size());"
    },
    cybersecurity: {
      explanation: "Cybersecurity focuses on protecting systems, networks, and data from unauthorized access, abuse, and disruption.",
      keyConcepts: ["CIA triad", "Authentication", "Encryption", "Network security", "Vulnerability management"],
      mistakes: ["Treating security as only tools", "Weak password habits", "Ignoring updates and least privilege"],
      analogy: "Cybersecurity is like protecting a building with strong locks, cameras, guards, and clear visitor rules.",
      codeExample: "Use parameterized queries and hashed passwords instead of storing raw credentials."
    },
    cloudComputing: {
      explanation: "Cloud computing delivers infrastructure and software services on demand so teams can scale faster and reduce manual setup.",
      keyConcepts: ["IaaS", "PaaS", "SaaS", "Scalability", "Availability", "IAM"],
      mistakes: ["Ignoring cost management", "Overprovisioning resources", "Using broad permissions"],
      analogy: "Instead of building your own power plant, cloud services let you pay for electricity as you use it.",
      codeExample: "Deploy an app to a managed service, attach a database, and monitor logs from a web dashboard."
    },
    database: {
      explanation: "Databases store and retrieve structured information efficiently so applications can manage persistent data reliably.",
      keyConcepts: ["Tables", "Primary keys", "Joins", "Indexes", "Normalization"],
      mistakes: ["Skipping indexes on heavy queries", "Storing duplicate data carelessly", "Writing unsafe SQL"],
      analogy: "A database is like a smart digital library with shelves, labels, and search rules for fast retrieval.",
      codeExample: "SELECT name, score FROM students WHERE score > 80 ORDER BY score DESC;"
    },
    git: {
      explanation: "Git tracks code changes over time so you can collaborate, experiment safely, and roll forward with confidence.",
      keyConcepts: ["Commit", "Branch", "Merge", "Pull request", "Remote repository"],
      mistakes: ["Working directly on main", "Large unreviewed commits", "Pulling without understanding conflicts"],
      analogy: "Git is like a time machine with labeled checkpoints and parallel timelines for experimentation.",
      codeExample: "git checkout -b feature/dashboard\n git add .\n git commit -m \"Add dashboard layout\""
    }
  };

  const quizQuestions = {
    "Web Development": [
      question("What does semantic HTML improve the most?", ["Database speed", "Meaning and accessibility of content", "Internet connection stability", "Image compression"], 1, "Semantic elements help browsers, assistive technologies, and developers understand the structure of content.", "Semantic HTML"),
      question("Which CSS layout system is best for two-dimensional page layouts?", ["Float", "Inline-block", "Flexbox", "Grid"], 3, "CSS Grid is designed for rows and columns together, making it strong for two-dimensional layout work.", "CSS Layout"),
      question("What does the DOM represent?", ["A database object model", "The browser memory limit", "The page structure as objects", "A CSS rendering engine"], 2, "The Document Object Model represents the HTML document as a tree of objects that JavaScript can manipulate.", "DOM"),
      question("Which JavaScript feature helps work with delayed API data more cleanly?", ["switch", "async and await", "typeof", "break"], 1, "Async and await make asynchronous code easier to read and reason about than chained callbacks.", "Async JavaScript"),
      question("Why are media queries used?", ["To store video", "To encrypt forms", "To adapt design across screen sizes", "To connect APIs"], 2, "Media queries apply styles conditionally, often based on viewport size for responsive design.", "Responsive Design")
    ],
    Python: [
      question("Which data type stores key-value pairs in Python?", ["List", "Tuple", "Dictionary", "Set"], 2, "A dictionary stores data as key-value pairs for fast lookup by key.", "Python Collections"),
      question("What does indentation control in Python?", ["Only comments", "Program structure and code blocks", "Variable names", "Internet requests"], 1, "Python uses indentation to define blocks for loops, functions, conditionals, and classes.", "Python Syntax"),
      question("What is the output type of range(5) in modern Python?", ["Tuple", "List", "Set", "Range object"], 3, "range returns a range object that can be iterated over efficiently without building a list immediately.", "Python Iteration"),
      question("Which keyword is used to define a function?", ["func", "define", "def", "lambda"], 2, "Python functions are declared with the def keyword.", "Functions"),
      question("Why would you use try and except?", ["To speed up loops", "To define classes", "To handle runtime errors gracefully", "To import libraries"], 2, "try and except let you respond to exceptions without crashing the entire program.", "Exceptions")
    ],
    "Machine Learning": [
      question("What is overfitting?", ["A model failing to learn anything", "A model memorizing training data too closely", "A model using too little data", "A model with no labels"], 1, "Overfitting happens when a model performs well on training data but poorly on unseen data.", "Model Evaluation"),
      question("Which task is a classification problem?", ["Predicting tomorrow's temperature", "Grouping customers with no labels", "Predicting house price", "Identifying if an email is spam"], 3, "Spam detection predicts discrete labels, which makes it a classification task.", "ML Problem Types"),
      question("Why do we split data into training and testing sets?", ["To reduce file size", "To compare compiler speed", "To evaluate generalization", "To change the algorithm type"], 2, "The split helps estimate how well the model will perform on unseen data.", "Validation"),
      question("Which metric is often more useful than accuracy on imbalanced classification?", ["Precision and recall", "Mean only", "Randomness score", "Memory usage"], 0, "Precision and recall reveal class-specific performance when one class dominates the dataset.", "Evaluation Metrics"),
      question("What is a feature in ML?", ["The final prediction only", "An input variable used by the model", "The deployment server", "A chart title"], 1, "Features are the input attributes a model uses to learn patterns.", "Features")
    ],
    "Data Science": [
      question("What is the main goal of exploratory data analysis?", ["Compile code faster", "Discover patterns and issues in data", "Deploy mobile apps", "Create firewalls"], 1, "EDA helps you understand data shape, quality, distributions, and possible relationships before deeper modeling.", "EDA"),
      question("Which chart is commonly used to show a distribution?", ["Pie chart", "Histogram", "Radar chart", "Flowchart"], 1, "Histograms help visualize how values are distributed across bins.", "Visualization"),
      question("Why is missing-data handling important?", ["It always increases accuracy", "It prevents misleading analysis and broken workflows", "It removes the need for cleaning", "It only matters for videos"], 1, "Missing values can distort metrics, break transformations, and mislead conclusions.", "Data Cleaning"),
      question("What does correlation describe?", ["Guaranteed causation", "A packaging method", "Relationship strength between variables", "Only data volume"], 2, "Correlation measures how variables move together, but it does not prove causation.", "Statistics"),
      question("Which language is commonly used alongside Python in data work?", ["HTML", "SQL", "CSS", "PHP"], 1, "SQL is heavily used for querying, aggregating, and extracting structured data.", "SQL")
    ],
    DSA: [
      question("What is the time complexity of binary search on a sorted array?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Binary search halves the search space each step, giving logarithmic time complexity.", "Binary Search"),
      question("Which data structure is best for LIFO behavior?", ["Queue", "Graph", "Stack", "Heap"], 2, "A stack follows Last In, First Out behavior.", "Stack"),
      question("What does hashing commonly help with?", ["Sorting audio", "Fast lookup and frequency counting", "Rendering CSS", "Drawing charts"], 1, "Hash maps are useful for quick lookup, counting, and membership checks.", "Hashing"),
      question("Why is dynamic programming effective?", ["It avoids all loops", "It uses overlapping subproblems and stored results", "It requires no base cases", "It always uses trees"], 1, "Dynamic programming saves results of smaller subproblems to avoid repeated work.", "Dynamic Programming"),
      question("Which traversal uses a queue in trees?", ["Depth-first search", "Breadth-first search", "Inorder only", "Postorder only"], 1, "Breadth-first search typically uses a queue to visit nodes level by level.", "Trees")
    ],
    Java: [
      question("Which principle allows one interface with many implementations?", ["Encapsulation", "Polymorphism", "Compilation", "Serialization"], 1, "Polymorphism lets the same method call behave differently depending on the object's actual type.", "OOP"),
      question("Which collection does not allow duplicate elements?", ["ArrayList", "HashMap", "HashSet", "LinkedList"], 2, "A set stores unique values and rejects duplicates.", "Collections"),
      question("What is the entry point of a Java application?", ["run()", "public static void main(String[] args)", "start()", "init()"], 1, "The JVM looks for the main method as the standard entry point.", "Java Syntax"),
      question("Why are exceptions useful?", ["They replace variables", "They make code shorter automatically", "They provide structured error handling", "They remove compilation"], 2, "Exceptions help programs react to unusual runtime conditions in a controlled way.", "Exceptions"),
      question("What does inheritance enable?", ["Deleting methods", "Code reuse and hierarchical design", "SQL querying", "Dynamic typing"], 1, "Inheritance lets subclasses reuse and extend behavior from parent classes.", "Inheritance")
    ],
    Cybersecurity: [
      question("What does the CIA triad stand for?", ["Code, Internet, Access", "Confidentiality, Integrity, Availability", "Control, Identity, Authentication", "Cache, Input, Authorization"], 1, "The CIA triad is a foundational security model covering confidentiality, integrity, and availability.", "Security Fundamentals"),
      question("Which attack injects malicious script into web pages viewed by users?", ["DDoS", "XSS", "Brute force DNS", "ARP only"], 1, "Cross-site scripting allows malicious scripts to run in a victim's browser.", "Web Security"),
      question("Why is least privilege important?", ["It increases UI animation", "It gives every user admin access", "It limits damage by restricting permissions", "It speeds up downloads"], 2, "Least privilege reduces risk by giving only the access necessary for a role.", "Access Control"),
      question("What is hashing mainly used for?", ["Reversible encryption", "Password storage verification and integrity checks", "Video compression", "Wi-Fi scanning"], 1, "Hashing is one-way and commonly used for verifying integrity and storing password proofs.", "Cryptography"),
      question("Which tool category inspects network packets?", ["Spreadsheet software", "Packet analyzer", "Slide editor", "Compiler"], 1, "Packet analyzers help observe traffic, protocols, and troubleshooting details on a network.", "Networking")
    ],
    "Cloud Computing": [
      question("What does IaaS provide?", ["Only design templates", "Managed user interviews", "Virtualized infrastructure resources", "Only source control"], 2, "Infrastructure as a Service offers compute, storage, and networking building blocks.", "Cloud Models"),
      question("Which cloud concept means scaling resources up or down as needed?", ["Latency", "Elasticity", "Hardcoding", "Hashing"], 1, "Elasticity is the ability to adjust resources dynamically based on demand.", "Scalability"),
      question("What is IAM used for?", ["Animating UI", "Managing identity and access permissions", "Compressing logs", "Building databases only"], 1, "IAM controls who can access what and under which conditions.", "Cloud Security"),
      question("Which service model abstracts away server management the most?", ["IaaS", "PaaS", "On-prem only", "Manual hosting"], 1, "Platform as a Service hides more infrastructure concerns so teams can focus more on application development.", "Service Models"),
      question("Why are regions and availability zones used?", ["Only for naming", "To improve resilience and locality", "To store passwords", "To replace backups"], 1, "They help distribute workloads for reliability, disaster recovery, and lower latency.", "Cloud Architecture")
    ],
    Database: [
      question("What is a primary key?", ["A repeated value", "A styling attribute", "A unique identifier for a row", "A backup file"], 2, "A primary key uniquely identifies each row in a table.", "Database Basics"),
      question("Which SQL clause filters rows?", ["ORDER BY", "WHERE", "GROUP BY", "JOIN"], 1, "WHERE filters rows based on conditions before final output.", "SQL Filtering"),
      question("Why are indexes used?", ["To add emojis", "To speed up query lookups", "To encrypt tables", "To avoid backups"], 1, "Indexes help the database locate data more efficiently for certain queries.", "Indexes"),
      question("What does a JOIN do?", ["Deletes all rows", "Combines related data from multiple tables", "Creates CSS layouts", "Compiles Java"], 1, "JOINs let you bring together rows from different tables based on a shared relationship.", "Joins"),
      question("What is normalization mainly about?", ["Making fonts bigger", "Reducing redundancy and improving structure", "Adding cloud servers", "Replacing queries with loops"], 1, "Normalization organizes data to reduce duplication and improve consistency.", "Schema Design")
    ],
    "Git": [
      question("What does git commit do?", ["Uploads automatically to production", "Saves a snapshot of staged changes", "Deletes the branch", "Resets the repository"], 1, "A commit records staged changes as a named snapshot in your local repository.", "Git Basics"),
      question("Why use branches?", ["To slow collaboration", "To work on changes in isolation", "To replace repositories", "To remove version history"], 1, "Branches let you develop features or fixes separately without affecting the main line immediately.", "Branching"),
      question("What does git pull typically do?", ["Deletes the remote", "Downloads and integrates remote changes", "Creates a new repo", "Compiles code"], 1, "git pull fetches updates from a remote and then merges or rebases them into the current branch.", "Remote Workflow"),
      question("What is a merge conflict?", ["A CSS bug only", "A hardware issue", "A situation where Git cannot automatically reconcile overlapping changes", "A missing browser tab"], 2, "Conflicts happen when changes overlap in a way Git needs a human to resolve.", "Collaboration"),
      question("Why are small commits recommended?", ["They reduce internet use only", "They make review and debugging easier", "They remove the need for branches", "They prevent syntax errors automatically"], 1, "Small, focused commits are easier to understand, review, and revert when necessary.", "Git Hygiene")
    ]
  };

  const resources = {
    "Web Development": {
      youtubeChannels: [
        { name: "Traversy Media", bestFor: "Frontend and full-stack web fundamentals", link: "https://www.youtube.com/@TraversyMedia" },
        { name: "The Net Ninja", bestFor: "Structured web dev playlists and practical walkthroughs", link: "https://www.youtube.com/@NetNinja" },
        { name: "Kevin Powell", bestFor: "Modern CSS, layouts, and UI polish", link: "https://www.youtube.com/@KevinPowell" },
        { name: "freeCodeCamp.org", bestFor: "Long-form beginner-to-intermediate tutorials", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "MDN Web Docs", type: "Documentation", badge: "Free", link: "https://developer.mozilla.org/" },
        { name: "freeCodeCamp", type: "Interactive Learning", badge: "Free", link: "https://www.freecodecamp.org/" },
        { name: "Frontend Mentor", type: "Practice", badge: "Free/Paid", link: "https://www.frontendmentor.io/" },
        { name: "CSS-Tricks", type: "Articles", badge: "Free", link: "https://css-tricks.com/" },
        { name: "Scrimba", type: "Interactive Courses", badge: "Free/Paid", link: "https://scrimba.com/" }
      ],
      freeCourses: [
        { name: "Responsive Web Design", platform: "freeCodeCamp", duration: "300 hours", difficulty: "Beginner", link: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
        { name: "JavaScript Algorithms and Data Structures", platform: "freeCodeCamp", duration: "300 hours", difficulty: "Beginner", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/" },
        { name: "Web Development for Beginners", platform: "Microsoft Learn", duration: "12 weeks", difficulty: "Beginner", link: "https://github.com/microsoft/Web-Dev-For-Beginners" }
      ]
    },
    "Python Programming": {
      youtubeChannels: [
        { name: "Corey Schafer", bestFor: "Clear Python fundamentals and practical examples", link: "https://www.youtube.com/@coreyms" },
        { name: "Programming with Mosh", bestFor: "Beginner-friendly Python overviews", link: "https://www.youtube.com/@programmingwithmosh" },
        { name: "freeCodeCamp.org", bestFor: "Long-form Python crash courses", link: "https://www.youtube.com/@freecodecamp" },
        { name: "Tech With Tim", bestFor: "Python projects and progression after basics", link: "https://www.youtube.com/@TechWithTim" }
      ],
      websites: [
        { name: "Python Docs", type: "Documentation", badge: "Free", link: "https://docs.python.org/3/" },
        { name: "Real Python", type: "Articles", badge: "Free/Paid", link: "https://realpython.com/" },
        { name: "W3Schools Python", type: "Tutorial", badge: "Free", link: "https://www.w3schools.com/python/" },
        { name: "Exercism Python", type: "Practice", badge: "Free", link: "https://exercism.org/tracks/python" },
        { name: "GeeksforGeeks Python", type: "Reference", badge: "Free", link: "https://www.geeksforgeeks.org/python-programming-language/" }
      ],
      freeCourses: [
        { name: "Python for Everybody", platform: "Coursera", duration: "Approx. 2 months", difficulty: "Beginner", link: "https://www.coursera.org/specializations/python" },
        { name: "Scientific Computing with Python", platform: "freeCodeCamp", duration: "300 hours", difficulty: "Beginner", link: "https://www.freecodecamp.org/learn/scientific-computing-with-python/" },
        { name: "Python Basics", platform: "SoloLearn", duration: "Self-paced", difficulty: "Beginner", link: "https://www.sololearn.com/" }
      ]
    },
    "Machine Learning": {
      youtubeChannels: [
        { name: "Krish Naik", bestFor: "Applied ML concepts and end-to-end intuition", link: "https://www.youtube.com/@krishnaik06" },
        { name: "StatQuest with Josh Starmer", bestFor: "Statistics and ML theory made approachable", link: "https://www.youtube.com/@statquest" },
        { name: "Andrew Ng", bestFor: "Conceptual ML foundations", link: "https://www.youtube.com/@AndrewNg" },
        { name: "freeCodeCamp.org", bestFor: "Long ML tutorials and coding walkthroughs", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "Scikit-learn Docs", type: "Documentation", badge: "Free", link: "https://scikit-learn.org/stable/" },
        { name: "Kaggle", type: "Practice Community", badge: "Free", link: "https://www.kaggle.com/" },
        { name: "Google Machine Learning Crash Course", type: "Course Hub", badge: "Free", link: "https://developers.google.com/machine-learning/crash-course" },
        { name: "Papers with Code", type: "Research + Implementations", badge: "Free", link: "https://paperswithcode.com/" },
        { name: "DeepLearning.AI", type: "Courses", badge: "Free/Paid", link: "https://www.deeplearning.ai/" }
      ],
      freeCourses: [
        { name: "Machine Learning Crash Course", platform: "Google", duration: "15 hours", difficulty: "Beginner", link: "https://developers.google.com/machine-learning/crash-course" },
        { name: "Intro to Machine Learning", platform: "Kaggle", duration: "7 hours", difficulty: "Beginner", link: "https://www.kaggle.com/learn/intro-to-machine-learning" },
        { name: "AI For Everyone", platform: "Coursera", duration: "Approx. 6 hours", difficulty: "Beginner", link: "https://www.coursera.org/learn/ai-for-everyone" }
      ]
    },
    "Data Science": {
      youtubeChannels: [
        { name: "Alex The Analyst", bestFor: "Beginner data projects and analytics careers", link: "https://www.youtube.com/@AlexTheAnalyst" },
        { name: "Ken Jee", bestFor: "Data science career insight and project building", link: "https://www.youtube.com/@KenJee1" },
        { name: "Data School", bestFor: "Pandas, ML, and practical analysis", link: "https://www.youtube.com/@dataschool" },
        { name: "freeCodeCamp.org", bestFor: "Full data science tutorials", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "Kaggle", type: "Datasets and Practice", badge: "Free", link: "https://www.kaggle.com/" },
        { name: "Pandas Docs", type: "Documentation", badge: "Free", link: "https://pandas.pydata.org/docs/" },
        { name: "DataCamp", type: "Interactive Learning", badge: "Free/Paid", link: "https://www.datacamp.com/" },
        { name: "Towards Data Science", type: "Articles", badge: "Free/Paid", link: "https://towardsdatascience.com/" },
        { name: "Google Colab", type: "Notebook Platform", badge: "Free", link: "https://colab.research.google.com/" }
      ],
      freeCourses: [
        { name: "Data Analysis with Python", platform: "freeCodeCamp", duration: "300 hours", difficulty: "Beginner", link: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
        { name: "Python for Data Science", platform: "IBM Cognitive Class", duration: "Self-paced", difficulty: "Beginner", link: "https://cognitiveclass.ai/" },
        { name: "Intro to Data Visualization", platform: "Kaggle", duration: "5 hours", difficulty: "Beginner", link: "https://www.kaggle.com/learn/data-visualization" }
      ]
    },
    "DSA & Algorithms": {
      youtubeChannels: [
        { name: "take U forward", bestFor: "Interview-focused DSA roadmaps and explanations", link: "https://www.youtube.com/@takeUforward" },
        { name: "Abdul Bari", bestFor: "Algorithm theory and core DSA clarity", link: "https://www.youtube.com/@abdul_bari" },
        { name: "NeetCode", bestFor: "Curated interview question walkthroughs", link: "https://www.youtube.com/@NeetCode" },
        { name: "freeCodeCamp.org", bestFor: "Long-form DSA tutorials", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "LeetCode", type: "Practice", badge: "Free/Paid", link: "https://leetcode.com/" },
        { name: "GeeksforGeeks", type: "Reference and Practice", badge: "Free/Paid", link: "https://www.geeksforgeeks.org/" },
        { name: "Codeforces", type: "Competitive Platform", badge: "Free", link: "https://codeforces.com/" },
        { name: "CodeChef", type: "Competitive Platform", badge: "Free", link: "https://www.codechef.com/" },
        { name: "HackerRank", type: "Practice", badge: "Free/Paid", link: "https://www.hackerrank.com/" }
      ],
      freeCourses: [
        { name: "Algorithms, Part I", platform: "Coursera", duration: "Approx. 6 weeks", difficulty: "Intermediate", link: "https://www.coursera.org/learn/algorithms-part1" },
        { name: "Data Structures", platform: "NPTEL", duration: "8 weeks", difficulty: "Intermediate", link: "https://nptel.ac.in/" },
        { name: "Data Structures Easy to Advanced", platform: "Udemy Free/Paid Listing", duration: "Varies", difficulty: "Beginner", link: "https://www.udemy.com/" }
      ]
    },
    "Android Development": {
      youtubeChannels: [
        { name: "Philipp Lackner", bestFor: "Modern Android app architecture and Kotlin", link: "https://www.youtube.com/@PhilippLackner" },
        { name: "Coding in Flow", bestFor: "Android beginner concepts", link: "https://www.youtube.com/@codinginflow" },
        { name: "Android Developers", bestFor: "Official guidance and platform updates", link: "https://www.youtube.com/@AndroidDevelopers" },
        { name: "freeCodeCamp.org", bestFor: "Long Android courses", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "Android Developers", type: "Official Docs", badge: "Free", link: "https://developer.android.com/" },
        { name: "Kotlin Docs", type: "Documentation", badge: "Free", link: "https://kotlinlang.org/docs/home.html" },
        { name: "GeeksforGeeks Android", type: "Tutorials", badge: "Free", link: "https://www.geeksforgeeks.org/android-tutorial/" },
        { name: "RayWenderlich/Kodeco", type: "Tutorials", badge: "Free/Paid", link: "https://www.kodeco.com/android" },
        { name: "Stack Overflow", type: "Community Q&A", badge: "Free", link: "https://stackoverflow.com/" }
      ],
      freeCourses: [
        { name: "Android Basics in Kotlin", platform: "Google", duration: "Self-paced", difficulty: "Beginner", link: "https://developer.android.com/courses/android-basics-kotlin/course" },
        { name: "Developing Android Apps with Kotlin", platform: "Udacity", duration: "Self-paced", difficulty: "Intermediate", link: "https://www.udacity.com/course/developing-android-apps-with-kotlin--ud9012" },
        { name: "Kotlin for Java Developers", platform: "Coursera", duration: "Approx. 4 weeks", difficulty: "Beginner", link: "https://www.coursera.org/learn/kotlin-for-java-developers" }
      ]
    },
    Cybersecurity: {
      youtubeChannels: [
        { name: "John Hammond", bestFor: "CTFs, labs, and cybersecurity walkthroughs", link: "https://www.youtube.com/@_JohnHammond" },
        { name: "NetworkChuck", bestFor: "Beginner-friendly security and networking motivation", link: "https://www.youtube.com/@NetworkChuck" },
        { name: "HackerSploit", bestFor: "Ethical hacking concepts and tools", link: "https://www.youtube.com/@HackerSploit" },
        { name: "Professor Messer", bestFor: "Certification-oriented security basics", link: "https://www.youtube.com/@professormesser" }
      ],
      websites: [
        { name: "OWASP", type: "Security Reference", badge: "Free", link: "https://owasp.org/" },
        { name: "TryHackMe", type: "Hands-on Labs", badge: "Free/Paid", link: "https://tryhackme.com/" },
        { name: "Hack The Box", type: "Practice Labs", badge: "Free/Paid", link: "https://www.hackthebox.com/" },
        { name: "PortSwigger Web Security Academy", type: "Training", badge: "Free", link: "https://portswigger.net/web-security" },
        { name: "Cybrary", type: "Learning Platform", badge: "Free/Paid", link: "https://www.cybrary.it/" }
      ],
      freeCourses: [
        { name: "Pre Security", platform: "TryHackMe", duration: "Self-paced", difficulty: "Beginner", link: "https://tryhackme.com/path/outline/presecurity" },
        { name: "Introduction to Cyber Security", platform: "Cisco Networking Academy", duration: "6 hours", difficulty: "Beginner", link: "https://www.netacad.com/" },
        { name: "OWASP Top 10", platform: "OWASP", duration: "Self-paced", difficulty: "Beginner", link: "https://owasp.org/www-project-top-ten/" }
      ]
    },
    "Cloud Computing": {
      youtubeChannels: [
        { name: "freeCodeCamp.org", bestFor: "Long cloud certification and platform tutorials", link: "https://www.youtube.com/@freecodecamp" },
        { name: "TechWorld with Nana", bestFor: "Cloud and DevOps concepts with visual clarity", link: "https://www.youtube.com/@TechWorldwithNana" },
        { name: "AWS", bestFor: "Official AWS concepts and exam prep content", link: "https://www.youtube.com/@amazonwebservices" },
        { name: "Google Cloud Tech", bestFor: "Official GCP architecture and services", link: "https://www.youtube.com/@googlecloudtech" }
      ],
      websites: [
        { name: "AWS Skill Builder", type: "Training", badge: "Free/Paid", link: "https://skillbuilder.aws/" },
        { name: "Microsoft Learn Azure", type: "Training", badge: "Free", link: "https://learn.microsoft.com/training/azure/" },
        { name: "Google Cloud Skills Boost", type: "Labs", badge: "Free/Paid", link: "https://www.cloudskillsboost.google/" },
        { name: "Cloud Academy", type: "Courses", badge: "Paid", link: "https://cloudacademy.com/" },
        { name: "DigitalOcean Community", type: "Tutorials", badge: "Free", link: "https://www.digitalocean.com/community/tutorials" }
      ],
      freeCourses: [
        { name: "AWS Cloud Practitioner Essentials", platform: "AWS", duration: "6 hours", difficulty: "Beginner", link: "https://www.aws.training/" },
        { name: "Azure Fundamentals Learning Path", platform: "Microsoft Learn", duration: "Self-paced", difficulty: "Beginner", link: "https://learn.microsoft.com/training/paths/azure-fundamentals/" },
        { name: "Google Cloud Computing Foundations", platform: "Google Cloud Skills Boost", duration: "Self-paced", difficulty: "Beginner", link: "https://www.cloudskillsboost.google/" }
      ]
    },
    "Java Programming": {
      youtubeChannels: [
        { name: "Telusko", bestFor: "Java core concepts and practical coding", link: "https://www.youtube.com/@Telusko" },
        { name: "Bro Code", bestFor: "Fast beginner-friendly Java walkthroughs", link: "https://www.youtube.com/@BroCodez" },
        { name: "Java Brains", bestFor: "Clear Java and Spring fundamentals", link: "https://www.youtube.com/@Java.Brains" },
        { name: "freeCodeCamp.org", bestFor: "Long Java courses", link: "https://www.youtube.com/@freecodecamp" }
      ],
      websites: [
        { name: "Oracle Java Docs", type: "Documentation", badge: "Free", link: "https://docs.oracle.com/en/java/" },
        { name: "Baeldung", type: "Articles", badge: "Free/Paid", link: "https://www.baeldung.com/" },
        { name: "GeeksforGeeks Java", type: "Reference", badge: "Free", link: "https://www.geeksforgeeks.org/java/" },
        { name: "W3Schools Java", type: "Tutorial", badge: "Free", link: "https://www.w3schools.com/java/" },
        { name: "Exercism Java", type: "Practice", badge: "Free", link: "https://exercism.org/tracks/java" }
      ],
      freeCourses: [
        { name: "Java Programming and Software Engineering Fundamentals", platform: "Coursera", duration: "Approx. 5 months", difficulty: "Beginner", link: "https://www.coursera.org/specializations/java-programming" },
        { name: "Learn Java", platform: "Codecademy", duration: "Self-paced", difficulty: "Beginner", link: "https://www.codecademy.com/learn/learn-java" },
        { name: "Object Oriented Programming in Java", platform: "Coursera", duration: "Approx. 4 weeks", difficulty: "Intermediate", link: "https://www.coursera.org/learn/object-oriented-java" }
      ]
    },
    "UI/UX Design": {
      youtubeChannels: [
        { name: "DesignCourse", bestFor: "UI critique, Figma, and interface polish", link: "https://www.youtube.com/@DesignCourse" },
        { name: "Flux Academy", bestFor: "Design thinking and product presentation", link: "https://www.youtube.com/@FluxAcademy" },
        { name: "AJ&Smart", bestFor: "UX processes and workshop methods", link: "https://www.youtube.com/@AJSmart" },
        { name: "Mizko", bestFor: "Portfolio, UX strategy, and product design skills", link: "https://www.youtube.com/@Mizko" }
      ],
      websites: [
        { name: "Figma Learn", type: "Official Learning", badge: "Free", link: "https://help.figma.com/hc/en-us/categories/360002051613" },
        { name: "Nielsen Norman Group", type: "UX Articles", badge: "Free/Paid", link: "https://www.nngroup.com/" },
        { name: "Laws of UX", type: "Reference", badge: "Free", link: "https://lawsofux.com/" },
        { name: "Mobbin", type: "Inspiration", badge: "Free/Paid", link: "https://mobbin.com/" },
        { name: "Dribbble", type: "Inspiration", badge: "Free/Paid", link: "https://dribbble.com/" }
      ],
      freeCourses: [
        { name: "Google UX Design Foundations", platform: "Coursera", duration: "Approx. 4 weeks", difficulty: "Beginner", link: "https://www.coursera.org/professional-certificates/google-ux-design" },
        { name: "Intro to UX Design", platform: "Great Learning", duration: "Self-paced", difficulty: "Beginner", link: "https://www.mygreatlearning.com/" },
        { name: "Learn Design Principles", platform: "Figma", duration: "Self-paced", difficulty: "Beginner", link: "https://www.figma.com/resource-library/" }
      ]
    },
    Database: {
      youtubeChannels: [
        { name: "Kudvenkat", bestFor: "SQL Server and database fundamentals", link: "https://www.youtube.com/@kudvenkat" },
        { name: "freeCodeCamp.org", bestFor: "Long SQL tutorials and project-based intros", link: "https://www.youtube.com/@freecodecamp" },
        { name: "Programming with Mosh", bestFor: "Beginner SQL introductions", link: "https://www.youtube.com/@programmingwithmosh" },
        { name: "Amigoscode", bestFor: "Database use inside application development", link: "https://www.youtube.com/@amigoscode" }
      ],
      websites: [
        { name: "PostgreSQL Docs", type: "Documentation", badge: "Free", link: "https://www.postgresql.org/docs/" },
        { name: "SQLBolt", type: "Interactive Tutorial", badge: "Free", link: "https://sqlbolt.com/" },
        { name: "Mode SQL Tutorial", type: "Tutorial", badge: "Free", link: "https://mode.com/sql-tutorial/" },
        { name: "LeetCode Database", type: "Practice", badge: "Free/Paid", link: "https://leetcode.com/problemset/database/" },
        { name: "W3Schools SQL", type: "Reference", badge: "Free", link: "https://www.w3schools.com/sql/" }
      ],
      freeCourses: [
        { name: "Databases and SQL for Data Science", platform: "Coursera", duration: "Approx. 4 weeks", difficulty: "Beginner", link: "https://www.coursera.org/learn/sql-data-science" },
        { name: "Intro to SQL", platform: "Kaggle", duration: "3 hours", difficulty: "Beginner", link: "https://www.kaggle.com/learn/intro-to-sql" },
        { name: "SQL Course", platform: "SoloLearn", duration: "Self-paced", difficulty: "Beginner", link: "https://www.sololearn.com/" }
      ]
    },
    "Git & GitHub": {
      youtubeChannels: [
        { name: "The Net Ninja", bestFor: "Git basics and GitHub workflows", link: "https://www.youtube.com/@NetNinja" },
        { name: "Traversy Media", bestFor: "Practical Git and GitHub intros", link: "https://www.youtube.com/@TraversyMedia" },
        { name: "freeCodeCamp.org", bestFor: "Long form Git tutorials", link: "https://www.youtube.com/@freecodecamp" },
        { name: "GitHub", bestFor: "Official GitHub product and collaboration guidance", link: "https://www.youtube.com/@GitHub" }
      ],
      websites: [
        { name: "Git SCM", type: "Official Docs", badge: "Free", link: "https://git-scm.com/" },
        { name: "GitHub Docs", type: "Documentation", badge: "Free", link: "https://docs.github.com/" },
        { name: "Learn Git Branching", type: "Interactive Practice", badge: "Free", link: "https://learngitbranching.js.org/" },
        { name: "Atlassian Git Tutorials", type: "Tutorials", badge: "Free", link: "https://www.atlassian.com/git/tutorials" },
        { name: "Codecademy Git", type: "Interactive Course", badge: "Free/Paid", link: "https://www.codecademy.com/learn/learn-git" }
      ],
      freeCourses: [
        { name: "Version Control with Git", platform: "Coursera", duration: "Approx. 4 weeks", difficulty: "Beginner", link: "https://www.coursera.org/learn/version-control-with-git" },
        { name: "Introduction to Git and GitHub", platform: "Coursera", duration: "Approx. 20 hours", difficulty: "Beginner", link: "https://www.coursera.org/learn/introduction-git-github" },
        { name: "GitHub Skills", platform: "GitHub", duration: "Self-paced", difficulty: "Beginner", link: "https://skills.github.com/" }
      ]
    }
  };

  const competitions = {
    codingCompetitions: [
      {
        name: "Google Code Jam",
        category: "Global Coding Competition",
        level: "Advanced",
        frequency: "Annual",
        bestFor: "Algorithmic problem solving under pressure",
        link: "https://codingcompetitions.withgoogle.com/"
      },
      {
        name: "Meta Hacker Cup",
        category: "Global Coding Competition",
        level: "Advanced",
        frequency: "Annual",
        bestFor: "Competitive coding and timed rounds",
        link: "https://www.facebook.com/codingcompetitions/hacker-cup/"
      },
      {
        name: "ICPC",
        category: "Team Programming Contest",
        level: "Advanced",
        frequency: "Annual",
        bestFor: "College-level team contests and deep algorithms",
        link: "https://icpc.global/"
      },
      {
        name: "CodeChef Long Challenge",
        category: "Competitive Coding",
        level: "Intermediate",
        frequency: "Regular",
        bestFor: "Long-form problem solving and consistency",
        link: "https://www.codechef.com/contests"
      },
      {
        name: "Codeforces Rounds",
        category: "Competitive Coding",
        level: "Intermediate to Advanced",
        frequency: "Frequent",
        bestFor: "Fast contest practice and rating growth",
        link: "https://codeforces.com/contests"
      },
      {
        name: "HackerEarth Sprints",
        category: "Competitive Coding",
        level: "Beginner to Intermediate",
        frequency: "Regular",
        bestFor: "Short coding challenges and campus prep",
        link: "https://www.hackerearth.com/challenges/"
      }
    ],
    certificationExams: [
      {
        name: "Google Associate Cloud Engineer",
        provider: "Google Cloud",
        domain: "Cloud Computing",
        level: "Associate",
        bestFor: "Cloud deployment and operations fundamentals",
        link: "https://cloud.google.com/certification/cloud-engineer"
      },
      {
        name: "AWS Cloud Practitioner",
        provider: "Amazon Web Services",
        domain: "Cloud Computing",
        level: "Foundational",
        bestFor: "Introductory AWS and cloud concepts",
        link: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
      },
      {
        name: "Microsoft Azure Fundamentals",
        provider: "Microsoft",
        domain: "Cloud Computing",
        level: "Foundational",
        bestFor: "Azure basics, pricing, and governance",
        link: "https://learn.microsoft.com/certifications/azure-fundamentals/"
      },
      {
        name: "HackerRank Certifications",
        provider: "HackerRank",
        domain: "Coding Skills",
        level: "Skill-based",
        bestFor: "Verified problem-solving and developer skills",
        link: "https://www.hackerrank.com/skills-verification"
      },
      {
        name: "Oracle Java Certification",
        provider: "Oracle",
        domain: "Java Programming",
        level: "Professional Track",
        bestFor: "Validating Java knowledge for academic and job growth",
        link: "https://education.oracle.com/java/pFamily_48"
      }
    ],
    dailyPracticePlatforms: [
      {
        name: "LeetCode Daily Challenge",
        category: "Daily Practice",
        bestFor: "Regular interview-style problem solving",
        difficultyRange: "Beginner to Advanced",
        link: "https://leetcode.com/problemset/all/"
      },
      {
        name: "CodeChef Practice",
        category: "Daily Practice",
        bestFor: "DSA drills and contest preparation",
        difficultyRange: "Beginner to Advanced",
        link: "https://www.codechef.com/practice"
      },
      {
        name: "HackerRank Skills",
        category: "Skill Tracks",
        bestFor: "Structured practice by topic",
        difficultyRange: "Beginner to Intermediate",
        link: "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript"
      },
      {
        name: "Codeforces Contests",
        category: "Timed Practice",
        bestFor: "High-pressure contest simulation",
        difficultyRange: "Intermediate to Advanced",
        link: "https://codeforces.com/contests"
      },
      {
        name: "GeeksForGeeks Practice",
        category: "Topic Practice",
        bestFor: "Topic-by-topic DSA progress building",
        difficultyRange: "Beginner to Intermediate",
        link: "https://practice.geeksforgeeks.org/"
      }
    ],
    hackathons: [
      {
        name: "Smart India Hackathon",
        organizer: "Government and Academic Ecosystem",
        format: "Team Hackathon",
        bestFor: "Real problem statements and innovation practice",
        link: "https://www.sih.gov.in/"
      },
      {
        name: "MLH Hackathons",
        organizer: "Major League Hacking",
        format: "Student Hackathons",
        bestFor: "Beginner-friendly hacking and collaboration",
        link: "https://mlh.io/seasons/2026/events"
      },
      {
        name: "Devpost Competitions",
        organizer: "Devpost",
        format: "Online Competitions",
        bestFor: "Project submissions and sponsor challenges",
        link: "https://devpost.com/hackathons"
      },
      {
        name: "Google Solution Challenge",
        organizer: "Google Developer Student Clubs",
        format: "Global Student Challenge",
        bestFor: "Impact-driven app building with mentorship",
        link: "https://developers.google.com/community/gdsc-solution-challenge"
      }
    ]
  };

  const badgeDefinitions = [
    {
      id: "quiz-master",
      title: "Quiz Master",
      description: "Earned by consistently performing well across quiz sessions.",
      icon: "🧠",
      condition: "Score 80% or higher in multiple quizzes."
    },
    {
      id: "seven-day-streak",
      title: "7-Day Streak",
      description: "Awarded for showing up and studying seven days in a row.",
      icon: "🔥",
      condition: "Maintain a study streak of at least 7 days."
    },
    {
      id: "topic-conquered",
      title: "Topic Conquered",
      description: "Given when a major roadmap topic or phase is fully completed.",
      icon: "🏁",
      condition: "Mark all topics in a phase as completed."
    },
    {
      id: "roadmap-starter",
      title: "Roadmap Starter",
      description: "Unlocked when the learner begins following a roadmap path.",
      icon: "🧭",
      condition: "Create or start your first roadmap."
    },
    {
      id: "resource-explorer",
      title: "Resource Explorer",
      description: "Awarded for actively exploring curated study resources.",
      icon: "📚",
      condition: "Open and use multiple saved resources."
    }
  ];

  const subjectEmojis = {
    "Web Development": "🌐",
    "Machine Learning": "🤖",
    "Android Development": "📱",
    "Data Science": "📊",
    "DSA & Competitive Coding": "🧩",
    Cybersecurity: "🛡️",
    "Cloud Computing": "☁️",
    "UI/UX Design": "🎨",
    "Python Programming": "🐍",
    "Java Programming": "☕",
    Database: "🗃️",
    "Git & GitHub": "🌿"
  };

  const colorPalette = {
    primary: "#2563eb",
    secondary: "#7c3aed",
    accent: "#06b6d4",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    darkBackground: "#0f172a",
    darkCard: "#111827",
    lightBackground: "#f8fafc",
    lightCard: "#ffffff"
  };

  const motivationalMessages = [
    "Small focused sessions beat random bursts of effort.",
    "Consistency is your silent competitive advantage.",
    "Build momentum first. Perfection can come later.",
    "Every revision cycle makes future learning easier.",
    "Strong fundamentals reduce stress during deadlines.",
    "A calm, repeatable system is better than last-minute panic.",
    "Treat weak topics as opportunities, not proof that you are behind.",
    "Your roadmap matters only if it turns into daily action."
  ];

  window.StudyMindData = {
    roadmaps: roadmaps,
    studyMaterials: studyMaterials,
    quizQuestions: quizQuestions,
    resources: resources,
    competitions: competitions,
    badgeDefinitions: badgeDefinitions,
    subjectEmojis: subjectEmojis,
    colorPalette: colorPalette,
    motivationalMessages: motivationalMessages
  };
})();
