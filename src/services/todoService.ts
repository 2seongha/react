import { Todo } from '../types/todoType';

// 실제 API 호출을 시뮬레이션하는 서비스
export const todoService = {
  // Todo 목록 가져오기
  getTodos: async (): Promise<Todo[]> => {
    // 실제로는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
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
        ]);
      }, 1000);
    });
  },

  // Todo 생성
  createTodo: async (title: string): Promise<Todo> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          title,
          completed: false,
          createdAt: new Date()
        });
      }, 500);
    });
  },

  // Todo 업데이트
  updateTodo: async (id: string, updates: Partial<Todo>): Promise<Todo> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          title: updates.title || '',
          completed: updates.completed || false,
          createdAt: new Date()
        });
      }, 500);
    });
  },

  // Todo 삭제
  deleteTodo: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
}; 