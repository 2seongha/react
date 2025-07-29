import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonInput,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonViewDidEnter
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import React, { useState, useEffect, useMemo } from 'react';
import { useTodoStore } from '../stores/todoStore';

const Todo: React.FC = () => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  
  // 데이터만 가져오기
  const todos = useTodoStore((state) => state.todos);
  const loading = useTodoStore((state) => state.loading);
  const error = useTodoStore((state) => state.error);

  // 함수들은 별도로 가져오기
  const loadTodos = useTodoStore((state) => state.loadTodos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const removeTodo = useTodoStore((state) => state.removeTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);

  // stats를 useMemo로 최적화
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length
  }), [todos]);

  useIonViewDidEnter(() => {
    console.log('새로고침');
    loadTodos();
  });

  // useEffect(() => {
  //   loadTodos();
  // }, [loadTodos]); // loadTodos를 의존성 배열에서 제거

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      addTodo(newTodoTitle.trim());
      setNewTodoTitle('');
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadTodos();
    event.detail.complete(); // 써줘야 스피너 다시 올라감
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Todo ({stats.total})</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* 통계 */}
        <div style={{ marginBottom: '20px' }}>
          <p>전체: {stats.total} | 완료: {stats.completed} | 진행중: {stats.active}</p>
        </div>

        {/* 새 Todo 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <IonInput
            placeholder="새 Todo 입력..."
            value={newTodoTitle}
            onIonInput={(e) => setNewTodoTitle(e.detail.value || '')}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <IonButton 
            expand="block" 
            onClick={handleAddTodo}
            disabled={!newTodoTitle.trim()}
            style={{ marginTop: '10px' }}
          >
            <IonIcon icon={add} slot="start" />
            추가
          </IonButton>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <IonSpinner />
            <p>로딩 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        )}

        {/* Todo 목록 */}
        <IonList>
          {todos.map((todo) => (
            <IonItemSliding key={todo.id}>
              <IonItem>
                <IonCheckbox
                  checked={todo.completed}
                  onIonChange={() => toggleTodo(todo.id)}
                />
                <IonLabel 
                  style={{ 
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#666' : 'inherit'
                  }}
                >
                  {todo.title}
                </IonLabel>
              </IonItem>
              
              <IonItemOptions side="end">
                <IonItemOption 
                  color="danger" 
                  onClick={() => removeTodo(todo.id)}
                >
                  <IonIcon icon={trash} />
                  삭제
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>

        {/* 빈 상태 */}
        {!loading && todos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Todo가 없습니다.</p>
            <p>새로운 Todo를 추가해보세요!</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Todo; 