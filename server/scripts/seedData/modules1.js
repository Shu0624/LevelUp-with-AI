export const programmingModules = [
  {
    title: 'Java Masterclass',
    slug: 'java-masterclass',
    category: 'programming',
    description: 'Master Java from OOP fundamentals to advanced multithreading and collections.',
    icon: '☕',
    difficulty: 'intermediate',
    lessons: [
      { title: 'OOP Principles', content: '## Object-Oriented Programming\n\nJava is built on four pillars:\n\n1. **Encapsulation** — Bundling data and methods together\n2. **Inheritance** — Creating new classes from existing ones\n3. **Polymorphism** — Same interface, different implementations\n4. **Abstraction** — Hiding complex implementation details\n\n```java\npublic class Animal {\n  private String name;\n  public void speak() { System.out.println("..."); }\n}\n\npublic class Dog extends Animal {\n  @Override\n  public void speak() { System.out.println("Woof!"); }\n}\n```', order: 1, duration: 15 },
      { title: 'Collections Framework', content: '## Java Collections\n\nThe Collections Framework provides data structures:\n\n- **List** (ArrayList, LinkedList) — Ordered, allows duplicates\n- **Set** (HashSet, TreeSet) — No duplicates\n- **Map** (HashMap, TreeMap) — Key-value pairs\n- **Queue** (PriorityQueue, Deque)\n\n```java\nList<String> names = new ArrayList<>();\nnames.add("Alice");\nnames.add("Bob");\n\nMap<String, Integer> scores = new HashMap<>();\nscores.put("Alice", 95);\n```', order: 2, duration: 20 },
      { title: 'Multithreading', content: '## Multithreading in Java\n\nJava supports concurrent execution:\n\n```java\npublic class MyThread extends Thread {\n  public void run() {\n    System.out.println("Running in: " + Thread.currentThread().getName());\n  }\n}\n\n// Using Runnable\nRunnable task = () -> System.out.println("Lambda thread!");\nnew Thread(task).start();\n```\n\n**Key Concepts:** synchronized, volatile, ExecutorService, CompletableFuture', order: 3, duration: 25 },
      { title: 'Exception Handling', content: '## Exception Handling\n\nJava uses try-catch-finally:\n\n```java\ntry {\n  int result = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.println("Cannot divide by zero!");\n} finally {\n  System.out.println("Always executes");\n}\n```\n\n**Custom Exceptions:**\n```java\npublic class InsufficientFundsException extends Exception {\n  public InsufficientFundsException(String msg) { super(msg); }\n}\n```', order: 4, duration: 15 },
      { title: 'Java Streams & Lambdas', content: '## Streams API (Java 8+)\n\nFunctional programming in Java:\n\n```java\nList<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);\n\nint sum = numbers.stream()\n  .filter(n -> n % 2 == 0)\n  .mapToInt(Integer::intValue)\n  .sum(); // 12\n\nList<String> upperNames = names.stream()\n  .map(String::toUpperCase)\n  .collect(Collectors.toList());\n```', order: 5, duration: 20 }
    ]
  },
  {
    title: 'Python for Data',
    slug: 'python-data',
    category: 'programming',
    description: 'Learn Python with a focus on data manipulation, pandas, and automation.',
    icon: '🐍',
    difficulty: 'beginner',
    lessons: [
      { title: 'Python Basics', content: '## Python Fundamentals\n\n```python\n# Variables & Types\nname = "Alice"\nage = 22\nis_student = True\n\n# Lists\nskills = ["Python", "SQL", "ML"]\nskills.append("Docker")\n\n# Dictionaries\nstudent = {"name": "Alice", "gpa": 3.8}\n\n# List comprehension\nsquares = [x**2 for x in range(10)]\n```', order: 1, duration: 15 },
      { title: 'Functions & Modules', content: '## Functions\n\n```python\ndef greet(name, greeting="Hello"):\n  return f"{greeting}, {name}!"\n\n# Lambda\nsquare = lambda x: x ** 2\n\n# Decorators\ndef timer(func):\n  def wrapper(*args):\n    import time\n    start = time.time()\n    result = func(*args)\n    print(f"Took {time.time()-start:.2f}s")\n    return result\n  return wrapper\n```', order: 2, duration: 15 },
      { title: 'Pandas & NumPy', content: '## Data Analysis\n\n```python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("data.csv")\nprint(df.head())\nprint(df.describe())\n\n# Filtering\nhigh_scores = df[df["score"] > 80]\n\n# GroupBy\navg_by_dept = df.groupby("department")["salary"].mean()\n\n# NumPy\narr = np.array([1, 2, 3, 4])\nprint(arr.mean(), arr.std())\n```', order: 3, duration: 25 },
      { title: 'File I/O & APIs', content: '## Working with Data\n\n```python\n# File reading\nwith open("data.txt", "r") as f:\n  content = f.read()\n\n# JSON\nimport json\ndata = json.loads(\'{"name": "Alice"}\')\n\n# API calls\nimport requests\nres = requests.get("https://api.example.com/users")\nusers = res.json()\n```', order: 4, duration: 15 }
    ]
  },
  {
    title: 'Modern JavaScript ES6+',
    slug: 'modern-javascript',
    category: 'programming',
    description: 'Master modern JS from Arrow Functions to Async/Await and the Event Loop.',
    icon: '⚡',
    difficulty: 'beginner',
    lessons: [
      { title: 'Let, Const, and Arrow Functions', content: '## Let, Const, Arrow Functions\n\n```javascript\n// Block scoped variables\nlet count = 0;\nconst MAX = 100;\n\n// Arrow functions maintain lexcial `this`\nconst add = (a, b) => a + b;\n\nconst obj = {\n  val: 10,\n  increment: function() {\n    setTimeout(() => {\n      // this binds correctly to obj\n      this.val++; \n    }, 1000);\n  }\n};\n```', order: 1, duration: 15 },
      { title: 'Destructuring & Spread Syntax', content: '## Destructuring & Spread Syntax\n\n```javascript\nconst user = { name: "Alice", age: 25, city: "NYC" };\nconst { name, age } = user;\n\n// Spread Operator\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5];\n\nconst updatedUser = { ...user, active: true };\n\n// Rest params\nfunction sum(...numbers) {\n  return numbers.reduce((acc, curr) => acc + curr, 0);\n}\n```', order: 2, duration: 20 },
      { title: 'Promises and Async/Await', content: '## Promises and Async/Await\n\n```javascript\nconst fetchUser = () => {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => resolve({ id: 1 }), 1000);\n  });\n};\n\n// Async/Await\nasync function getUserData() {\n  try {\n    const user = await fetchUser();\n    console.log(user);\n  } catch (err) {\n    console.error(err);\n  }\n}\n```', order: 3, duration: 25 },
      { title: 'The Event Loop', content: '## The Event Loop\n\nJavaScript is single-threaded but non-blocking because of the Event Loop.\n\n1. **Call Stack**: Synchronous code execution\n2. **Web APIs**: async tasks like `setTimeout`\n3. **Task Queue**: Callbacks ready to execute\n4. **Microtask Queue**: Promises (higher priority than tasks)\n\n```javascript\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n\n// Output: 1, 4, 3, 2\n```', order: 4, duration: 20 }
    ]
  },
  {
    title: 'TypeScript Foundations',
    slug: 'typescript-foundations',
    category: 'programming',
    description: 'Extend JS with strong static typing, interfaces, and generics.',
    icon: '📘',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Types and Interfaces', content: '## Types and Interfaces\n\n```typescript\n// Basic Types\nlet isDone: boolean = false;\nlet lines: number = 42;\nlet name: string = "Bob";\n\n// Interfaces\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // Optional property\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}`;\n}\n```', order: 1, duration: 15 },
      { title: 'Union Types & Type Guards', content: '## Union Types & Type Guards\n\n```typescript\ntype ID = string | number;\n\nfunction printId(id: ID) {\n  if (typeof id === "string") {\n    console.log(id.toUpperCase());\n  } else {\n    console.log(id.toFixed(2));\n  }\n}\n```', order: 2, duration: 20 },
      { title: 'Generics', content: '## Generics\n\nGenerics allow you to create reusable components.\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nlet output1 = identity<string>("myString");\nlet output2 = identity<number>(100);\n\ninterface KeyValuePair<K, V> {\n  key: K;\n  value: V;\n}\nlet pair: KeyValuePair<string, number> = { key: "age", value: 30 };\n```', order: 3, duration: 25 },
      { title: 'Utility Types', content: '## Utility Types\n\nTS provides globally available utility types:\n\n```typescript\ninterface Todo {\n  title: string;\n  description: string;\n  completed: boolean;\n}\n\n// Partial makes all properties optional\ntype PartialTodo = Partial<Todo>;\n\n// Pick allows taking specific properties\ntype TodoPreview = Pick<Todo, "title" | "completed">;\n\n// Omit removes properties\ntype TodoInfo = Omit<Todo, "completed">;\n```', order: 4, duration: 20 }
    ]
  },
  {
    title: 'C Programming',
    slug: 'c-programming',
    category: 'programming',
    description: 'Learn the foundational language that powers OS development.',
    icon: '⚙️',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Pointers Demystified', content: '## Pointers \n\nA pointer is a variable that stores the memory address of another variable.\n\n```c\nint var = 20;\nint *ptr; // pointer declaration\nptr = &var; // store address of var in ptr\n\nprintf("Address of var: %p\\n", &var);\nprintf("Value of var via pointer: %d\\n", *ptr);\n```', order: 1, duration: 20 },
      { title: 'Memory Management', content: '## Memory Management\n\nDynamic memory allocation using `malloc`, `calloc`, `realloc`, and `free`.\n\n```c\n#include <stdlib.h>\n\nint *arr = (int*)malloc(5 * sizeof(int));\nif (arr == NULL) {\n  printf("Memory allocation failed");\n  exit(1);\n}\n\nfor (int i = 0; i < 5; i++) {\n  arr[i] = i + 1;\n}\n\nfree(arr); // Always free dynamically allocated memory!\n```', order: 2, duration: 20 },
      { title: 'Structs', content: '## Structs\n\nGroup related variables under one name.\n\n```c\nstruct Student {\n  char name[50];\n  int id;\n  float marks;\n};\n\nint main() {\n  struct Student s1;\n  strcpy(s1.name, "John");\n  s1.id = 101;\n  s1.marks = 85.5;\n  \n  printf("Student: %s, ID: %d\\n", s1.name, s1.id);\n  return 0;\n}\n```', order: 3, duration: 15 },
      { title: 'File Handling', content: '## Memory & Files\n\n```c\nFILE *fp;\nfp = fopen("file.txt", "w");\n\nif(fp == NULL) {\n  printf("Failed to open file\\n");\n  return -1;\n}\n\nfprintf(fp, "Writing to file!\\n");\nfclose(fp);\n```', order: 4, duration: 15 }
    ]
  },
  {
    title: 'C++ Systems & STL',
    slug: 'cpp-systems',
    category: 'programming',
    description: 'Deep dive into C++ object-oriented features, STL, and smart pointers.',
    icon: '🚀',
    difficulty: 'advanced',
    lessons: [
      { title: 'OOP in C++', content: '## C++ Classes and Objects\n\n```cpp\nclass Rectangle {\nprivate:\n  int width, height;\npublic:\n  Rectangle(int w, int h) : width(w), height(h) {}\n  int area() { return width * height; }\n};\n\nint main() {\n  Rectangle rect(10, 5);\n  std::cout << "Area: " << rect.area() << std::endl;\n}\n```', order: 1, duration: 20 },
      { title: 'Standard Template Library (STL)', content: '## STL Containers\n\n```cpp\n#include <vector>\n#include <map>\n#include <iostream>\n\nstd::vector<int> nums = {1, 2, 3};\nnums.push_back(4);\n\nstd::map<std::string, int> ages;\nages["Alice"] = 25;\n\nfor(const auto& pair : ages) {\n  std::cout << pair.first << ": " << pair.second << "\\n";\n}\n```', order: 2, duration: 25 },
      { title: 'Smart Pointers', content: '## Smart Pointers (C++11)\n\nPrevents memory leaks.\n\n```cpp\n#include <memory>\n\nclass Entity { public: Entity() { std::cout << "Created!"; } };\n\nint main() {\n  { // Scope block\n    std::unique_ptr<Entity> entity = std::make_unique<Entity>();\n    // Automatically deleted when exiting scope\n  }\n  \n  std::shared_ptr<Entity> sharedEntity = std::make_shared<Entity>();\n}\n```', order: 3, duration: 20 },
      { title: 'Templates', content: '## Templates\n\nWrite generic, type-independent code.\n\n```cpp\ntemplate <typename T>\nT add(T a, T b) {\n  return a + b;\n}\n\nint main() {\n  std::cout << add<int>(5, 10) << std::endl;\n  std::cout << add<float>(5.5, 4.5) << std::endl;\n}\n```', order: 4, duration: 20 }
    ]
  },
  {
    title: 'Go (Golang)',
    slug: 'go-backend',
    category: 'programming',
    description: 'Build fast, concurrent backend services using Go.',
    icon: '🐹',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Go Basics & Structs', content: '## Go Syntax\n\n```go\npackage main\n\nimport "fmt"\n\ntype Person struct {\n    Name string\n    Age  int\n}\n\nfunc (p Person) Greet() {\n    fmt.Printf("Hi, Im %s\\n", p.Name)\n}\n\nfunc main() {\n    p := Person{Name: "Alice", Age: 30}\n    p.Greet()\n}\n```', order: 1, duration: 15 },
      { title: 'Goroutines', content: '## Concurrent Execution\n\n```go\npackage main\n\nimport (\n    "fmt"\n    "time"\n)\n\nfunc say(s string) {\n    for i := 0; i < 3; i++ {\n        time.Sleep(100 * time.Millisecond)\n        fmt.Println(s)\n    }\n}\n\nfunc main() {\n    go say("world") // Runs concurrently\n    say("hello")\n}\n```', order: 2, duration: 20 },
      { title: 'Channels', content: '## Channels\n\nGoroutines communicate via channels.\n\n```go\npackage main\n\nimport "fmt"\n\nfunc sum(s []int, c chan int) {\n    sum := 0\n    for _, v := range s {\n        sum += v\n    }\n    c <- sum // send sum to c\n}\n\nfunc main() {\n    s := []int{7, 2, 8, -9, 4, 0}\n    c := make(chan int)\n    go sum(s[:3], c)\n    go sum(s[3:], c)\n    x, y := <-c, <-c // receive from c\n    fmt.Println(x, y, x+y)\n}\n```', order: 3, duration: 25 },
      { title: 'Interfaces', content: '## Implicit Interfaces\n\n```go\ntype Speaker interface {\n    Speak() string\n}\n\ntype Dog struct{}\nfunc (d Dog) Speak() string { return "Woof!" }\n\nfunc MakeSound(s Speaker) {\n    fmt.Println(s.Speak())\n}\n\nfunc main() {\n    MakeSound(Dog{})\n}\n```', order: 4, duration: 15 }
    ]
  },
  {
    title: 'Rust Basics',
    slug: 'rust-basics',
    category: 'programming',
    description: 'Learn memory safety without garbage collection in Rust.',
    icon: '🦀',
    difficulty: 'advanced',
    lessons: [
      { title: 'Variables & Types', content: '## Rust Variables\n\nVariables are immutable by default.\n\n```rust\nfn main() {\n    let mut x = 5;\n    println!("The value of x is: {}", x);\n    x = 6;\n    println!("The value of x is: {}", x);\n    \n    // Tuples\n    let tup: (i32, f64, u8) = (500, 6.4, 1);\n    let (x, y, z) = tup;\n}\n```', order: 1, duration: 15 },
      { title: 'Ownership', content: '## Ownership Rules\n\n1. Each value has a variable called its owner.\n2. There can only be one owner at a time.\n3. When the owner goes out of scope, the value will be dropped.\n\n```rust\nfn main() {\n    let s1 = String::from("hello");\n    let s2 = s1;\n    // println!("{}, world!", s1); // THIS ERRORS! s1 was moved to s2.\n    \n    // Use clone to copy data\n    let s3 = s2.clone();\n    println!("s2={}, s3={}", s2, s3);\n}\n```', order: 2, duration: 25 },
      { title: 'Borrowing & References', content: '## Borrowing\n\nInstead of moving ownership, you can borrow references.\n\n```rust\nfn main() {\n    let s1 = String::from("hello");\n    let len = calculate_length(&s1); // pass reference\n    println!("The length of \'{}\' is {}.", s1, len);\n}\n\nfn calculate_length(s: &String) -> usize {\n    s.len()\n}\n```\n\nRules: At any given time, you can have either one mutable reference OR any number of immutable references.', order: 3, duration: 25 },
      { title: 'Pattern Matching', content: '## Enums & Match\n\n```rust\nenum TrafficLight {\n    Red,\n    Yellow,\n    Green,\n}\n\nfn go(light: TrafficLight) {\n    match light {\n        TrafficLight::Red => println!("Stop!"),\n        TrafficLight::Yellow => println!("Slow down!"),\n        TrafficLight::Green => println!("Go!"),\n    }\n}\n```', order: 4, duration: 15 }
    ]
  }
];
