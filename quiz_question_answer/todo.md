# required API

- get an api which could provide question and answers
- it should have parameters to decide
  - difficulty of question
  - no of questions

# setup

- add .json and coverage in .gitignore
- add test coverage in deno task

# broad plan

- fetch questions from api
- display question and its options
- get answers and show reasult

# phase one

- make a function that take an object of question and options and give an output
  object of question, answer and isCorrect. input => { - - - question : 'what is
  the capital of india',
  - options : ['Delhi', 'Kolkata', 'Chennai', 'Mumbai'], - - answer : 'Delhi' }
  - outPut output => { question : string ,answer : string ,isCorrect : boolean,
    }
