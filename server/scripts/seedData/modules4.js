export const aiAptitudeModules = [
  {
    title: 'Generative AI Basics',
    slug: 'genai-basics',
    category: 'ai',
    description: 'Understand how LLMs, transformers, prompting, and RAG work.',
    icon: '🤖',
    difficulty: 'beginner',
    lessons: [
      { title: 'What is Generative AI?', content: '## Generative AI Overview\n\nGenerative AI creates new content (text, images, code) by learning patterns from data.\n\n**Key Models:**\n- GPT (OpenAI) — Text generation\n- DALL-E / Midjourney — Image generation\n- Codex / Copilot — Code generation\n\n**How it works:**\n1. Training on massive datasets\n2. Learning statistical patterns\n3. Generating predictions token-by-token\n\nTransformers architecture (2017) revolutionized NLP with self-attention mechanisms.', order: 1, duration: 15 },
      { title: 'Prompt Engineering', content: '## Prompt Engineering\n\nThe art of crafting effective prompts:\n\n**Techniques:**\n1. **Zero-shot** — Direct instruction\n2. **Few-shot** — Provide examples\n3. **Chain-of-Thought** — "Think step by step"\n4. **Role prompting** — "You are an expert in..."\n\n**Example:**\n```\nBad: "Write code"\nGood: "Write a Python function that takes a list of integers and returns the two numbers that sum to a target value. Include type hints and docstring."\n```', order: 2, duration: 20 },
      { title: 'RAG & Embeddings', content: '## Retrieval-Augmented Generation\n\nRAG combines search with generation:\n\n1. **Embed** documents into vector space\n2. **Retrieve** relevant chunks for a query\n3. **Generate** answer using retrieved context + LLM\n\n**Tools:** LangChain, LlamaIndex, Pinecone, ChromaDB\n\n**Why RAG?** LLMs hallucinate — RAG grounds answers in real data.', order: 3, duration: 20 }
    ]
  },
  {
    title: 'Machine Learning',
    slug: 'machine-learning',
    category: 'ai',
    description: 'Core concepts of ML: Regression, Classification, and Clustering.',
    icon: '📊',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Supervised vs Unsupervised', content: '## ML Paradigms\n\n**Supervised Learning**: Data has labels (e.g., predicting house prices from features). Algorithms: Linear Regression, Logistic Regression, Random Forest.\n\n**Unsupervised Learning**: Data has no labels, find hidden structures (e.g., customer segmentation). Algorithms: K-Means Clustering, PCA.\n\n**Reinforcement Learning**: Agent learns to act in an environment via reward and punishment (e.g., AlphaGo).', order: 1, duration: 20 },
      { title: 'Linear & Logistic Regression', content: '## Regressions\n\n**Linear Regression**: Predicting a continuous value (price, temperature). Fits a line `y = mx + b` to the data minimizing the Mean Squared Error (MSE).\n\n**Logistic Regression**: Predicting a discrete class (spam vs non-spam). Uses a Sigmoid function to output a probability between 0 and 1.', order: 2, duration: 25 },
      { title: 'Model Evaluation', content: '## Overfitting & Metrics\n\n**Overfitting**: Model learns the training data too well, capturing noise, and fails to generalize on test data.\n\n**Metrics**:\n- Classification: Accuracy, Precision, Recall, F1-Score, ROC-AUC.\n- Regression: MSE, RMSE, MAE, R-squared.\n\nAlways split your data: Train (80%) and Test (20%).', order: 3, duration: 20 }
    ]
  },
  {
    title: 'Deep Learning',
    slug: 'deep-learning',
    category: 'ai',
    description: 'Neural Networks, CNNs, and RNNs.',
    icon: '🧠',
    difficulty: 'advanced',
    lessons: [
      { title: 'Neural Networks', content: '## Artificial Neural Nets\n\nInspired by biological brains. Consists of Input layer, Hidden layers, and Output layer.\n\nEach connection has a **weight**. Each neuron has a **bias** and an **activation function** (ReLU, Sigmoid).\n\n**Backpropagation**: The algorithm used to adjust weights based on the error of the output, using gradient descent.', order: 1, duration: 25 },
      { title: 'CNNs for Vision', content: '## Convolutional Neural Networks\n\nUsed primarily for image data. Applies "filters" (convolutions) to detect edges, shapes, and features.\n\n**Pooling**: Reduces spatial dimensions (downsampling) to lower computation.\nClassic CNNs: ResNet, VGG, Inception.', order: 2, duration: 20 },
      { title: 'RNNs & LSTMs', content: '## Sequential Data\n\nRecurrent Neural Networks (RNNs) have "memory" of previous inputs, used for text and time-series data.\n\n**Vanishing Gradient Problem**: Basic RNNs forget early inputs. Solved by LSTMs (Long Short-Term Memory) which use gates to control information flow.', order: 3, duration: 25 }
    ]
  },
  {
    title: 'Logical Reasoning',
    slug: 'logical-reasoning',
    category: 'aptitude',
    description: 'Master the logical reasoning patterns tested in placement aptitude rounds.',
    icon: '🧩',
    difficulty: 'intermediate',
    lessons: [
      { title: 'Number Series', content: '## Number Series\n\nIdentify the pattern and find the next number.\n\n**Common patterns:**\n- Arithmetic: +2, +2, +2 → 2, 4, 6, 8, ?\n- Geometric: ×2 → 3, 6, 12, 24, ?\n- Fibonacci-like: Each = sum of previous two\n- Alternating: Two interwoven series\n\n**Example:** 2, 6, 12, 20, 30, ?\nDifferences: 4, 6, 8, 10 → next diff = 12 → Answer = 42', order: 1, duration: 15 },
      { title: 'Syllogisms', content: '## Syllogisms\n\nDraw logical conclusions from given statements.\n\n**Rules:**\n- All A are B + All B are C → All A are C\n- Some A are B does NOT mean Some B are A (it does, actually)\n- No A are B + All B are C → No A are C\n\n**Use Venn Diagrams** to visualize relationships.\n\n**Example:**\nStatement: All cats are animals. Some animals are wild.\nConclusion: Some cats are wild — **INVALID** (not necessarily true)', order: 2, duration: 20 },
      { title: 'Blood Relations', content: '## Blood Relations\n\n**Key mappings:**\n- Father\'s/Mother\'s son = Brother\n- Father\'s/Mother\'s daughter = Sister\n- Father\'s brother = Uncle\n- Mother\'s brother = Maternal Uncle\n\n**Tip:** Draw a family tree diagram for complex problems.\n\n**Example:** A is B\'s brother. C is A\'s mother. D is C\'s father. What is D to B?\nAnswer: D is B\'s maternal grandfather.', order: 3, duration: 15 }
    ]
  }
];
