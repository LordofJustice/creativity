import { shuffle } from "@std/random";

const questionApi = (amount, categoryId, diffculty) =>
  `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${diffculty}&type=multiple&encode=url3986`;

export const allCategories = () => {
  return [
    { name: "General Knowledge", value: 9 },
    { name: "Entertainment: Books", value: 10 },
    { name: "Entertainment: Film", value: 11 },
    { name: "Entertainment: Music", value: 12 },
    { name: "Entertainment: Musicals & Theatres", value: 13 },
    { name: "Entertainment: Television", value: 14 },
    { name: "Entertainment: Video Games", value: 15 },
    { name: "Entertainment: Board Games", value: 16 },
    { name: "Science & Nature", value: 17 },
    { name: "Science: Computers", value: 18 },
    { name: "Science: Mathematics", value: 19 },
    { name: "Mythology", value: 20 },
    { name: "Sports", value: 21 },
    { name: "Geography", value: 22 },
    { name: "History", value: 23 },
    { name: "Politics", value: 24 },
    { name: "Art", value: 25 },
    { name: "Celebrities", value: 26 },
    { name: "Animals", value: 27 },
    { name: "Vehicles", value: 28 },
    { name: "Entertainment: Comics", value: 29 },
    { name: "Science: Gadgets", value: 30 },
    { name: "Entertainment: Japanese Anime & Manga", value: 31 },
    { name: "Entertainment: Cartoon & Animations", value: 32 },
  ];
};

const formatQuestion = ({ question, correct_answer, incorrect_answers }) => ({
  question: decodeURIComponent(question),
  answer: decodeURIComponent(correct_answer),
  options: shuffle([...incorrect_answers, correct_answer]).map(
    decodeURIComponent,
  ),
});

export const fetchQuestions = async (amount, categoryId, diffculty) => {
  const api = questionApi(amount, categoryId, diffculty);
  const responce = await fetch(api);
  const questions = await responce.json();
  return questions.results.map(formatQuestion);
};
