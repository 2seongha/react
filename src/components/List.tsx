import React from 'react';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
}

const List = <T,>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = '항목이 없습니다.',
  className = ''
}: ListProps<T>): React.ReactElement => {
  if (items.length === 0) {
    return (
      <div className={`list list--empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`list ${className}`}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className="list-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default List; 