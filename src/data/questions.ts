import { Step } from "@/types";

export const STEPS: Step[] = [
  {
    id: "identity",
    title: "Identity",
    pages: [
      {
        id: "identity-1",
        questions: [
          {
            id: "gender",
            type: "single",
            title: "I am a",
            options: [
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Non-Binary", value: "non-binary" },
            ],
          },
          {
            id: "age",
            type: "range",
            title: "Your age",
          },
        ],
      },
      {
        id: "identity-2",
        questions: [
          {
            id: "build",
            type: "single",
            title: "Your build",
            options: [
              { label: "Slim", value: "slim" },
              { label: "Athletic", value: "athletic" },
              { label: "Average", value: "average" },
              { label: "Curvy/Plumpy", value: "curvy" },
            ],
          },
          {
            id: "skinTone",
            type: "single",
            title: "Your skin tone",
            options: [
              { label: "Darkskin", value: "dark" },
              { label: "The Beautiful In-between", value: "brown" },
              { label: "Lightskin", value: "light" },
            ],
          },
        ],
      },
    ],
  },
];