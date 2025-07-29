import { create } from 'zustand';
import { TodoState, TodoStore, Todo} from '../types/todoType'; 



// 초기 상태
const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
  filter: 'all',
  searchTerm: ''
};

// Zustand 스토어 생성
export const useTodoStore = create<TodoStore>()((set, get) => ({
  ...initialState,

  // 로딩 상태 설정
  setLoading: (loading) => set({ loading }),

  // 에러 상태 설정
  setError: (error) => set({ error }),

  // Todo 목록 설정
  setTodos: (todos) => set({ todos }),

  // Todo 추가
  addTodo: (title) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
  },

  // Todo 삭제
  removeTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter(todo => todo.id !== id)
    }));
  },

  // Todo 완료 상태 토글
  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    }));
  },

  // 필터 설정
  setFilter: (filter) => set({ filter }),

  // 검색어 설정
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  // 완료된 Todo 삭제
  clearCompleted: () => {
    set((state) => ({
      todos: state.todos.filter(todo => !todo.completed)
    }));
  },

  // Todo 목록 로드 (API 시뮬레이션)
  loadTodos: async () => {
    set({ loading: true, error: null });
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTodos: Todo[] = [
        {
          id: '1',
          title: 'React 학습하기',
          completed: false,
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'TypeScript 연습하기',
          completed: true,
          createdAt: new Date()
        }
      ];
      set({ todos: mockTodos, loading: false });
    } catch (error) {
      set({ error: 'Todo 목록을 불러오는데 실패했습니다.', loading: false });
    }
  }
})
);