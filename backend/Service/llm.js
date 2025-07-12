const {prompts_user, prompts_system} = require("./prompts.js");
const Groq = require("groq-sdk");

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

const llm = async (Title,Description,Tags) => {
    const user = prompts_user(Title, Description, Tags);
    const system = prompts_system();
    const response = await getGroqChatCompletion(system, user);
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}

async function getGroqChatCompletion(prompts_system, prompts_user) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: prompts_system,
      },
      {
        role: "user",
        content: prompts_user,
      }

    ],
    model: "llama-3.3-70b-versatile",
  });
}

module.exports = llm;