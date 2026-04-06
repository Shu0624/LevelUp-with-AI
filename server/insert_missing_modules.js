import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Module from './models/Module.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const newModules = [
  {
    title: 'Agentic AI',
    slug: 'agentic-ai',
    category: 'ai',
    description: 'Build autonomous AI agents using LangChain, tool use, ReAct loops, and multi-agent orchestration.',
    icon: '🤖',
    difficulty: 'advanced',
    lessons: [
      {
        title: 'What are AI Agents?',
        content: `## AI Agents Overview

An AI Agent is an LLM that can **reason**, **use tools**, and **take actions** autonomously to achieve a goal.

**Key Components:**
- **LLM Brain** — The reasoning engine (GPT-4, Claude, Gemini)
- **Tools** — Functions the agent can call (search, calculator, API, database)
- **Memory** — Short-term (context window) and long-term (vector store)
- **Planner** — Decides what action to take next

**ReAct Loop (Reason + Act):**
\`\`\`
Thought: I need to search for the weather in Delhi
Action: search("weather Delhi today")
Observation: 32°C, sunny
Thought: I have the answer
Final Answer: It is 32°C and sunny in Delhi today.
\`\`\``,
        order: 1,
        duration: 20
      },
      {
        title: 'LangChain Agents',
        content: `## Building Agents with LangChain

LangChain is the most popular framework for building AI agents.

\`\`\`python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from langchain.tools import DuckDuckGoSearchRun

llm = OpenAI(temperature=0)
search = DuckDuckGoSearchRun()

tools = [
  Tool(
    name="Search",
    func=search.run,
    description="Useful for answering questions about current events"
  )
]

agent = initialize_agent(
  tools, llm,
  agent="zero-shot-react-description",
  verbose=True
)

agent.run("What is the latest news about AI agents?")
\`\`\`

**Types of Agents:**
- Zero-shot ReAct
- Conversational ReAct
- Plan-and-Execute
- OpenAI Functions Agent`,
        order: 2,
        duration: 25
      },
      {
        title: 'Multi-Agent Systems',
        content: `## Multi-Agent Orchestration

Multiple specialized agents working together.

**Frameworks:**
- **AutoGen** (Microsoft) — Agent conversation framework
- **CrewAI** — Role-based agent teams
- **LangGraph** — Graph-based agent workflows

\`\`\`python
from crewai import Agent, Task, Crew

researcher = Agent(
  role='Researcher',
  goal='Find accurate information',
  backstory='Expert at finding reliable data online',
  tools=[search_tool]
)

writer = Agent(
  role='Writer',
  goal='Write compelling content',
  backstory='Expert technical writer',
)

task = Task(
  description='Research and write about Agentic AI',
  agent=researcher
)

crew = Crew(agents=[researcher, writer], tasks=[task])
result = crew.kickoff()
\`\`\``,
        order: 3,
        duration: 30
      }
    ]
  },
  {
    title: 'MERN Full Stack',
    slug: 'mern-fullstack',
    category: 'programming',
    description: 'Build production-grade full-stack apps with MongoDB, Express, React, and Node.js.',
    icon: '🌐',
    difficulty: 'intermediate',
    lessons: [
      {
        title: 'MERN Architecture',
        content: `## MERN Stack Overview

**MERN** is a full-stack JavaScript ecosystem:

| Layer | Technology | Role |
|-------|-----------|------|
| Database | **MongoDB** | NoSQL document store |
| Backend | **Express.js** | REST API framework |
| Frontend | **React.js** | UI library |
| Runtime | **Node.js** | JavaScript server runtime |

**Request Flow:**
\`\`\`
Browser → React (SPA) → Express API → MongoDB
                ↑                         |
                └─────── JSON Data ───────┘
\`\`\`

**Why MERN?**
- One language (JavaScript) across the entire stack
- JSON everywhere — no data format transformation
- Massive ecosystem and community
- Used by Netflix, LinkedIn, Uber`,
        order: 1,
        duration: 15
      },
      {
        title: 'Express REST API',
        content: `## Building REST APIs with Express

\`\`\`javascript
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// Mongoose Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false }
});
const User = mongoose.model('User', userSchema);

// REST Routes
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

app.listen(5000, () => console.log('Server on port 5000'));
\`\`\``,
        order: 2,
        duration: 25
      },
      {
        title: 'React + API Integration',
        content: `## Connecting React to Your API

\`\`\`jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const createUser = async (data) => {
    const res = await axios.post('/api/users', data);
    setUsers(prev => [...prev, res.data]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(u => <li key={u._id}>{u.name}</li>)}
    </ul>
  );
};
\`\`\`

**Key Patterns:**
- Context API / Redux for global state
- React Query for server state caching
- JWT in localStorage for authentication`,
        order: 3,
        duration: 25
      },
      {
        title: 'Authentication & Deployment',
        content: `## JWT Auth & Deployment

**JWT Authentication Flow:**
\`\`\`javascript
// Backend: Generate token on login
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

// Protect routes with middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
\`\`\`

**Deployment Options:**
- **Vercel** — Frontend + Serverless API
- **Railway / Render** — Node.js backend
- **MongoDB Atlas** — Cloud database`,
        order: 4,
        duration: 20
      }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const result = await Module.insertMany(newModules);
    console.log(`✅ Inserted ${result.length} new modules:`);
    result.forEach(m => console.log(`  + "${m.title}" (${m.slug})`));

    const total = await Module.countDocuments();
    console.log(`\n📚 Total modules in DB: ${total}`);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
});
