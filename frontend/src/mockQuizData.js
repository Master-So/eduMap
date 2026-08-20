export const mockQuizData = {
  title: "Physics: Motion",
  questions: [
    {
      id: "q1",
      questionText: "If a car travels around a circular track at a constant speed of 40 km/h, is it accelerating?",
      options: [
        {
          id: "opt_a",
          text: "No, because the speed is not changing.",
          isCorrect: false,
          misconception: "Confusing constant speed with zero acceleration.",
          hintRegional: "Speed constant ho sakti hai, par agar direction badal rahi hai toh velocity change hoti hai!"
        },
        {
          id: "opt_b",
          text: "Yes, because the direction of velocity is continuously changing.",
          isCorrect: true,
          misconception: "None",
          hintRegional: "Sahi jawab! Velocity is a vector quantity."
        }
      ]
    }
  ]
};