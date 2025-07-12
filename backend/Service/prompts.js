const prompts_user = (Title,Decription,Tags) => {
    return `
    Title : ${Title}
    Description : ${Decription}
    Tags : ${Tags}
    `
}

const prompts_system = () => {
    return `
    You are a Q/A expert. You will be given a title as question , a brief description and tags related to that question.
    Your task is provide a detailed answer to the question based on the description and tags.
    `;
}

module.exports = {
    prompts_user,
    prompts_system
}