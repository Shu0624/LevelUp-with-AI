export const csModules = [
  {
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    category: 'core_cs',
    description: 'Master Data Structures and Algorithms for technical interviews and competitive programming.',
    icon: '🌳',
    difficulty: 'advanced',
    lessons: [
      { title: 'Big O Notation', content: '## Time & Space Complexity\n\nBig O describes the worst-case scenario describing the execution time or space used by an algorithm.\n\n- `O(1)`: Constant (Array direct lookup)\n- `O(log n)`: Logarithmic (Binary search)\n- `O(n)`: Linear (Array traversal)\n- `O(n log n)`: Linearithmic (Merge sort)\n- `O(n^2)`: Quadratic (Nested loops, Bubble sort)\n- `O(2^n)`: Exponential (Recursive fibonacci)', order: 1, duration: 15 },
      { title: 'Arrays & LinkedLists', content: '## Linear Structures\n\n**Arrays** are contiguous memory blocks. Access is `O(1)`, but insertions/deletions in the middle are `O(n)`.\n\n**Linked Lists** consist of nodes pointing to each other. Access is `O(n)`, but insertions/deletions at known positions are `O(1)`.\n\nReverse a Linked List (Classic): \n```javascript\nlet prev = null;\nlet curr = head;\nwhile(curr != null) {\n  let next = curr.next;\n  curr.next = prev;\n  prev = curr;\n  curr = next;\n}\nreturn prev;\n```', order: 2, duration: 25 },
      { title: 'Stacks & Queues', content: '## LIFO & FIFO\n\n**Stack (LIFO)**: Last In, First Out. (Used in DFS, valid parenthesis checks).\n\n**Queue (FIFO)**: First In, First Out. (Used in BFS, job scheduling).\n\n```javascript\n// Stack using Array\nconst stack = [];\nstack.push(1); // Add to top\nconst top = stack.pop(); // Remove from top\n```', order: 3, duration: 15 },
      { title: 'Trees & Graphs', content: '## Non-linear Structures\n\n**Binary Search Tree (BST)**: Left child < parent, Right child > parent. Search is `O(log n)` on average.\n\n**Graphs**: Networks of nodes and edges.\n\n**Traversals**:\n- BFS (Breadth-First Search): Uses a Queue. Level-by-level.\n- DFS (Depth-First Search): Uses a Stack/Recursion. Goes deep first.\n\nIn-order Traversal of BST visits nodes in sorted order.', order: 4, duration: 30 },
      { title: 'Sorting & Searching', content: '## Classic Algorithms\n\n**Binary Search**: `O(log n)`. Array MUST be sorted.\n```javascript\nlet l = 0, r = arr.length - 1;\nwhile(l <= r) {\n  let m = l + Math.floor((r-l)/2);\n  if(arr[m] === target) return m;\n  if(arr[m] < target) l = m + 1;\n  else r = m - 1;\n}\n```\n\n**Merge Sort**: `O(n log n)`. Divide array into half, sort both halves, then merge.', order: 5, duration: 25 },
      { title: 'Dynamic Programming', content: '## Dynamic Programming\n\nBreaking complex problems down into simpler subproblems and storing results (memoization).\n\nClimbing Stairs Example:\n```javascript\nfunction climbStairs(n) {\n  let dp = new Array(n + 1);\n  dp[1] = 1;\n  dp[2] = 2;\n  for(let i=3; i<=n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}\n```', order: 6, duration: 35 }
    ]
  },
  {
    title: 'System Design',
    slug: 'system-design',
    category: 'core_cs',
    description: 'Learn how to design highly scalable, reliable, and distributed systems.',
    icon: '🏗️',
    difficulty: 'advanced',
    lessons: [
      { title: 'Scaling: Vertical vs Horizontal', content: '## Scaling\n\n**Vertical Scaling (Scale Up)**: Buying a bigger machine (more RAM, CPU). Easy, but has a hard limit and a single point of failure.\n\n**Horizontal Scaling (Scale Out)**: Adding more machines to the pool. Harder to manage state, but virtually limitless scaling.\n\nModern scalable apps default to horizontal scaling using stateless application servers.', order: 1, duration: 15 },
      { title: 'Load Balancing & Caching', content: '## Distributing Load\n\n**Load Balancers** distribute incoming network traffic across multiple servers to ensure no single server bears too much demand.\n- Algorithms: Round robin, Least connections, IP hash.\n\n**Caching**: Storing frequently accessed data in fast memory (e.g., Redis, Memcached) to reduce DB load.\n- Read-through, Write-through, Write-behind caching strategies.', order: 2, duration: 20 },
      { title: 'Database Scaling', content: '## Scaling Databases\n\n- **Replication**: Master-Slave (Master takes writes, slaves take reads). Enhances read scalability.\n- **Sharding**: Horizontally partitioning data across multiple database instances based on a shard key.\n- **CAP Theorem**: You can only guarantee 2 out of 3 — Consistency, Availability, Partition Tolerance. (Network partitions will happen, so pick CP or AP).', order: 3, duration: 25 },
      { title: 'Microservices vs Monoliths', content: '## Architectures\n\n**Monolith**: All application logic in one codebase/deployment. Easy to test initially, hard to scale specific components later.\n\n**Microservices**: Application broken down into independent loosely coupled services communicating via APIs (REST, gRPC, Message Queues). Allows polyglot architectures and independent deployments.', order: 4, duration: 20 },
      { title: 'System Design Interview Step-by-Step', content: '## The Framework\n\n1. **Clarify Requirements** (Functional & Non-Functional)\n2. **Back-of-the-envelope estimation** (Traffic, Storage, Bandwidth)\n3. **Define System APIs**\n4. **High-Level Design** (Draw boxes: LB, API, Cache, DB)\n5. **Deep Dive** (Address bottlenecks, shard keys, caching layers)', order: 5, duration: 30 }
    ]
  }
];
