export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// 상태 타입 정의
export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
}

// 액션 타입 정의
export interface TodoActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTodos: (todos: Todo[]) => void;
  addTodo: (title: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  setSearchTerm: (searchTerm: string) => void;
  clearCompleted: () => void;
  loadTodos: () => Promise<void>;
}

// 전체 스토어 타입
export type TodoStore = TodoState & TodoActions;