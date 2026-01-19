export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
  prerequisites?: string[];
}

export interface Syllabus {
  id: string;
  subjectId: string;
  content: string;
  objectives: string[];
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  content: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
}
