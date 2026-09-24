require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("./models/Course");
const { indexCourse } = require("./helpers/elasticsearch");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elearning";

const sampleCourses = [
  {
    instructorId: "instructor_1",
    instructorName: "Anish Kumar",
    date: new Date(),
    title: "Full Stack MERN Web Development 2026",
    category: "web-development",
    level: "intermediate",
    primaryLanguage: "english",
    subtitle: "Build production ready web applications using MongoDB, Express, React, and Node.js",
    description: "Master modern full-stack web development with hands-on projects, REST APIs, authentication, and state management.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    welcomeMessage: "Welcome to MERN Stack Masterclass!",
    pricing: 49.99,
    objectives: "Build full-stack applications, implement JWT auth, manage databases with Mongoose.",
    students: [],
    curriculum: [
      {
        title: "Introduction to MERN Architecture",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        public_id: "demo1",
        freePreview: true,
      },
      {
        title: "Building Express REST APIs",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        public_id: "demo2",
        freePreview: false,
      },
    ],
    isPublised: true,
  },
  {
    instructorId: "instructor_1",
    instructorName: "Anish Kumar",
    date: new Date(),
    title: "Python for Data Science & Machine Learning",
    category: "backend-development",
    level: "beginner",
    primaryLanguage: "english",
    subtitle: "Learn NumPy, Pandas, Scikit-Learn, and Neural Networks with Python",
    description: "Comprehensive guide to data analysis, data visualization, and predictive machine learning models.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    welcomeMessage: "Welcome to Data Science with Python!",
    pricing: 59.99,
    objectives: "Analyze data with Pandas, build ML models with Scikit-Learn, plot insights with Seaborn.",
    students: [],
    curriculum: [
      {
        title: "Python Fundamentals for Data Science",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        public_id: "demo3",
        freePreview: true,
      },
    ],
    isPublised: true,
  },
  {
    instructorId: "instructor_2",
    instructorName: "Sarah Jenkins",
    date: new Date(),
    title: "Modern React 18, Next.js & Tailwind CSS",
    category: "web-development",
    level: "advanced",
    primaryLanguage: "english",
    subtitle: "Master Server Components, App Router, Hooks, and modern frontend styling",
    description: "Learn how to craft beautiful, lightning-fast web applications using Next.js 14 and Tailwind CSS.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    welcomeMessage: "Welcome to Advanced React & Next.js!",
    pricing: 39.99,
    objectives: "Master React 18 hooks, Server Components, Next.js routing, and Tailwind CSS design system.",
    students: [],
    curriculum: [
      {
        title: "React 18 Concurrent Rendering",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        public_id: "demo4",
        freePreview: true,
      },
    ],
    isPublised: true,
  },
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing sample courses
    await Course.deleteMany({});
    console.log("Cleared old course data.");

    const created = await Course.insertMany(sampleCourses);
    console.log(`Successfully seeded ${created.length} sample courses into MongoDB!`);

    // Sync to Elasticsearch
    for (const c of created) {
      await indexCourse(c);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
