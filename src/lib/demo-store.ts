// Demo store using localStorage for frontend-only demo
// All data persists in the browser but not on the server

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface DemoProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  archived: boolean;
  createdAt: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  columns: DemoColumn[];
}

export interface DemoColumn {
  id: string;
  name: string;
  position: number;
  projectId: string;
  tasks: DemoTask[];
}

export interface DemoTask {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: string;
  dueDate: string | null;
  columnId: string;
  assigneeId: string | null;
  assignee: DemoUser | null;
  checklists: DemoChecklist[];
  comments: DemoComment[];
  taskLabels: DemoTaskLabel[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoChecklist {
  id: string;
  title: string;
  position: number;
  taskId: string;
  items: DemoChecklistItem[];
}

export interface DemoChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  position: number;
  checklistId: string;
}

export interface DemoComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: DemoUser;
  createdAt: string;
}

export interface DemoLabel {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface DemoTaskLabel {
  id: string;
  taskId: string;
  labelId: string;
  label: DemoLabel;
}

// Generate unique IDs
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Demo user
export const DEMO_USER: DemoUser = {
  id: "demo-user-1",
  name: "Demo User",
  email: "demo@example.com",
  role: "admin",
};

// Initial demo data
const getInitialData = (): { projects: DemoProject[]; labels: DemoLabel[] } => {
  const projectId = "demo-project-1";
  const columns: DemoColumn[] = [
    { id: "col-1", name: "Backlog", position: 0, projectId, tasks: [] },
    { id: "col-2", name: "To Do", position: 1, projectId, tasks: [
      {
        id: "task-1",
        title: "Design new dashboard layout",
        description: "Create wireframes and mockups for the new dashboard",
        position: 0,
        priority: "high",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        columnId: "col-2",
        assigneeId: "demo-user-1",
        assignee: DEMO_USER,
        checklists: [
          {
            id: "checklist-1",
            title: "Design Tasks",
            position: 0,
            taskId: "task-1",
            items: [
              { id: "item-1", content: "Create wireframes", completed: true, position: 0, checklistId: "checklist-1" },
              { id: "item-2", content: "Design mockups", completed: false, position: 1, checklistId: "checklist-1" },
              { id: "item-3", content: "Get feedback", completed: false, position: 2, checklistId: "checklist-1" },
            ],
          },
        ],
        comments: [],
        taskLabels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]},
    { id: "col-3", name: "In Progress", position: 2, projectId, tasks: [
      {
        id: "task-2",
        title: "Implement user authentication",
        description: "Set up NextAuth.js with credentials provider",
        position: 0,
        priority: "high",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        columnId: "col-3",
        assigneeId: "demo-user-1",
        assignee: DEMO_USER,
        checklists: [],
        comments: [
          {
            id: "comment-1",
            content: "Started working on this. Will have a PR ready by tomorrow.",
            taskId: "task-2",
            authorId: "demo-user-1",
            author: DEMO_USER,
            createdAt: new Date().toISOString(),
          },
        ],
        taskLabels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]},
    { id: "col-4", name: "Review", position: 3, projectId, tasks: [] },
    { id: "col-5", name: "Done", position: 4, projectId, tasks: [
      {
        id: "task-3",
        title: "Project setup and configuration",
        description: "Initialize Next.js project with TypeScript and Tailwind CSS",
        position: 0,
        priority: "medium",
        dueDate: null,
        columnId: "col-5",
        assigneeId: "demo-user-1",
        assignee: DEMO_USER,
        checklists: [],
        comments: [],
        taskLabels: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]},
  ];

  const projects: DemoProject[] = [
    {
      id: projectId,
      name: "AI Team Project Tracker",
      description: "Track all AI adoption team projects and tasks",
      type: "internal",
      archived: false,
      createdAt: new Date().toISOString(),
      ownerId: DEMO_USER.id,
      owner: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
      columns,
    },
  ];

  const labels: DemoLabel[] = [
    { id: "label-1", name: "Bug", color: "#ef4444", projectId },
    { id: "label-2", name: "Feature", color: "#3b82f6", projectId },
    { id: "label-3", name: "Enhancement", color: "#10b981", projectId },
    { id: "label-4", name: "Documentation", color: "#f59e0b", projectId },
  ];

  return { projects, labels };
};

// Storage keys
const STORAGE_KEY = "demo-store-data";

// Get data from localStorage or initialize with demo data
export const getDemoData = (): { projects: DemoProject[]; labels: DemoLabel[] } => {
  if (typeof window === "undefined") {
    return getInitialData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse stored data:", e);
  }

  const initial = getInitialData();
  saveDemoData(initial);
  return initial;
};

// Save data to localStorage
export const saveDemoData = (data: { projects: DemoProject[]; labels: DemoLabel[] }) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
};

// Reset to initial demo data
export const resetDemoData = () => {
  const initial = getInitialData();
  saveDemoData(initial);
  return initial;
};

// Project operations
export const getProjects = () => {
  const data = getDemoData();
  return data.projects.filter(p => !p.archived);
};

export const getProject = (id: string) => {
  const data = getDemoData();
  return data.projects.find(p => p.id === id);
};

export const createProject = (name: string, description: string | null, type: string) => {
  const data = getDemoData();
  const id = generateId();
  
  const newProject: DemoProject = {
    id,
    name,
    description,
    type,
    archived: false,
    createdAt: new Date().toISOString(),
    ownerId: DEMO_USER.id,
    owner: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
    columns: [
      { id: generateId(), name: "Backlog", position: 0, projectId: id, tasks: [] },
      { id: generateId(), name: "To Do", position: 1, projectId: id, tasks: [] },
      { id: generateId(), name: "In Progress", position: 2, projectId: id, tasks: [] },
      { id: generateId(), name: "Review", position: 3, projectId: id, tasks: [] },
      { id: generateId(), name: "Done", position: 4, projectId: id, tasks: [] },
    ],
  };
  
  data.projects.push(newProject);
  saveDemoData(data);
  return newProject;
};

export const updateProject = (id: string, updates: Partial<DemoProject>) => {
  const data = getDemoData();
  const index = data.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    data.projects[index] = { ...data.projects[index], ...updates };
    saveDemoData(data);
    return data.projects[index];
  }
  return null;
};

export const deleteProject = (id: string) => {
  const data = getDemoData();
  data.projects = data.projects.filter(p => p.id !== id);
  saveDemoData(data);
};

// Task operations
export const createTask = (columnId: string, title: string, description?: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    const column = project.columns.find(c => c.id === columnId);
    if (column) {
      const newTask: DemoTask = {
        id: generateId(),
        title,
        description: description || null,
        position: column.tasks.length,
        priority: "medium",
        dueDate: null,
        columnId,
        assigneeId: null,
        assignee: null,
        checklists: [],
        comments: [],
        taskLabels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      column.tasks.push(newTask);
      saveDemoData(data);
      return newTask;
    }
  }
  return null;
};

export const updateTask = (taskId: string, updates: Partial<DemoTask>) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        column.tasks[taskIndex] = { 
          ...column.tasks[taskIndex], 
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveDemoData(data);
        return column.tasks[taskIndex];
      }
    }
  }
  return null;
};

export const deleteTask = (taskId: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1);
        saveDemoData(data);
        return true;
      }
    }
  }
  return false;
};

export const moveTask = (taskId: string, newColumnId: string, newPosition: number) => {
  const data = getDemoData();
  
  let task: DemoTask | null = null;
  let sourceColumn: DemoColumn | null = null;
  let targetColumn: DemoColumn | null = null;
  
  // Find the task and columns
  for (const project of data.projects) {
    for (const column of project.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        task = column.tasks[taskIndex];
        sourceColumn = column;
      }
      if (column.id === newColumnId) {
        targetColumn = column;
      }
    }
  }
  
  if (task && sourceColumn && targetColumn) {
    // Remove from source
    sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskId);
    
    // Update task column reference
    task.columnId = newColumnId;
    task.position = newPosition;
    task.updatedAt = new Date().toISOString();
    
    // Add to target at position
    targetColumn.tasks.splice(newPosition, 0, task);
    
    // Update positions
    targetColumn.tasks.forEach((t, i) => {
      t.position = i;
    });
    
    saveDemoData(data);
    return task;
  }
  return null;
};

// Comment operations
export const addComment = (taskId: string, content: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        const newComment: DemoComment = {
          id: generateId(),
          content,
          taskId,
          authorId: DEMO_USER.id,
          author: DEMO_USER,
          createdAt: new Date().toISOString(),
        };
        task.comments.push(newComment);
        saveDemoData(data);
        return newComment;
      }
    }
  }
  return null;
};

export const deleteComment = (commentId: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      for (const task of column.tasks) {
        const commentIndex = task.comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          task.comments.splice(commentIndex, 1);
          saveDemoData(data);
          return true;
        }
      }
    }
  }
  return false;
};

// Checklist operations
export const addChecklist = (taskId: string, title: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        const newChecklist: DemoChecklist = {
          id: generateId(),
          title,
          position: task.checklists.length,
          taskId,
          items: [],
        };
        task.checklists.push(newChecklist);
        saveDemoData(data);
        return newChecklist;
      }
    }
  }
  return null;
};

export const deleteChecklist = (checklistId: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      for (const task of column.tasks) {
        const checklistIndex = task.checklists.findIndex(c => c.id === checklistId);
        if (checklistIndex !== -1) {
          task.checklists.splice(checklistIndex, 1);
          saveDemoData(data);
          return true;
        }
      }
    }
  }
  return false;
};

export const addChecklistItem = (checklistId: string, content: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      for (const task of column.tasks) {
        const checklist = task.checklists.find(c => c.id === checklistId);
        if (checklist) {
          const newItem: DemoChecklistItem = {
            id: generateId(),
            content,
            completed: false,
            position: checklist.items.length,
            checklistId,
          };
          checklist.items.push(newItem);
          saveDemoData(data);
          return newItem;
        }
      }
    }
  }
  return null;
};

export const updateChecklistItem = (itemId: string, updates: Partial<DemoChecklistItem>) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      for (const task of column.tasks) {
        for (const checklist of task.checklists) {
          const itemIndex = checklist.items.findIndex(i => i.id === itemId);
          if (itemIndex !== -1) {
            checklist.items[itemIndex] = { ...checklist.items[itemIndex], ...updates };
            saveDemoData(data);
            return checklist.items[itemIndex];
          }
        }
      }
    }
  }
  return null;
};

export const deleteChecklistItem = (itemId: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      for (const task of column.tasks) {
        for (const checklist of task.checklists) {
          const itemIndex = checklist.items.findIndex(i => i.id === itemId);
          if (itemIndex !== -1) {
            checklist.items.splice(itemIndex, 1);
            saveDemoData(data);
            return true;
          }
        }
      }
    }
  }
  return false;
};

// Get all users (just demo user for now)
export const getUsers = () => {
  return [DEMO_USER];
};

// Get task by ID
export const getTask = (taskId: string) => {
  const data = getDemoData();
  
  for (const project of data.projects) {
    for (const column of project.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        return task;
      }
    }
  }
  return null;
};
