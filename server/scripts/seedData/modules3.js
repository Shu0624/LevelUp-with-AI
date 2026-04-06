export const dbaDevopsModules = [
  {
    title: 'SQL & Relational Databases',
    slug: 'sql',
    category: 'database',
    description: 'Master querying, joins, indexing, and ACID transactions in SQL.',
    icon: '💾',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Basic Queries & Aggregation', content: '## Queries\n\n```sql\nSELECT column1, column2, COUNT(*) as count\nFROM table_name\nWHERE condition\nGROUP BY column1\nHAVING count > 5\nORDER BY column2 DESC\nLIMIT 10;\n```', order: 1, duration: 15 },
      { title: 'Joins', content: '## Joins\n\nCombine data from multiple tables.\n\n- `INNER JOIN`: Records with matching values in both tables.\n- `LEFT JOIN`: All records from left table, and matched ones from right.\n- `RIGHT JOIN`: All records from right table, and matched ones from left.\n- `FULL OUTER JOIN`: All records when there is a match in either left or right.\n\n```sql\nSELECT orders.id, customers.name\nFROM orders\nINNER JOIN customers ON orders.customer_id = customers.id;\n```', order: 2, duration: 20 },
      { title: 'Indexing & Performance', content: '## Indexing\n\nAn index is a data structure (B-Tree usually) that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space.\n\n```sql\nCREATE INDEX idx_lastname ON Persons (LastName);\n```\n\nAvoid full table scans!', order: 3, duration: 20 },
      { title: 'ACID Transactions', content: '## ACID Properties\n\n- **Atomicity**: All or nothing.\n- **Consistency**: DB remains in a valid state.\n- **Isolation**: Concurrent transactions do not affect each other.\n- **Durability**: Committed transactions are saved permanently.\n\n```sql\nBEGIN TRANSACTION;\nUPDATE Accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE Accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT; -- If error occurs, use ROLLBACK;\n```', order: 4, duration: 15 }
    ]
  },
  {
    title: 'MongoDB Mastery',
    slug: 'mongodb',
    category: 'database',
    description: 'Learn NoSQL document-based databases, aggregation, and performance tuning.',
    icon: '🍃',
    difficulty: 'intermediate',
    lessons: [
      { title: 'NoSQL vs SQL', content: '## NoSQL Paradigms\n\nMongoDB stores data in flexible, JSON-like documents (BSON), meaning fields can vary from document to document and data structure can be changed over time.\n\n```javascript\n// MongoDB Document\n{\n  _id: ObjectId("507f191e810c19729de860ea"),\n  name: "Sue",\n  age: 26,\n  status: "A",\n  groups: ["news", "sports"]\n}\n```', order: 1, duration: 15 },
      { title: 'CRUD Operations', content: '## CRUD\n\n```javascript\n// Insert\ndb.users.insertOne({ name: "Alice", age: 25 })\n\n// Find\ndb.users.find({ age: { $gt: 20 } })\n\n// Update\ndb.users.updateMany(\n  { age: { $lt: 25 } },\n  { $set: { status: "junior" } }\n)\n\n// Delete\ndb.users.deleteOne({ name: "Alice" })\n```', order: 2, duration: 20 },
      { title: 'Aggregation Pipeline', content: '## Aggregation\n\nThe aggregation pipeline processes data through a series of stages.\n\n```javascript\ndb.orders.aggregate([\n  // Stage 1: Filter\n  { $match: { status: "A" } },\n  // Stage 2: Group by customer\n  { $group: {\n      _id: "$cust_id",\n      total: { $sum: "$amount" }\n    }\n  },\n  // Stage 3: Sort\n  { $sort: { total: -1 } }\n])\n```', order: 3, duration: 25 }
    ]
  },
  {
    title: 'Docker & Kubernetes',
    slug: 'docker-kubernetes',
    category: 'devops',
    description: 'Containerize your applications and orchestrate them at scale.',
    icon: '🐳',
    difficulty: 'advanced',
    lessons: [
      { title: 'What is Docker?', content: '## Containers vs VMs\n\nContainers share the host OS kernel, making them lightweight and extremely fast to start compared to VMs which need a full guest OS loading.\n\nDocker solves the "It works on my machine" problem by bundling code, runtime, and dependencies into an image.', order: 1, duration: 15 },
      { title: 'Writing Dockerfiles', content: '## Dockerfile\n\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n```\n\nBuild and run:\n`docker build -t myapp .`\n`docker run -p 3000:3000 myapp`', order: 2, duration: 20 },
      { title: 'Docker Compose', content: '## Docker Compose\n\nDefine multi-container applications.\n\n```yaml\nversion: \'3.8\'\nservices:\n  web:\n    build: .\n    ports:\n      - "5000:5000"\n    environment:\n      - MONGO_URI=mongodb://db:27017/app\n  db:\n    image: mongo:latest\n    volumes:\n      - db_data:/data/db\nvolumes:\n  db_data:\n```', order: 3, duration: 20 },
      { title: 'Kubernetes (K8s) Pods & Deployments', content: '## K8s Basics\n\nK8s orchestrates containers. \n\n- **Pod**: Smallest unit in K8s. One or more containers.\n- **Deployment**: Manages Pod replicas, ensures desired state.\n- **Service**: Exposes Pods to external traffic.\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.14.2\n        ports:\n        - containerPort: 80\n```', order: 4, duration: 30 }
    ]
  },
  {
    title: 'AWS Cloud Fundamentals',
    slug: 'aws-cloud',
    category: 'devops',
    description: 'Learn the core services of Amazon Web Services.',
    icon: '☁️',
    difficulty: 'intermediate',
    lessons: [
      { title: 'EC2 & Compute', content: '## EC2 (Elastic Compute Cloud)\n\nVirtual servers in the cloud. You choose the OS, CPU, RAM, and storage.\n\nAuto Scaling Groups spin up new EC2 instances when CPU utilization gets high, and scale down when traffic drops to save money.', order: 1, duration: 15 },
      { title: 'S3 & Storage', content: '## S3 (Simple Storage Service)\n\nObject storage service for images, backups, videos. Data is stored in "Buckets".\n\nFeatures: Versioning, Lifecyle Policies (e.g., move to Glacier after 30 days for cheap long-term storage).', order: 2, duration: 15 },
      { title: 'IAM & Security', content: '## IAM (Identity and Access Management)\n\nControls who is authenticated (signed in) and authorized (has permissions) to use resources.\n\n- **Users**: Individuals\n- **Groups**: Collections of users\n- **Roles**: Temporary permissions for instances/services (Don\'t hardcode AWS keys in EC2 apps, use IAM Roles!)', order: 3, duration: 20 }
    ]
  }
];
