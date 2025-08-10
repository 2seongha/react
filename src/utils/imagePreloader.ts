// 이미지 preload 유틸리티

// 앱에서 사용하는 모든 이미지 경로
const IMAGE_PATHS = [
  // 앱 로고
  '/assets/images/app_logo_light.webp',
  '/assets/images/app_logo_dark.webp',
  
  // 빈 상태 이미지
  '/assets/images/no_data_light.webp',
  '/assets/images/no_data_dark.webp',
  '/assets/images/no_notifications_light.webp',
  '/assets/images/no_notifications_dark.webp',
  '/assets/images/cry_3d.webp',
  
  // 홈 아이콘들
  '/assets/images/icon/home/signatures2.webp',
  '/assets/images/icon/home/documents.webp',
  '/assets/images/icon/home/archivebox.webp',
  '/assets/images/icon/home/archivebox2.webp',
  '/assets/images/icon/home/emailmarketing.webp',
  '/assets/images/icon/home/folders.webp',
  '/assets/images/icon/home/signatures.webp',
  '/assets/images/icon/home/creditcard_glass.png',
  '/assets/images/icon/home/banknotes_glass.png',
  '/assets/images/icon/home/shredders.webp',
  
  // 앱바 아이콘들
  '/assets/images/icon/appbar/notification.webp',
  '/assets/images/icon/appbar/menu.webp',
  '/assets/images/icon/appbar/search.webp',
  '/assets/images/icon/appbar/search2.webp',
  
  // 플로우리스트 아이콘들
  '/assets/images/icon/flowlist/envelope.webp',
  '/assets/images/icon/flowlist/strategy.webp',
  '/assets/images/icon/flowlist/creditcard.webp',
  '/assets/images/icon/flowlist/documents.webp',
  '/assets/images/icon/flowlist/paste_sap.webp',
  '/assets/images/icon/flowlist/document_tax.webp',
  '/assets/images/icon/flowlist/signatures.webp',
  '/assets/images/icon/flowlist/calculator.webp',
  '/assets/images/icon/flowlist/targetclients.webp',
  '/assets/images/icon/flowlist/banknotes.webp',
  '/assets/images/icon/flowlist/pen.webp',
  '/assets/images/icon/flowlist/document_dollor.webp',
  '/assets/images/icon/flowlist/copy.webp',
  '/assets/images/icon/flowlist/document_sap.webp',
  '/assets/images/icon/flowlist/gears.webp',
  
  // 기타 아이콘들
  '/assets/images/icon/email.webp',
  '/assets/images/icon/person.webp',
  '/assets/images/icon/search.webp',
  
  // 설정 아이콘들
  '/assets/images/icon/config/bell.webp',
  '/assets/images/icon/config/theme.webp',
  '/assets/images/icon/config/lock.webp',
  
  // 알림 아이콘들
  '/assets/images/icon/notification/start.webp',
  '/assets/images/icon/notification/approve.webp',
  '/assets/images/icon/notification/reject.webp',
  
  // 더보기 아이콘들
  '/assets/images/icon/more/megaphone.webp',
  '/assets/images/icon/more/clipboard.webp',
  '/assets/images/icon/more/information.webp',
  '/assets/images/icon/more/copy.webp',
  '/assets/images/icon/more/gear.webp',
  '/assets/images/icon/more/logout.webp',
  
  // 파일 타입 아이콘들
  '/assets/images/icon/filetype/txt.webp',
  '/assets/images/icon/filetype/doc.webp',
  '/assets/images/icon/filetype/pdf.webp',
  '/assets/images/icon/filetype/gif.webp',
  '/assets/images/icon/filetype/zip.webp',
  '/assets/images/icon/filetype/png.webp',
  '/assets/images/icon/filetype/ppt.webp',
  '/assets/images/icon/filetype/file.webp',
  '/assets/images/icon/filetype/xls.webp',
  '/assets/images/icon/filetype/jpg.webp',
];

// 단일 이미지 preload 함수
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ 이미지 로드 완료: ${src}`);
      resolve();
    };
    
    img.onerror = (error) => {
      console.warn(`❌ 이미지 로드 실패: ${src}`, error);
      // 실패해도 resolve로 처리하여 전체 preload가 중단되지 않게 함
      resolve();
    };
    
    img.src = src;
  });
};

// 모든 이미지 preload 함수
export const preloadAllImages = async (
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  console.log('🖼️ 이미지 preload 시작...');
  console.log(`📊 총 ${IMAGE_PATHS.length}개 이미지 로드 예정`);
  
  let loadedCount = 0;
  const total = IMAGE_PATHS.length;
  
  // 병렬로 모든 이미지 로드 (최대 동시 로드 수 제한)
  const BATCH_SIZE = 10; // 동시에 로드할 최대 이미지 수
  
  for (let i = 0; i < IMAGE_PATHS.length; i += BATCH_SIZE) {
    const batch = IMAGE_PATHS.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (imagePath) => {
      await preloadImage(imagePath);
      loadedCount++;
      
      if (onProgress) {
        onProgress(loadedCount, total);
      }
    });
    
    // 현재 배치의 모든 이미지가 로드될 때까지 대기
    await Promise.all(batchPromises);
  }
  
  console.log('🎉 모든 이미지 preload 완료!');
};

// 중요한 이미지들만 우선 preload (빠른 초기 로딩)
const CRITICAL_IMAGES = [
  '/assets/images/app_logo_light.webp',
  '/assets/images/app_logo_dark.webp',
  '/assets/images/icon/person.webp',
  '/assets/images/icon/search.webp',
  '/assets/images/icon/home/archivebox.webp',
  '/assets/images/icon/home/folders.webp',
  '/assets/images/icon/home/signatures.webp',
  '/assets/images/icon/home/archivebox2.webp',
  '/assets/images/icon/home/shredders.webp',
];

export const preloadCriticalImages = async (
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  console.log('⚡ 중요 이미지 preload 시작...');
  console.log(`📊 총 ${CRITICAL_IMAGES.length}개 중요 이미지 로드 예정`);
  
  let loadedCount = 0;
  const total = CRITICAL_IMAGES.length;
  
  const promises = CRITICAL_IMAGES.map(async (imagePath) => {
    await preloadImage(imagePath);
    loadedCount++;
    
    if (onProgress) {
      onProgress(loadedCount, total);
    }
  });
  
  await Promise.all(promises);
  console.log('✨ 중요 이미지 preload 완료!');
};

// 이미지 preload 상태 타입
export interface ImagePreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}

// 프로그레스 계산 헬퍼 함수
export const calculateProgress = (loaded: number, total: number): ImagePreloadProgress => {
  const percentage = Math.round((loaded / total) * 100);
  
  return {
    loaded,
    total,
    percentage,
    isComplete: loaded >= total
  };
};