import { shuffle } from "@std/random";

const questionApi = (amount, categoryId, diffculty) =>
  `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${diffculty}&type=multiple&encode=url3986`;

export const allCategories = async () => {
  const api = "https://opentdb.com/api_category.php";
  const responce = await fetch(api);
  const categories = await responce.json();
  return categories.trivia_categories.map((
    { name, id },
  ) => ({ name, value: id }));
};

const formatQuestion = ({ question, correct_answer, incorrect_answers }) => ({
  question: decodeURIComponent(question),
  answer: correct_answer,
  options: shuffle([...incorrect_answers, correct_answer]),
});

export const fetchQuestions = async (categoryId, diffculty, amount) => {
  const api = questionApi(amount, categoryId, diffculty);
  const responce = await fetch(api);
  const questions = await responce.json();
  return questions.results.map(formatQuestion);
};

// console.log(await allCategories(categoryApi));

// console.log(await fetchQuestions(2, 27, "easy"));
