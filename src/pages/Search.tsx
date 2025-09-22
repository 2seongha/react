import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonPage,
  IonSearchbar,
  useIonRouter,
  IonItem,
  IonLabel,
  IonList,
  IonImg,
  IonIcon,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import { AreaModel } from '../stores/types';
import { getFlowIcon } from '../utils';
import { arrowForwardOutline, closeOutline } from 'ionicons/icons';

const Search: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const corp = useAppStore((state) => state.corp);
  const areas = useAppStore((state) => state.areas);
  const router = useIonRouter();
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);
  const [searchText, setSearchText] = useState('');

  // areas를 flat하게 만드는 함수
  const flattenAreas = (areas: AreaModel[]): AreaModel[] => {
    const result: AreaModel[] = [];

    const flatten = (items: AreaModel[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.CHILDREN && item.CHILDREN.length > 0) {
          flatten(item.CHILDREN);
        }
      });
    };

    flatten(areas);
    return result;
  };

  // flat한 areas 리스트
  const flatAreas = useMemo(() => {
    return areas ? flattenAreas(areas) : [];
  }, [areas]);

  // 검색 필터링된 areas
  const filteredAreas = useMemo(() => {
    if (!searchText.trim()) return [];

    return flatAreas.filter(area =>
      area.P_AREA_CODE_TXT?.toLowerCase().includes(searchText.toLowerCase()) ||
      area.O_LTEXT?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [flatAreas, searchText]);

  // 검색 핸들러
  const handleSearch = (e: CustomEvent) => {
    setSearchText(e.detail.value);
  };

  // 검색어 하이라이트 함수
  const highlightSearchText = (text: string, searchText: string) => {
    if (!searchText.trim()) return text;

    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchText.toLowerCase()) {
        return (
          <span key={index} style={{ fontWeight: 700 }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // 페이지 진입 시 searchbar에 focus
  useEffect(() => {
    const timer = setTimeout(() => {
      searchbarRef.current?.setFocus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const closeButton = useMemo(() => (
    <IonButton
      mode='md'
      shape='round'
      fill='clear'
      color='medium'
      onClick={() => {
        router.goBack();
      }}
      style={{
        height: '40px',
        padding: 0,
        wordBreak: 'keep-all'
      }}>
      <span style={{ fontSize: '16px', fontWeight: '600' }}>닫기</span>
    </IonButton>
  ), []);


  return (
    <IonPage className='search'>
      <IonContent>
        <div style={{ display: 'flex', height: '48px', alignItems: 'center', justifyContent: 'center', marginTop: 'calc(var(--ion-safe-area-top) + 16px)' }}>
          <IonSearchbar
            ref={searchbarRef}
            mode='ios'
            class='search-bar'
            value={searchText}
            onIonInput={handleSearch}
            placeholder="메뉴를 검색해 보세요."
            showClearButton="focus"
            debounce={0}
            clearIcon={closeOutline}
            style={{
              textAlign: 'start',
              padding: '0px 0px 0px 21px',
              minHeight: '40px'
            }}
          />
          {closeButton}
        </div>
        {searchText.trim() && (
          <>
            <div style={{
              padding: '16px',
              fontSize: '14px',
              color: 'var(--ion-color-secondary)',
              fontWeight: '500'
            }}>
              "{searchText}" 검색결과 ({filteredAreas.length}개)
            </div>

            {filteredAreas.length > 0 ? (
              <IonList>
                {filteredAreas.map((area, index) => {
                  const pIcon = getFlowIcon(area.P_AREA_CODE!);
                  const icon = getFlowIcon(area.AREA_CODE!);

                  return (
                    <IonItem
                      mode='md'
                      key={`${area.P_AREA_CODE}-${area.AREA_CODE}-${index}`}
                      button
                      onClick={() => {
                        // 여기에 area 선택 시 동작 추가
                        if (area.P_AREA_CODE) {
                          router.push(`/approval/${area.P_AREA_CODE}/${area.AREA_CODE}/${area.P_AREA_CODE_TXT}/${area.O_LTEXT}`);
                        } else {
                          router.push(`/flowList/${area.AREA_CODE}`);
                        }
                      }}
                    >
                      <div style={{ padding: '12px 21px', display: 'flex' }}>
                        {area.P_AREA_CODE && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '8px' }}>
                            <div className="menu-item-icon" style={{ backgroundColor: pIcon.backgroundColor }}>
                              <IonImg src={pIcon.image} alt="menu icon" />
                            </div>
                            <span>{highlightSearchText(area.P_AREA_CODE_TXT || '', searchText)}</span>
                            <IonIcon icon={arrowForwardOutline} style={{ color: 'var(--gray-color)' }}></IonIcon>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="menu-item-icon" style={{ backgroundColor: icon.backgroundColor }}>
                            <IonImg src={icon.image} alt="menu icon" />
                          </div>
                          <span style={{ paddingLeft: '8px' }}>{highlightSearchText(area.O_LTEXT || '', searchText)}</span>
                          <span style={{ color: 'var(--ion-color-primary)', marginLeft: '4px' }}>({area.CNT || 0})</span>
                        </div>
                      </div>
                    </IonItem>
                  )
                })}
              </IonList>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--ion-color-secondary)'
              }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  검색 결과가 없습니다
                </div>
                <div style={{ fontSize: '14px' }}>
                  다른 검색어를 입력해보세요
                </div>
              </div>
            )}
          </>
        )}

        {!searchText.trim() && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--ion-color-secondary)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              메뉴를 검색해보세요
            </div>
            <div style={{ fontSize: '14px' }}>
              찾고 싶은 메뉴 이름을 입력하세요
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Search;