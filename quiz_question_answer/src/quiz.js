import { input, select } from "@inquirer/prompts";
import { allCategories, fetchQuestions } from "./fetch_questions.js";
import { brightGreen, brightRed } from "jsr:@std/fmt/colors";

const displayAnswer = ({ question, answer, userAns, wasCorrect }) => {
  const colourForUserAns = wasCorrect ? brightGreen : brightRed;
  const userAnswer = colourForUserAns(`Your Answer : ${userAns}`);
  const correctAnswer = brightGreen(`Correct Answer : ${answer}`);
  console.log(
    `\nQuestion : ${question}\n  ${userAnswer}\n  ${correctAnswer}\n\n`,
  );
};

const displayAnswers = (userAnswers) => userAnswers.map(displayAnswer);

const wasCorrect = (userAns, correctAns) => userAns === correctAns;

const displayQuestion = async ({ question, options, answer }) => {
  const userAns = await select({
    message: `${question}`,
    choices: [...options],
  });
  return {
    question,
    answer,
    userAns,
    wasCorrect: wasCorrect(userAns, answer),
  };
};

const displayQuestions = async (questions) => {
  const userResponce = [];
  for await (const question of questions) {
    console.clear();
    const responce = await displayQuestion(question);
    userResponce.push(responce);
  }
  return userResponce;
};

const selectNoOfQuestion = async (maxNum) => {
  const noOFQuestions = await input({
    message: "Select Number Of Questions :",
    default: "5",
    validate: (num) => {
      if (num > 10) {
        return `Kindly choose less than ${maxNum} questions!`;
      }
      return true;
    },
    pattern: /^\d+$/,
    patternError: "Enter Positive Integer",
  });
  return +noOFQuestions;
};

const selectDiffculty = async () => {
  const diffcultyLevel = await select({
    message: "Select Diffculty",
    choices: ["easy", "medium", "hard"],
    loop: false,
  });
  return diffcultyLevel;
};

const selectCategory = async (categories) => {
  const categoryId = await select({
    message: "Select Category",
    choices: [...categories],
    loop: false,
  });
  return categoryId;
};

export const startQuiz = async () => {
  const categories = allCategories();
  const categoryId = await selectCategory(categories);
  const diffculty = await selectDiffculty();
  const amountOfQues = await selectNoOfQuestion(10);
  const questions = await fetchQuestions(amountOfQues, categoryId, diffculty);
  const userAnswers = await displayQuestions(questions);

  await displayAnswers(userAnswers);
};
