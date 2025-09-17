import React, { useMemo, useCallback } from 'react';
import useAppStore from '../stores/appStore';
import CustomItem from './CustomItem';
import _ from 'lodash';

interface SubProps {
  index: number;
  sub: any;
  selectable: boolean | undefined;
  isSelected: boolean | undefined;
  onSelectionChange: (id: string, isSelected: boolean) => void | undefined;
  isFirstItem: boolean;
  isLastItem: boolean;
}

const SubItem: React.FC<SubProps> = React.memo(({ index, sub, selectable, isSelected, onSelectionChange, isFirstItem, isLastItem }) => {
  const titles = useAppStore(state => state.approvals?.TITLE.TITLE_I);
  const flds = _(sub)
    .pickBy((_, key) => /^FLD\d+$/.test(key))
    .toPairs()
    .sortBy(([key]) => parseInt(key.replace('FLD', ''), 10))
    .map(([_, value]) => value)
    .value();

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange?.(sub.FLOWNO, checked);
  }, [sub.FLOWNO, onSelectionChange]);

  console.log('sub item rebuild : ' + index);

  const handleItemClick = useCallback(() => {
    console.log('아이템 클릭:', sub.FLOWNO);
  }, [sub.FLOWNO]);

  // title 엘리먼트 메모이제이션
  const titleElement = useMemo(() => (
    <div className='custom-item-title'>
      <span>{sub.BKTXT}</span>
    </div>
  ), [sub.BKTXT]);

  const bodyElement = useMemo(() => (
    <div className='custom-item-body'>
      {titles?.map((title, titleIndex) => {
        return <div className='custom-item-body-line' key={sub.FLOWNO + sub.FLOWCNT + titleIndex}>
          <span>{title}</span>
          <span>{flds[titleIndex] || '-'}</span>
        </div>;
      })}
    </div>
  ), [titles, flds, sub.FLOWNO, sub.FLOWCNT]);

  // CustomItem props 메모이제이션
  const customItemProps = useMemo(() => ({
    selectable: selectable,
    checked: isSelected,
    title: titleElement,
    body: bodyElement,
    onClick: undefined,
    onCheckboxChange: handleCheckboxChange,
  }), [selectable, isSelected, titleElement, bodyElement, handleCheckboxChange]);

  return (
    <div className={`approval-item-wrapper ${isFirstItem ? 'first-item' : ''} ${isLastItem ? 'last-item' : ''}`}>
      <CustomItem
        {...customItemProps}
        style={{
          backgroundColor: 'var(--ion-card-background2)',
          border: '1px solid var(--custom-border-color-50)'
        }} 
      />
    </div>
  );
});

export default SubItem;