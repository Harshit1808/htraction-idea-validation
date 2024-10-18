
const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");
const mongoose = require("mongoose"); // Import mongoose
require("dotenv").config(); // Import dotenv and load environment variables
// import dotenv from 'dotenv';

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connect to MongoDB
mongoose.connect("mongodb+srv://htraction:htraction2024@htraction.hfosj.mongodb.net/?retryWrites=true&w=majority&appName=htraction", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Define a schema and model for the validation report
const ValidationReportSchema = new mongoose.Schema({
  idea: String,
  modelName: String,
  maxToken: Number,
  overallReport: String,
  testerName: String,
  createdAt: { type: Date, default: Date.now },
});

const ValidationReport = mongoose.model("ValidationReport", ValidationReportSchema);

// Functions to generate validation for individual inputs
async function validateIdea(ideaInput) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert in startup validation." },
      {
        role: "user",
        //content: `Evaluate the following entrepreneurial idea:\n\nIdea:\n${ideaInput}\n\nProvide the following three things:\n1. Validation of what the user has written.\n2. Suggestions for improving the idea.\n3. A rating out of 10 for the idea.`,
        content: `Evaluate the following entrepreneurial idea:Idea: ${ideaInput}
Validate the idea based on the following three criteria:
Product-Market Fit: Assess whether there is a market need for the product, if the problem is significant, and if the solution effectively addresses it.
Scalability: Evaluate the potential for growth, whether the business can expand without a significant increase in costs, and if the infrastructure can support rapid growth.
Uniqueness: Determine if the idea stands out from existing solutions, whether it brings a new perspective or approach, and if there is a sustainable competitive advantage.
Provide the following three things in output:
Validation of the idea based on the above criteria.
Suggestions for improving the idea.
A rating on a scale of 1-10, considering the three criteria.
`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  });
  return completion.choices[0].message.content;
}

async function validateMarketSize(marketSizeInput) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert in market validation." },
      {
        role: "user",
        content: `
Evaluate the market for startup:

Market Input:
${marketSizeInput}

Validate the idea based on the following market criteria:

Market Details: Consider the specifics of the market, including industry characteristics and competitive landscape.
Market Size: Assess the size of the potential market and its growth potential.
Target Audience: Evaluate whether the idea effectively addresses the needs and preferences of the intended audience.
Market Trends: Determine if the idea aligns with current trends and emerging opportunities in the market.

Provide the following three things:

Validation of the idea based on the above criteria.
Suggestions for improving the idea.
A rating on a scale of 1-10, considering the market criteria.

`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 500,
  });
  return completion.choices[0].message.content;
}

async function validateProblemSolution(problemSolutionInput) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert in problem and solution evaluation for startups." },
      {
        role: "user",
        content: `Evaluate the problem statement and solution for this startup:Idea:\n\nProblem & Solution:\n${problemSolutionInput} 

Validate the idea based on the following problem and solution criteria:

Identified Problem: Assess if the problem is clearly defined, significant, and worth solving.
Solution Effectiveness: Evaluate how well the proposed solution addresses the identified problem and whether it provides a viable approach.
Unique Value Proposition: Determine if the solution offers a distinct advantage or benefit that sets it apart from existing alternatives.

Provide the following three things:

Validation of the idea based on the above criteria.
Suggestions for improving the idea.
A rating on a scale of 1-10, considering the problem and solution criteria.

`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 500,
  });
  return completion.choices[0].message.content;
}

async function validateBusinessModel(businessModelInput) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert in evaluating startup business models." },
      {
        role: "user",
        content: `Evaluate the business model for this startup:\n\nBusiness Model:\n${businessModelInput}

Validate the idea based on the following business model and competitors criteria:

Major Revenue Stream: Assess the primary source of income and its potential for sustainability and growth.
Idea Scalability: Evaluate whether the business model allows for growth without a significant increase in costs.
Competitors: Consider the current competitive landscape and how the idea compares to existing players.
Differentiating Factor: Determine if the idea has a unique attribute or advantage that sets it apart from competitors.

Provide the following three things:

Validation of the idea based on the above criteria.
Suggestions for improving the idea.
A rating on a scale of 1-10, considering the business model and competitors criteria.

`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 500,
  });
  return completion.choices[0].message.content;
}

// API routes for individual input validations
app.post("/api/validate-idea", async (req, res) => {
  const { ideaInput } = req.body;
  if (!ideaInput) return res.status(400).json({ error: "Idea input is required." });

  try {
    const validation = await validateIdea(ideaInput);
    res.json({ validation });
  } catch (error) {
    console.error("Error generating idea validation:", error);
    res.status(500).json({ error: "Failed to validate idea." });
  }
});

app.post("/api/validate-market-size", async (req, res) => {
  const { marketSizeInput } = req.body;
  if (!marketSizeInput) return res.status(400).json({ error: "Market size input is required." });

  try {
    const validation = await validateMarketSize(marketSizeInput);
    res.json({ validation });
  } catch (error) {
    console.error("Error generating market size validation:", error);
    res.status(500).json({ error: "Failed to validate market size." });
  }
});

app.post("/api/validate-problem-solution", async (req, res) => {
  const { problemSolutionInput } = req.body;
  if (!problemSolutionInput) return res.status(400).json({ error: "Problem & solution input is required." });

  try {
    const validation = await validateProblemSolution(problemSolutionInput);
    res.json({ validation });
  } catch (error) {
    console.error("Error generating problem & solution validation:", error);
    res.status(500).json({ error: "Failed to validate problem & solution." });
  }
});

app.post("/api/validate-business-model", async (req, res) => {
  const { businessModelInput } = req.body;
  if (!businessModelInput) return res.status(400).json({ error: "Business model input is required." });

  try {
    const validation = await validateBusinessModel(businessModelInput);
    res.json({ validation });
  } catch (error) {
    console.error("Error generating business model validation:", error);
    res.status(500).json({ error: "Failed to validate business model." });
  }
});

// API to generate overall report
app.post("/api/overall-validation-report", async (req, res) => {
  const { ideaInput, marketSizeInput, problemSolutionInput, businessModelInput } = req.body;

  if (!ideaInput || !marketSizeInput || !problemSolutionInput || !businessModelInput) {
    return res.status(400).json({ error: "All inputs (idea, market size, problem & solution, business model) are required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a business expert evaluating startup ideas." },
        {
          role: "user",
          content: `
          "Evaluate the following startup idea based on the provided details ${ideaInput} ${marketSizeInput} ${problemSolutionInput} ${businessModelInput}. Assess its potential by considering product-market fit, scalability, and uniqueness, and then generate a validation report with a rating out of 10. The report should include:
           Validation Summary: Provide an overall assessment of the startup idea, highlighting its strengths and potential challenges.
           Recommendations/Suggestions: Offer suggestions to improve the idea's market positioning, growth strategy, or other aspects.
           Rating (1-10 scale): Rate the idea based on the analysis, considering how well it aligns with market needs, its growth potential, and how distinctive it is compared to competitors.
          `,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 500,
    });

    res.json({ overallReport: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error generating overall validation report:", error);
    res.status(500).json({ error: "Failed to generate overall validation report." });
  }
});

// API to generate overall report
// app.post("/api/analysis-validation-report", async (req, res) => {
//   const { idea, modelName, maxToken } = req.body;
//   console.log(idea, modelName, maxToken);

//   if (!idea || !maxToken || !modelName) {
//     return res.status(400).json({ error: "All inputs (idea, market size, problem & solution, business model) are required." });
//   }
//   const token=parseInt(maxToken);

//   try {
//     const completion = await openai.chat.completions.create({
//       messages: [
//         { role: "system", content: "You are a business expert evaluating startup ideas." },
//         {
//           role: "user",
//           content: `${idea}`,
//         },
//       ],
//       model: `${modelName}`,
//       max_tokens: token,
//     });

//     res.json({ overallReport: completion.choices[0].message.content });
//   } catch (error) {
//     console.error("Error generating overall validation report:", error);
//     res.status(500).json({ error: "Failed to generate overall validation report." });
//   }
// });

// API to generate overall report and store in MongoDB
app.post("/api/analysis-validation-report", async (req, res) => {
  const { idea, modelName, maxToken, testerName } = req.body;
  console.log(idea, modelName, maxToken);

  if (!idea || !maxToken || !modelName || !testerName) {
    return res.status(400).json({ error: "All inputs (idea, market size, problem & solution, business model) are required." });
  }
  const token = parseInt(maxToken);

  try {
    // Generate validation report using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a business expert evaluating startup ideas." },
        { role: "user", content: `${idea}` },
      ],
      model: `${modelName}`,
      max_tokens: token,
    });

    const overallReport = completion.choices[0].message.content;

    // Create a new validation report entry
    const validationReport = new ValidationReport({
      idea,
      modelName,
      maxToken: token,
      overallReport,
      testerName,
    });

    // Save the report to MongoDB
    await validationReport.save();

    res.json({ overallReport });
  } catch (error) {
    console.error("Error generating overall validation report:", error);
    res.status(500).json({ error: "Failed to generate overall validation report." });
  }
});

// API to get all validation reports
app.get('/api/validation-reports', async (req, res) => {
  try {
    // Fetch all validation reports from the database
    console.log('Fetching reports...');
    const reports = await ValidationReport.find(); // Retrieve all reports from MongoDB

    // If no reports are found
    if (reports.length === 0) {
      return res.status(404).json({ message: 'No validation reports found.' });
    }

    console.log('Reports:', reports);

    // Send the reports back as a response
    res.json(reports);
  } catch (error) {
    console.error('Error fetching validation reports:', error);
    res.status(500).json({ error: 'Failed to fetch validation reports.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});


