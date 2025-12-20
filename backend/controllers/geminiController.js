const Groq = require('groq-sdk');
const Proposal = require('../models/Proposal');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.generateProposal = async (req, res) => {
  try {
    const { userName, ...proposal } = req.body;

    // Updated Prompt with User Name and Funding Agency
    const prompt = `You have to Generate a professional ready to use(so that we dont have to add any additional information such as date or address.) funding proposal based on the following information(make sure you create a large and ready to use report so you can add more data if required):

Project Title: ${proposal.projectTitle}
Principal Investigator/Researcher Name: ${userName}
Target Funding Agency: ${proposal.fundingAgency || 'Grant Committee'}
Funding Amount: $${proposal.fundingAmount}

Cover Letter: ${proposal.coverLetter}
Executive Summary: ${proposal.executiveSummary}
Introduction and Background: ${proposal.introductionAndBackground}
Statement of Need: ${proposal.statementOfNeed}
Goals, Objectives and Specific Aims: ${proposal.goalsObjectivesAndSpecificAims}
Commercialization Strategy: ${proposal.commercializationStrategy}
Budget and Justification: ${proposal.budgetAndJustification}
Timeline and Milestones: ${proposal.timelineAndMilestone}
Evaluation and Impact Plans: ${proposal.evaluationAndImpactPlans}
Sustainability Plans: ${proposal.sustainabilityPlans}
Appendices and Supporting Materials: ${proposal.appendicesAndSupportingMaterials}

Please create a comprehensive, well-structured funding proposal that incorporates all the provided information into the following sections:
1. Cover Letter (Address it to the ${proposal.fundingAgency || 'Grant Committee'} and sign it as ${userName})
2. Executive Summary
3. Introduction and Background
4. Statement of Need
5. Goals, Objectives and Specific Aims
6. Commercialization Strategy
7. Budget and Justification
8. Timeline and Milestones
9. Evaluation and Impact Plans
10. Sustainability Plans
11. Appendices and Supporting Materials

Format the proposal professionally with clear sections.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 4096,
    });

    const generatedText = completion.choices[0]?.message?.content || "No content generated.";

    res.json({ generatedProposal: generatedText });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate proposal',
      error: error.message 
    });
  }
};

exports.editProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { userPrompt } = req.body;

    // 1. Fetch the existing proposal
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // 2. Construct the prompt
    const systemPrompt = `You are an expert grant writer. 
    The user wants to edit an existing funding proposal based on specific instructions.
    
    ORIGINAL PROPOSAL:
    """
    ${proposal.generatedProposal}
    """
    
    USER INSTRUCTIONS:
    "${userPrompt}"
    
    TASK:
    Rewrite the proposal incorporating the user's instructions. 
    Maintain the professional tone, structure, and Markdown formatting. 
    Do not add conversational filler (like "Here is the updated version"). 
    Return ONLY the full updated proposal text.`;

    // 3. Call AI
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful research grant assistant." },
        { role: "user", content: systemPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 4096,
    });

    const updatedText = completion.choices[0]?.message?.content || proposal.generatedProposal;

    // 4. Update Database
    proposal.generatedProposal = updatedText;
    await proposal.save();

    // 5. Return updated proposal
    res.json({ 
      message: 'Proposal updated successfully', 
      generatedProposal: updatedText 
    });

  } catch (error) {
    console.error('Edit Proposal Error:', error);
    res.status(500).json({ 
      message: 'Failed to edit proposal',
      error: error.message 
    });
  }
};