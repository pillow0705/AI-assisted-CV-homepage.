export type Lang = "en" | "cn";

export interface UIStrings {
  home: string;
  about: string;
  education: string;
  experience: string;
  skills: string;
  honors: string;
  projects: string;
  publications: string;
  downloadCV: string;
  contactMe: string;
  chatWithAI: string;
  askMyAI: string;
  learnMore: string;
  getInTouch: string;
  contactBlurb: string;
  sendEmail: string;
  builtWith: string;
  course: string;
  score: string;
  advisedBy: string;
}

export const STRINGS: Record<Lang, UIStrings> = {
  en: {
    home: "Home",
    about: "About",
    education: "Education",
    experience: "Experience",
    skills: "Skills",
    honors: "Honors & Awards",
    projects: "Projects",
    publications: "Publications",
    downloadCV: "Download CV",
    contactMe: "Contact Me",
    chatWithAI: "Chat with my AI",
    askMyAI: "Ask my AI Assistant",
    learnMore: "Learn More",
    getInTouch: "Get in Touch",
    contactBlurb:
      "Whether you have a question, want to collaborate, or just want to say hello — feel free to reach out.",
    sendEmail: "Send an Email",
    builtWith: "Built with care · Powered by AI",
    course: "Course",
    score: "Score",
    advisedBy: "Advised by",
  },
  cn: {
    home: "首页",
    about: "关于我",
    education: "教育经历",
    experience: "科研经历",
    skills: "技能",
    honors: "荣誉与奖项",
    projects: "项目",
    publications: "论文发表",
    downloadCV: "下载简历",
    contactMe: "联系我",
    chatWithAI: "与我的 AI 对话",
    askMyAI: "问问我的 AI 助手",
    learnMore: "了解更多",
    getInTouch: "联系方式",
    contactBlurb:
      "无论是有问题想咨询、希望合作，还是只想打个招呼 —— 都欢迎随时联系我。",
    sendEmail: "发送邮件",
    builtWith: "用心打造 · AI 驱动",
    course: "课程",
    score: "成绩",
    advisedBy: "导师",
  },
};
