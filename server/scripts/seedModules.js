import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Module from '../models/Module.js';
import Quiz from '../models/Quiz.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

// Helper — upsert module + quiz (safe for re-runs)
const createModuleWithQuiz = async (moduleData, quizData) => {
  const mod = await Module.findOneAndUpdate(
    { slug: moduleData.slug },
    moduleData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Quiz.findOneAndUpdate(
    { module: mod._id },
    { module: mod._id, ...quizData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return mod;
};

const seedNewModules = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // ========== JAVASCRIPT ==========
    await createModuleWithQuiz({
      title: 'JavaScript ES6+', slug: 'javascript-es6', category: 'programming', icon: '⚡', difficulty: 'beginner',
      description: 'Master modern JavaScript — arrow functions, promises, async/await, destructuring, and the event loop.',
      lessons: [
        { title: 'Arrow Functions & Destructuring', order: 1, duration: 15, content: '## Arrow Functions\n\n```javascript\nconst add = (a, b) => a + b;\nconst greet = name => `Hello, ${name}!`;\n```\n\n## Destructuring\n\n```javascript\nconst { name, age } = user;\nconst [first, ...rest] = [1,2,3,4];\n```' },
        { title: 'Promises & Async/Await', order: 2, duration: 20, content: '## Promises\n\n```javascript\nfetch("/api/data")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```\n\n## Async/Await\n\n```javascript\nasync function getData() {\n  try {\n    const res = await fetch("/api/data");\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}\n```' },
        { title: 'ES6 Modules & Classes', order: 3, duration: 15, content: '## ES6 Modules\n\n```javascript\n// math.js\nexport const add = (a, b) => a + b;\nexport default class Calculator { ... }\n\n// app.js\nimport Calculator, { add } from "./math.js";\n```\n\n## Classes\n\n```javascript\nclass Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} makes a sound`; }\n}\nclass Dog extends Animal {\n  speak() { return `${this.name} barks`; }\n}\n```' },
        { title: 'Event Loop & Closures', order: 4, duration: 20, content: '## The Event Loop\n\nJavaScript is single-threaded with an event loop:\n\n1. **Call Stack** — executes synchronous code\n2. **Callback Queue** — holds async callbacks\n3. **Microtask Queue** — Promises (higher priority)\n4. **Event Loop** — moves tasks from queue to stack\n\n## Closures\n\n```javascript\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\ninc(); // 1\ninc(); // 2\n```' },
      ]
    }, {
      title: 'JavaScript ES6+ Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What does `const [a, ...b] = [1,2,3]` assign to b?', type: 'mcq', difficulty: 1, explanation: 'The rest operator (...) collects remaining elements into an array.',
          options: [{ text: '[2, 3]', isCorrect: true }, { text: '2', isCorrect: false }, { text: '[1, 2, 3]', isCorrect: false }, { text: 'undefined', isCorrect: false }] },
        { text: 'Which queue has higher priority in the event loop?', type: 'mcq', difficulty: 2, explanation: 'Microtask queue (Promises) is processed before the callback queue (setTimeout).',
          options: [{ text: 'Callback Queue', isCorrect: false }, { text: 'Microtask Queue', isCorrect: true }, { text: 'Render Queue', isCorrect: false }, { text: 'They are equal', isCorrect: false }] },
        { text: 'What is a closure?', type: 'mcq', difficulty: 2, explanation: 'A closure is a function that remembers the variables from its lexical scope even after the outer function has returned.',
          options: [{ text: 'A function inside a loop', isCorrect: false }, { text: 'A function that returns another function', isCorrect: false }, { text: 'A function that retains access to its outer scope', isCorrect: true }, { text: 'An anonymous function', isCorrect: false }] },
        { text: 'Which keyword prevents variable reassignment?', type: 'mcq', difficulty: 1, explanation: 'const prevents reassignment but does not make objects immutable.',
          options: [{ text: 'let', isCorrect: false }, { text: 'var', isCorrect: false }, { text: 'const', isCorrect: true }, { text: 'static', isCorrect: false }] },
      ]
    });
    console.log('✅ JavaScript ES6+');

    // ========== TYPESCRIPT ==========
    await createModuleWithQuiz({
      title: 'TypeScript Essentials', slug: 'typescript-essentials', category: 'programming', icon: '🔷', difficulty: 'intermediate',
      description: 'Add type safety to JavaScript — interfaces, generics, union types, and utility types.',
      lessons: [
        { title: 'Types & Interfaces', order: 1, duration: 15, content: '## Basic Types\n\n```typescript\nlet name: string = "Alice";\nlet age: number = 22;\nlet active: boolean = true;\nlet skills: string[] = ["React", "Node"];\n```\n\n## Interfaces\n\n```typescript\ninterface User {\n  name: string;\n  age: number;\n  email?: string; // optional\n}\nconst user: User = { name: "Alice", age: 22 };\n```' },
        { title: 'Generics & Utility Types', order: 2, duration: 20, content: '## Generics\n\n```typescript\nfunction identity<T>(arg: T): T { return arg; }\nidentity<string>("hello");\nidentity<number>(42);\n```\n\n## Utility Types\n\n```typescript\nPartial<User>    // All fields optional\nRequired<User>   // All fields required\nPick<User, "name" | "age">\nOmit<User, "password">\nRecord<string, number>\n```' },
        { title: 'Enums & Union Types', order: 3, duration: 15, content: '## Union Types\n\n```typescript\ntype Status = "active" | "inactive" | "banned";\ntype ID = string | number;\n```\n\n## Enums\n\n```typescript\nenum Direction {\n  Up = "UP",\n  Down = "DOWN",\n  Left = "LEFT",\n  Right = "RIGHT"\n}\n```' },
      ]
    }, {
      title: 'TypeScript Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What does Partial<T> do in TypeScript?', type: 'mcq', difficulty: 2, explanation: 'Partial<T> makes all properties of T optional.',
          options: [{ text: 'Makes all fields required', isCorrect: false }, { text: 'Makes all fields optional', isCorrect: true }, { text: 'Removes all fields', isCorrect: false }, { text: 'Makes fields readonly', isCorrect: false }] },
        { text: 'What is the type of `const x = [1, "a"]` in TypeScript?', type: 'mcq', difficulty: 2, explanation: 'TypeScript infers a union array type (string | number)[].',
          options: [{ text: 'number[]', isCorrect: false }, { text: 'string[]', isCorrect: false }, { text: '(string | number)[]', isCorrect: true }, { text: 'any[]', isCorrect: false }] },
        { text: 'Which symbol marks an optional property in an interface?', type: 'mcq', difficulty: 1, explanation: 'The ? after a property name makes it optional.',
          options: [{ text: '!', isCorrect: false }, { text: '?', isCorrect: true }, { text: '*', isCorrect: false }, { text: '~', isCorrect: false }] },
      ]
    });
    console.log('✅ TypeScript');

    // ========== DSA ==========
    await createModuleWithQuiz({
      title: 'Data Structures & Algorithms', slug: 'dsa-fundamentals', category: 'programming', icon: '🧮', difficulty: 'intermediate',
      description: 'Master arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
      lessons: [
        { title: 'Arrays & Strings', order: 1, duration: 20, content: '## Arrays\n\nArrays store elements in contiguous memory.\n\n**Key Operations:** Access O(1), Search O(n), Insert O(n), Delete O(n)\n\n**Common Patterns:**\n- Two Pointer technique\n- Sliding Window\n- Prefix Sum\n\n```python\n# Two Sum (LeetCode #1)\ndef twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i\n```' },
        { title: 'Linked Lists & Stacks', order: 2, duration: 20, content: '## Linked Lists\n\n```python\nclass Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\n# Reverse a linked list\ndef reverse(head):\n    prev = None\n    while head:\n        nxt = head.next\n        head.next = prev\n        prev = head\n        head = nxt\n    return prev\n```\n\n## Stacks\n\nLIFO — Last In, First Out. Used for: parenthesis matching, undo, DFS.' },
        { title: 'Trees & Graphs', order: 3, duration: 25, content: '## Binary Trees\n\n**Traversals:** Inorder (Left→Root→Right), Preorder (Root→Left→Right), Postorder\n\n```python\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)\n```\n\n## Graphs\n\n**BFS** — Level-order, shortest path (unweighted)\n**DFS** — Explore deeply, detect cycles\n\n```python\ndef bfs(graph, start):\n    visited = set()\n    queue = [start]\n    while queue:\n        node = queue.pop(0)\n        visited.add(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                queue.append(neighbor)\n```' },
        { title: 'Sorting & Searching', order: 4, duration: 20, content: '## Sorting\n\n| Algorithm | Best | Average | Worst | Space |\n|---|---|---|---|---|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) |\n| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) |\n\n## Binary Search\n\n```python\ndef binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n```' },
        { title: 'Dynamic Programming', order: 5, duration: 25, content: '## Dynamic Programming\n\nBreak problems into overlapping sub-problems.\n\n**Steps:** 1. Define state 2. Find recurrence 3. Base case 4. Build table\n\n```python\n# Fibonacci (Bottom-up)\ndef fib(n):\n    dp = [0, 1]\n    for i in range(2, n+1):\n        dp.append(dp[-1] + dp[-2])\n    return dp[n]\n\n# 0/1 Knapsack\ndef knapsack(weights, values, W):\n    n = len(weights)\n    dp = [[0]*(W+1) for _ in range(n+1)]\n    for i in range(1, n+1):\n        for w in range(W+1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w-weights[i-1]])\n            else:\n                dp[i][w] = dp[i-1][w]\n    return dp[n][W]\n```' },
      ]
    }, {
      title: 'DSA Quiz', timeLimit: 15, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What is the time complexity of binary search?', type: 'mcq', difficulty: 1, explanation: 'Binary search halves the search space each step → O(log n).',
          options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: true }, { text: 'O(n log n)', isCorrect: false }, { text: 'O(1)', isCorrect: false }] },
        { text: 'Which data structure uses LIFO order?', type: 'mcq', difficulty: 1, explanation: 'Stack uses Last In First Out. Queue uses FIFO.',
          options: [{ text: 'Queue', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Heap', isCorrect: false }, { text: 'Array', isCorrect: false }] },
        { text: 'Merge Sort has a worst-case time complexity of?', type: 'mcq', difficulty: 2, explanation: 'Merge Sort is always O(n log n) regardless of input.',
          options: [{ text: 'O(n²)', isCorrect: false }, { text: 'O(n)', isCorrect: false }, { text: 'O(n log n)', isCorrect: true }, { text: 'O(log n)', isCorrect: false }] },
        { text: 'What traversal of a BST gives sorted order?', type: 'mcq', difficulty: 2, explanation: 'Inorder traversal (Left → Root → Right) of a BST produces sorted output.',
          options: [{ text: 'Preorder', isCorrect: false }, { text: 'Postorder', isCorrect: false }, { text: 'Inorder', isCorrect: true }, { text: 'Level-order', isCorrect: false }] },
        { text: 'Dynamic Programming requires which two properties?', type: 'mcq', difficulty: 3, explanation: 'DP requires overlapping subproblems and optimal substructure.',
          options: [{ text: 'Recursion and iteration', isCorrect: false }, { text: 'Overlapping subproblems and optimal substructure', isCorrect: true }, { text: 'Divide and conquer', isCorrect: false }, { text: 'Greedy choice and sorting', isCorrect: false }] },
      ]
    });
    console.log('✅ DSA');

    // ========== SYSTEM DESIGN ==========
    await createModuleWithQuiz({
      title: 'System Design Basics', slug: 'system-design', category: 'programming', icon: '🏗️', difficulty: 'advanced',
      description: 'Learn scalability, load balancing, caching, database design, and microservices architecture.',
      lessons: [
        { title: 'Scalability & Load Balancing', order: 1, duration: 20, content: '## Vertical vs Horizontal Scaling\n\n- **Vertical**: Upgrade single server (more RAM/CPU)\n- **Horizontal**: Add more servers behind a load balancer\n\n## Load Balancers\n\n- **Round Robin** — distribute evenly\n- **Least Connections** — send to least busy server\n- **IP Hash** — sticky sessions\n\nTools: Nginx, HAProxy, AWS ALB' },
        { title: 'Caching & CDN', order: 2, duration: 15, content: '## Caching Layers\n\n1. **Browser Cache** — static assets\n2. **CDN** — edge servers worldwide (Cloudflare, CloudFront)\n3. **Application Cache** — Redis/Memcached\n4. **Database Cache** — query result caching\n\n## Cache Strategies\n\n- **Cache-Aside**: App checks cache first, then DB\n- **Write-Through**: Write to cache + DB simultaneously\n- **Write-Behind**: Write to cache, async sync to DB' },
        { title: 'Database Design', order: 3, duration: 20, content: '## SQL vs NoSQL\n\n| Feature | SQL (PostgreSQL) | NoSQL (MongoDB) |\n|---|---|---|\n| Structure | Fixed schema | Flexible documents |\n| Joins | Native | Manual/$lookup |\n| Scale | Vertical | Horizontal (sharding) |\n| Best for | Transactions | High write volume |\n\n## Indexing\n\nIndexes speed up reads but slow writes. Always index fields used in WHERE/find queries.' },
        { title: 'Microservices & APIs', order: 4, duration: 20, content: '## Monolith vs Microservices\n\n**Monolith**: Single deployable unit (simpler, faster to build)\n**Microservices**: Independent services communicating via APIs\n\n## API Design\n\n- **REST**: Resource-based URLs, HTTP verbs\n- **GraphQL**: Single endpoint, client specifies shape\n- **gRPC**: Binary protocol, high performance\n\n## Message Queues\n\nRabbitMQ, Kafka — decouple services, handle async work' },
      ]
    }, {
      title: 'System Design Quiz', timeLimit: 12, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What is horizontal scaling?', type: 'mcq', difficulty: 1, explanation: 'Horizontal scaling adds more machines. Vertical scaling upgrades one machine.',
          options: [{ text: 'Adding more RAM', isCorrect: false }, { text: 'Adding more servers', isCorrect: true }, { text: 'Upgrading CPU', isCorrect: false }, { text: 'Using a faster database', isCorrect: false }] },
        { text: 'Which caching strategy checks cache first, then DB on miss?', type: 'mcq', difficulty: 2, explanation: 'Cache-Aside (Lazy Loading) checks cache first. On miss, fetches from DB and updates cache.',
          options: [{ text: 'Write-Through', isCorrect: false }, { text: 'Write-Behind', isCorrect: false }, { text: 'Cache-Aside', isCorrect: true }, { text: 'Read-Through', isCorrect: false }] },
        { text: 'Which database type is best for high write throughput?', type: 'mcq', difficulty: 2, explanation: 'NoSQL databases like MongoDB and Cassandra are optimized for high write throughput with horizontal scaling.',
          options: [{ text: 'SQL (PostgreSQL)', isCorrect: false }, { text: 'NoSQL (MongoDB)', isCorrect: true }, { text: 'SQLite', isCorrect: false }, { text: 'They are equal', isCorrect: false }] },
      ]
    });
    console.log('✅ System Design');

    // ========== SQL ==========
    await createModuleWithQuiz({
      title: 'SQL Mastery', slug: 'sql-mastery', category: 'database', icon: '🗄️', difficulty: 'intermediate',
      description: 'Master SQL joins, subqueries, window functions, indexing, and transactions.',
      lessons: [
        { title: 'Joins & Subqueries', order: 1, duration: 20, content: '## SQL Joins\n\n```sql\n-- INNER JOIN\nSELECT u.name, o.total FROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n\n-- LEFT JOIN (all users, even without orders)\nSELECT u.name, o.total FROM users u\nLEFT JOIN orders o ON u.id = o.user_id;\n```\n\n## Subqueries\n\n```sql\nSELECT name FROM users\nWHERE id IN (SELECT user_id FROM orders WHERE total > 100);\n```' },
        { title: 'Aggregation & Window Functions', order: 2, duration: 20, content: '## GROUP BY\n\n```sql\nSELECT department, AVG(salary) as avg_sal\nFROM employees GROUP BY department\nHAVING AVG(salary) > 50000;\n```\n\n## Window Functions\n\n```sql\nSELECT name, salary,\n  RANK() OVER (ORDER BY salary DESC) as rank,\n  ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)\nFROM employees;\n```' },
        { title: 'Indexing & Optimization', order: 3, duration: 15, content: '## Indexes\n\n```sql\nCREATE INDEX idx_email ON users(email);\nCREATE INDEX idx_composite ON orders(user_id, created_at);\n```\n\n**Rules:**\n- Index columns used in WHERE, JOIN, ORDER BY\n- Composite index order matters\n- Too many indexes slow down writes\n\n## EXPLAIN\n\n```sql\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = \'test@x.com\';\n```' },
      ]
    }, {
      title: 'SQL Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'Which JOIN returns all rows from the left table?', type: 'mcq', difficulty: 1, explanation: 'LEFT JOIN returns all left table rows, NULLs for non-matching right rows.',
          options: [{ text: 'INNER JOIN', isCorrect: false }, { text: 'LEFT JOIN', isCorrect: true }, { text: 'RIGHT JOIN', isCorrect: false }, { text: 'CROSS JOIN', isCorrect: false }] },
        { text: 'What does HAVING do?', type: 'mcq', difficulty: 2, explanation: 'HAVING filters groups (after GROUP BY). WHERE filters individual rows (before GROUP BY).',
          options: [{ text: 'Filters rows before grouping', isCorrect: false }, { text: 'Filters groups after GROUP BY', isCorrect: true }, { text: 'Sorts results', isCorrect: false }, { text: 'Limits output', isCorrect: false }] },
        { text: 'What is the purpose of a database index?', type: 'mcq', difficulty: 1, explanation: 'Indexes speed up read queries by creating a sorted data structure for fast lookups.',
          options: [{ text: 'Speed up writes', isCorrect: false }, { text: 'Speed up reads', isCorrect: true }, { text: 'Encrypt data', isCorrect: false }, { text: 'Compress data', isCorrect: false }] },
      ]
    });
    console.log('✅ SQL');

    // ========== MONGODB ==========
    await createModuleWithQuiz({
      title: 'MongoDB Deep Dive', slug: 'mongodb-deep-dive', category: 'database', icon: '🍃', difficulty: 'intermediate',
      description: 'Master MongoDB CRUD, aggregation pipelines, indexing strategies, and schema design.',
      lessons: [
        { title: 'CRUD & Schema Design', order: 1, duration: 15, content: '## CRUD Operations\n\n```javascript\n// Create\ndb.users.insertOne({ name: "Alice", age: 22 });\n\n// Read\ndb.users.find({ age: { $gte: 18 } }).sort({ name: 1 });\n\n// Update\ndb.users.updateOne({ name: "Alice" }, { $set: { age: 23 } });\n\n// Delete\ndb.users.deleteOne({ name: "Alice" });\n```\n\n## Embedding vs Referencing\n\n- **Embed** if data is queried together (1:few)\n- **Reference** if data grows unbounded (1:many)' },
        { title: 'Aggregation Pipeline', order: 2, duration: 20, content: '## Pipeline Stages\n\n```javascript\ndb.orders.aggregate([\n  { $match: { status: "completed" } },\n  { $group: { _id: "$userId", total: { $sum: "$amount" } } },\n  { $sort: { total: -1 } },\n  { $limit: 10 }\n]);\n```\n\n**Key Stages:** $match, $group, $sort, $project, $lookup (join), $unwind' },
        { title: 'Indexing & Performance', order: 3, duration: 15, content: '## Index Types\n\n```javascript\ndb.users.createIndex({ email: 1 });           // Single field\ndb.users.createIndex({ dept: 1, year: -1 });  // Compound\ndb.users.createIndex({ name: "text" });         // Text search\n```\n\n## Explain\n\n```javascript\ndb.users.find({ email: "a@b.com" }).explain("executionStats");\n// Look for: IXSCAN (good) vs COLLSCAN (bad)\n```' },
      ]
    }, {
      title: 'MongoDB Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'Which aggregation stage filters documents?', type: 'mcq', difficulty: 1, explanation: '$match filters documents, similar to WHERE in SQL.',
          options: [{ text: '$group', isCorrect: false }, { text: '$match', isCorrect: true }, { text: '$project', isCorrect: false }, { text: '$sort', isCorrect: false }] },
        { text: 'When should you embed vs reference in MongoDB?', type: 'mcq', difficulty: 2, explanation: 'Embed for 1:few relationships queried together. Reference for 1:many unbounded data.',
          options: [{ text: 'Always embed', isCorrect: false }, { text: 'Always reference', isCorrect: false }, { text: 'Embed 1:few, reference 1:many', isCorrect: true }, { text: 'It does not matter', isCorrect: false }] },
        { text: 'COLLSCAN in explain output means?', type: 'mcq', difficulty: 2, explanation: 'COLLSCAN means full collection scan (no index used). IXSCAN uses an index.',
          options: [{ text: 'Index was used', isCorrect: false }, { text: 'No index — full scan', isCorrect: true }, { text: 'Query was cached', isCorrect: false }, { text: 'Query failed', isCorrect: false }] },
      ]
    });
    console.log('✅ MongoDB');

    // ========== DOCKER ==========
    await createModuleWithQuiz({
      title: 'Docker & Kubernetes', slug: 'docker-kubernetes', category: 'devops', icon: '🐳', difficulty: 'intermediate',
      description: 'Containerize apps with Docker and orchestrate with Kubernetes.',
      lessons: [
        { title: 'Docker Fundamentals', order: 1, duration: 15, content: '## Dockerfile\n\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n```\n\n## Commands\n\n```bash\ndocker build -t myapp .\ndocker run -p 3000:3000 myapp\ndocker ps       # list running\ndocker stop <id>\n```' },
        { title: 'Docker Compose', order: 2, duration: 15, content: '## Multi-Container Apps\n\n```yaml\n# docker-compose.yml\nservices:\n  app:\n    build: .\n    ports: ["3000:3000"]\n    depends_on: [mongo]\n  mongo:\n    image: mongo:7\n    volumes:\n      - mongo_data:/data/db\nvolumes:\n  mongo_data:\n```\n\n```bash\ndocker-compose up -d\ndocker-compose down\n```' },
        { title: 'Kubernetes Basics', order: 3, duration: 20, content: '## K8s Core Concepts\n\n- **Pod**: Smallest unit (1+ containers)\n- **Deployment**: Manages pod replicas\n- **Service**: Exposes pods to network\n- **Ingress**: Routes external traffic\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: app\n        image: myapp:latest\n        ports:\n        - containerPort: 3000\n```' },
      ]
    }, {
      title: 'Docker & K8s Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What is a Docker container?', type: 'mcq', difficulty: 1, explanation: 'A container is a lightweight, isolated runtime from a Docker image.',
          options: [{ text: 'A virtual machine', isCorrect: false }, { text: 'A lightweight isolated process', isCorrect: true }, { text: 'A database', isCorrect: false }, { text: 'A cloud server', isCorrect: false }] },
        { text: 'What is a Kubernetes Pod?', type: 'mcq', difficulty: 2, explanation: 'A Pod is the smallest deployable unit in K8s, containing one or more containers.',
          options: [{ text: 'A server', isCorrect: false }, { text: 'A container image', isCorrect: false }, { text: 'The smallest deployable unit', isCorrect: true }, { text: 'A namespace', isCorrect: false }] },
        { text: 'Which command builds a Docker image?', type: 'mcq', difficulty: 1, explanation: 'docker build creates an image from a Dockerfile.',
          options: [{ text: 'docker run', isCorrect: false }, { text: 'docker build', isCorrect: true }, { text: 'docker create', isCorrect: false }, { text: 'docker start', isCorrect: false }] },
      ]
    });
    console.log('✅ Docker & Kubernetes');

    // ========== AWS ==========
    await createModuleWithQuiz({
      title: 'AWS Cloud Fundamentals', slug: 'aws-cloud', category: 'devops', icon: '☁️', difficulty: 'intermediate',
      description: 'Learn core AWS services — EC2, S3, Lambda, RDS, IAM, and deployment strategies.',
      lessons: [
        { title: 'EC2 & S3', order: 1, duration: 15, content: '## EC2 (Elastic Compute Cloud)\n\nVirtual servers in the cloud.\n\n- **Instance Types**: t2.micro (free), t3.medium, c5.large\n- **AMI**: Amazon Machine Image (OS template)\n- **Security Groups**: Firewall rules\n\n## S3 (Simple Storage Service)\n\nObject storage for files, backups, static websites.\n\n- **Buckets**: Top-level containers\n- **Objects**: Files up to 5TB\n- **Storage Classes**: Standard, IA, Glacier' },
        { title: 'Lambda & Serverless', order: 2, duration: 15, content: '## AWS Lambda\n\nRun code without managing servers.\n\n```javascript\nexports.handler = async (event) => {\n  const name = event.queryStringParameters.name;\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: `Hello ${name}` })\n  };\n};\n```\n\n**Triggers**: API Gateway, S3 events, DynamoDB streams, SQS\n**Limits**: 15 min timeout, 10GB memory, 250MB deployment' },
        { title: 'IAM & Security', order: 3, duration: 15, content: '## IAM (Identity & Access Management)\n\n- **Users**: Individual accounts\n- **Groups**: Collection of users\n- **Roles**: Temporary permissions for services\n- **Policies**: JSON permission documents\n\n**Best Practices:**\n- Never use root account for daily work\n- Enable MFA on all accounts\n- Grant least privilege\n- Use roles for EC2/Lambda instead of access keys' },
      ]
    }, {
      title: 'AWS Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What is AWS Lambda?', type: 'mcq', difficulty: 1, explanation: 'Lambda runs code without provisioning servers — you pay per invocation.',
          options: [{ text: 'A virtual machine', isCorrect: false }, { text: 'A serverless compute service', isCorrect: true }, { text: 'A database service', isCorrect: false }, { text: 'A storage service', isCorrect: false }] },
        { text: 'What does IAM stand for?', type: 'mcq', difficulty: 1, explanation: 'IAM = Identity and Access Management.',
          options: [{ text: 'Internet Access Manager', isCorrect: false }, { text: 'Identity and Access Management', isCorrect: true }, { text: 'Integrated App Monitor', isCorrect: false }, { text: 'Infrastructure as Management', isCorrect: false }] },
        { text: 'Which S3 storage class is cheapest for rarely accessed data?', type: 'mcq', difficulty: 2, explanation: 'Glacier is the cheapest option for archival/rarely accessed data.',
          options: [{ text: 'Standard', isCorrect: false }, { text: 'Intelligent-Tiering', isCorrect: false }, { text: 'Glacier', isCorrect: true }, { text: 'One Zone-IA', isCorrect: false }] },
      ]
    });
    console.log('✅ AWS Cloud');

    // ========== MACHINE LEARNING ==========
    await createModuleWithQuiz({
      title: 'Machine Learning', slug: 'machine-learning', category: 'ai', icon: '🤖', difficulty: 'intermediate',
      description: 'Learn regression, classification, clustering, neural networks, and model evaluation.',
      lessons: [
        { title: 'Supervised Learning', order: 1, duration: 20, content: '## Regression vs Classification\n\n- **Regression**: Predict continuous values (price, temperature)\n- **Classification**: Predict categories (spam/not, cat/dog)\n\n## Linear Regression\n\n```python\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n```\n\n## Logistic Regression (Classification)\n\nDespite the name, it is for binary classification using sigmoid function.' },
        { title: 'Decision Trees & Random Forests', order: 2, duration: 20, content: '## Decision Trees\n\nSplit data based on feature thresholds to minimize impurity (Gini/Entropy).\n\n**Pros:** Interpretable, no scaling needed\n**Cons:** Overfits easily\n\n## Random Forest\n\nEnsemble of many decision trees — each trained on random subset.\n\n```python\nfrom sklearn.ensemble import RandomForestClassifier\nrf = RandomForestClassifier(n_estimators=100)\nrf.fit(X_train, y_train)\nprint(rf.score(X_test, y_test))\n```' },
        { title: 'Model Evaluation', order: 3, duration: 15, content: '## Metrics\n\n- **Accuracy**: Correct / Total\n- **Precision**: TP / (TP + FP) — "of predicted positives, how many correct?"\n- **Recall**: TP / (TP + FN) — "of actual positives, how many found?"\n- **F1 Score**: Harmonic mean of precision and recall\n\n## Cross-Validation\n\n```python\nfrom sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5)\nprint(f"Accuracy: {scores.mean():.2f} ± {scores.std():.2f}")\n```' },
      ]
    }, {
      title: 'ML Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'Which task predicts continuous values?', type: 'mcq', difficulty: 1, explanation: 'Regression predicts continuous values. Classification predicts discrete categories.',
          options: [{ text: 'Classification', isCorrect: false }, { text: 'Regression', isCorrect: true }, { text: 'Clustering', isCorrect: false }, { text: 'Dimensionality Reduction', isCorrect: false }] },
        { text: 'What does F1 Score measure?', type: 'mcq', difficulty: 2, explanation: 'F1 is the harmonic mean of precision and recall, balancing both metrics.',
          options: [{ text: 'Only accuracy', isCorrect: false }, { text: 'Harmonic mean of precision and recall', isCorrect: true }, { text: 'Training speed', isCorrect: false }, { text: 'Model size', isCorrect: false }] },
        { text: 'Random Forest prevents overfitting by?', type: 'mcq', difficulty: 2, explanation: 'Random Forest uses multiple trees with random feature subsets, reducing variance.',
          options: [{ text: 'Using one deep tree', isCorrect: false }, { text: 'Averaging multiple random trees', isCorrect: true }, { text: 'Removing features', isCorrect: false }, { text: 'Using fewer data points', isCorrect: false }] },
      ]
    });
    console.log('✅ Machine Learning');

    // ========== C PROGRAMMING ==========
    await createModuleWithQuiz({
      title: 'C Programming', slug: 'c-programming', category: 'programming', icon: '⚙️', difficulty: 'beginner',
      description: 'Learn C from scratch — pointers, memory management, structs, and file I/O.',
      lessons: [
        { title: 'Pointers & Memory', order: 1, duration: 20, content: '## Pointers\n\n```c\nint x = 10;\nint *ptr = &x;  // ptr holds address of x\nprintf("%d", *ptr);  // Dereference: prints 10\n```\n\n## Dynamic Memory\n\n```c\nint *arr = (int*)malloc(5 * sizeof(int));\narr[0] = 42;\nfree(arr);  // Always free allocated memory!\n```' },
        { title: 'Structs & Unions', order: 2, duration: 15, content: '## Structs\n\n```c\nstruct Student {\n  char name[50];\n  int age;\n  float gpa;\n};\n\nstruct Student s1 = {"Alice", 20, 3.8};\nprintf("%s has GPA %.1f", s1.name, s1.gpa);\n```\n\n## Typedef\n\n```c\ntypedef struct { int x, y; } Point;\nPoint p = {10, 20};\n```' },
        { title: 'File I/O', order: 3, duration: 15, content: '## File Operations\n\n```c\nFILE *fp = fopen("data.txt", "r");\nchar line[256];\nwhile(fgets(line, sizeof(line), fp)) {\n  printf("%s", line);\n}\nfclose(fp);\n\n// Writing\nFILE *out = fopen("output.txt", "w");\nfprintf(out, "Score: %d\\n", 95);\nfclose(out);\n```' },
      ]
    }, {
      title: 'C Programming Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What does the * operator do with pointers?', type: 'mcq', difficulty: 1, explanation: '* dereferences a pointer — accesses the value at the memory address.',
          options: [{ text: 'Gets the address', isCorrect: false }, { text: 'Dereferences (gets value)', isCorrect: true }, { text: 'Multiplies', isCorrect: false }, { text: 'Declares a pointer', isCorrect: false }] },
        { text: 'What happens if you forget to call free() after malloc()?', type: 'mcq', difficulty: 2, explanation: 'Memory leak — allocated memory is never released, consuming RAM until program exits.',
          options: [{ text: 'Compiler error', isCorrect: false }, { text: 'Memory leak', isCorrect: true }, { text: 'Segfault', isCorrect: false }, { text: 'Nothing', isCorrect: false }] },
        { text: 'What does fopen("f.txt", "w") do if file exists?', type: 'mcq', difficulty: 2, explanation: '"w" mode overwrites the file. Use "a" to append.',
          options: [{ text: 'Appends to file', isCorrect: false }, { text: 'Overwrites the file', isCorrect: true }, { text: 'Returns NULL', isCorrect: false }, { text: 'Opens read-only', isCorrect: false }] },
      ]
    });
    console.log('✅ C Programming');

    // ========== DEEP LEARNING ==========
    await createModuleWithQuiz({
      title: 'Deep Learning', slug: 'deep-learning', category: 'ai', icon: '🧠', difficulty: 'advanced',
      description: 'Understand CNNs, RNNs, Transformers, and GANs for modern AI applications.',
      lessons: [
        { title: 'Neural Networks', order: 1, duration: 20, content: '## Perceptron → Deep Networks\n\nA neural network learns by adjusting weights through backpropagation.\n\n**Layers:** Input → Hidden (1+) → Output\n\n**Activation Functions:**\n- ReLU: max(0, x) — most common for hidden layers\n- Sigmoid: 1/(1+e^-x) — binary output\n- Softmax: multi-class probability\n\n```python\nimport tensorflow as tf\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(128, activation="relu"),\n  tf.keras.layers.Dense(10, activation="softmax")\n])\n```' },
        { title: 'CNNs for Computer Vision', order: 2, duration: 20, content: '## Convolutional Neural Networks\n\nDesigned for image data — learn spatial features.\n\n**Key Layers:**\n- Conv2D — feature detection (edges, textures)\n- MaxPooling — downsampling\n- Flatten → Dense — classification\n\n```python\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Conv2D(32, (3,3), activation="relu"),\n  tf.keras.layers.MaxPooling2D((2,2)),\n  tf.keras.layers.Flatten(),\n  tf.keras.layers.Dense(10, activation="softmax")\n])\n```' },
        { title: 'Transformers & Attention', order: 3, duration: 25, content: '## Self-Attention Mechanism\n\n"Attention Is All You Need" (2017) replaced RNNs.\n\n**Key Idea:** Each token attends to ALL other tokens in parallel.\n\nQ (Query) × K (Key)ᵀ / √d → Softmax → × V (Value)\n\n**Applications:**\n- BERT — bidirectional understanding\n- GPT — left-to-right generation\n- Vision Transformers (ViT) — images as patches\n\nTransformers enable parallelism → much faster training than RNNs.' },
      ]
    }, {
      title: 'Deep Learning Quiz', timeLimit: 10, randomize: true, antiCheat: { disableCopyPaste: true, tabSwitchLimit: 3 },
      questions: [
        { text: 'What is the most common activation function for hidden layers?', type: 'mcq', difficulty: 1, explanation: 'ReLU (Rectified Linear Unit) is the default for hidden layers — fast and avoids vanishing gradient.',
          options: [{ text: 'Sigmoid', isCorrect: false }, { text: 'ReLU', isCorrect: true }, { text: 'Tanh', isCorrect: false }, { text: 'Softmax', isCorrect: false }] },
        { text: 'CNNs are primarily used for?', type: 'mcq', difficulty: 1, explanation: 'CNNs excel at image data due to convolutional layers that detect spatial features.',
          options: [{ text: 'Text generation', isCorrect: false }, { text: 'Image recognition', isCorrect: true }, { text: 'Time series', isCorrect: false }, { text: 'Tabular data', isCorrect: false }] },
        { text: 'What did the Transformer architecture replace?', type: 'mcq', difficulty: 2, explanation: 'Transformers replaced RNN/LSTM architectures with self-attention, enabling parallel processing.',
          options: [{ text: 'CNNs', isCorrect: false }, { text: 'RNNs/LSTMs', isCorrect: true }, { text: 'Decision Trees', isCorrect: false }, { text: 'SVMs', isCorrect: false }] },
      ]
    });
    console.log('✅ Deep Learning');

    const totalModules = await Module.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    console.log(`\n🎉 Seed complete! ${totalModules} modules, ${totalQuizzes} quizzes in the Learning Hub.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedNewModules();
