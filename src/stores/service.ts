import { ApprovalModel, AreaModel, NoticeModel, NotificationModel } from "./types";

export async function fetchMenuAreas(): Promise<AreaModel[]> {
  try {
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock API call with realistic menu area data
    const mockAreas: AreaModel[] = [
      { areaCode: 'TODO', flowCode: 'TODO', oLtext: '미결함', cnt: '927', pAreaCode: 'FINANCE' },
      { areaCode: 'PURCHASE', flowCode: 'START', oLtext: '구매요청', cnt: '8', pAreaCode: 'PROCUREMENT' },
      { areaCode: 'VACATION', flowCode: 'REJECT', oLtext: '휴가신청', cnt: '5', pAreaCode: 'HR' },
      { areaCode: 'BUSINESS', flowCode: 'BIZ001', oLtext: '출장신청', cnt: '15', pAreaCode: 'FINANCE' },
      { areaCode: 'OVERTIME', flowCode: 'OT001', oLtext: '초과근무', cnt: '23', pAreaCode: 'HR' },
      { areaCode: 'TRAINING', flowCode: 'TRN001', oLtext: '교육신청', cnt: '7', pAreaCode: 'HR' },
      { areaCode: 'CONTRACT', flowCode: 'CON001', oLtext: '계약승인', cnt: '4', pAreaCode: 'LEGAL' },
      { areaCode: 'MEETING', flowCode: 'MTG001', oLtext: '회의실예약', cnt: '18', pAreaCode: 'ADMIN' },
      { areaCode: 'EQUIP', flowCode: 'EQP001', oLtext: '장비신청', cnt: '6', pAreaCode: 'IT' },
    ];

    return mockAreas;
    // return [];
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchApprovals(): Promise<ApprovalModel[]> {
  try {
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock API call with realistic menu area data
    const mockApprovals: ApprovalModel[] = [
      { apprTitle: '초과근무 신청', flowNo: '1', createDate: '2025.08.10', creatorName: '홍길동' },
      { apprTitle: '휴가 신청', flowNo: '2', createDate: '2025.08.09', creatorName: '김영희' },
      { apprTitle: '출장비 정산', flowNo: '3', createDate: '2025.08.08', creatorName: '박민수' },
      { apprTitle: '교육 신청', flowNo: '4', createDate: '2025.08.07', creatorName: '이수진' },
      { apprTitle: '구매 요청', flowNo: '5', createDate: '2025.08.06', creatorName: '최태영' },
      { apprTitle: '회의실 예약', flowNo: '6', createDate: '2025.08.05', creatorName: '정소연' },
      { apprTitle: '장비 신청', flowNo: '7', createDate: '2025.08.04', creatorName: '임동현' },
      { apprTitle: '계약 승인', flowNo: '8', createDate: '2025.08.03', creatorName: '윤미정' },
      { apprTitle: '예산 승인', flowNo: '9', createDate: '2025.08.02', creatorName: '강호철' },
      { apprTitle: '인사 발령', flowNo: '10', createDate: '2025.08.01', creatorName: '송지혜' },
      { apprTitle: '프로젝트 승인', flowNo: '11', createDate: '2025.07.31', creatorName: '한상우' },
      { apprTitle: '급여 정산', flowNo: '12', createDate: '2025.07.30', creatorName: '오세영' },
      { apprTitle: '경비 정산', flowNo: '13', createDate: '2025.07.29', creatorName: '배수진' },
      { apprTitle: '시설 보수', flowNo: '14', createDate: '2025.07.28', creatorName: '남궁민' },
      { apprTitle: '외부 교육', flowNo: '15', createDate: '2025.07.27', creatorName: '서미경' },
      { apprTitle: '차량 신청', flowNo: '16', createDate: '2025.07.26', creatorName: '김도현' },
      { apprTitle: '법무 검토', flowNo: '17', createDate: '2025.07.25', creatorName: '이민정' },
      { apprTitle: '마케팅 예산', flowNo: '18', createDate: '2025.07.24', creatorName: '박준호' },
      { apprTitle: '시스템 업그레이드', flowNo: '19', createDate: '2025.07.23', creatorName: '정현우' },
      { apprTitle: '사무용품 구매', flowNo: '20', createDate: '2025.07.22', creatorName: '최수빈' },
      { apprTitle: '워크샵 참가', flowNo: '21', createDate: '2025.07.21', creatorName: '김소영' },
      { apprTitle: '보안 점검', flowNo: '22', createDate: '2025.07.20', creatorName: '이재욱' },
      { apprTitle: '인턴 채용', flowNo: '23', createDate: '2025.07.19', creatorName: '박미연' },
      { apprTitle: '특별 근무', flowNo: '24', createDate: '2025.07.18', creatorName: '김태성' },
      { apprTitle: '컨설팅 계약', flowNo: '25', createDate: '2025.07.17', creatorName: '정유진' },
      { apprTitle: '소프트웨어 라이선스', flowNo: '26', createDate: '2025.07.16', creatorName: '이승호' },
      { apprTitle: '출장 신청', flowNo: '27', createDate: '2025.07.15', creatorName: '박경희' },
      { apprTitle: '팀 빌딩', flowNo: '28', createDate: '2025.07.14', creatorName: '김민석' },
      { apprTitle: '연구개발 예산', flowNo: '29', createDate: '2025.07.13', creatorName: '이현지' },
      { apprTitle: '광고 승인', flowNo: '30', createDate: '2025.07.12', creatorName: '박성민' },
      { apprTitle: '데이터 분석', flowNo: '31', createDate: '2025.07.11', creatorName: '김하늘' },
      { apprTitle: '네트워크 구축', flowNo: '32', createDate: '2025.07.10', creatorName: '이동진' },
      { apprTitle: '품질 관리', flowNo: '33', createDate: '2025.07.09', creatorName: '박지현' },
      { apprTitle: '업체 선정', flowNo: '34', createDate: '2025.07.08', creatorName: '김우진' },
      { apprTitle: '보상 지급', flowNo: '35', createDate: '2025.07.07', creatorName: '이소희' },
      { apprTitle: '교육 예산', flowNo: '36', createDate: '2025.07.06', creatorName: '박철수' },
      { apprTitle: '클라우드 서비스', flowNo: '37', createDate: '2025.07.05', creatorName: '김은정' },
      { apprTitle: '제품 개발', flowNo: '38', createDate: '2025.07.04', creatorName: '이강민' },
      { apprTitle: '고객 상담', flowNo: '39', createDate: '2025.07.03', creatorName: '박세린' },
      { apprTitle: '매뉴얼 제작', flowNo: '40', createDate: '2025.07.02', creatorName: '김정훈' },
      { apprTitle: '사업 제안', flowNo: '41', createDate: '2025.07.01', creatorName: '이채영' },
      { apprTitle: '위험 관리', flowNo: '42', createDate: '2025.06.30', creatorName: '박동혁' },
      { apprTitle: '성과 평가', flowNo: '43', createDate: '2025.06.29', creatorName: '김미래' },
      { apprTitle: '신제품 런칭', flowNo: '44', createDate: '2025.06.28', creatorName: '이상현' },
      { apprTitle: '파트너십 계약', flowNo: '45', createDate: '2025.06.27', creatorName: '박예은' },
      { apprTitle: '데이터 백업', flowNo: '46', createDate: '2025.06.26', creatorName: '김준영' },
      { apprTitle: '국제 회의', flowNo: '47', createDate: '2025.06.25', creatorName: '이다혜' },
      { apprTitle: '특허 출원', flowNo: '48', createDate: '2025.06.24', creatorName: '박시우' },
      { apprTitle: '조직 개편', flowNo: '49', createDate: '2025.06.23', creatorName: '김서연' },
      { apprTitle: '지속가능성 보고서', flowNo: '50', createDate: '2025.06.22', creatorName: '이민호' },
      { apprTitle: '디지털 전환', flowNo: '51', createDate: '2025.06.21', creatorName: '박지원' },
      { apprTitle: '신입사원 교육', flowNo: '52', createDate: '2025.06.20', creatorName: '김예준' },
      { apprTitle: '고객 피드백 분석', flowNo: '53', createDate: '2025.06.19', creatorName: '이수연' },
      { apprTitle: '브랜드 리뉴얼', flowNo: '54', createDate: '2025.06.18', creatorName: '박지훈' },
      { apprTitle: '글로벌 확장', flowNo: '55', createDate: '2025.06.17', creatorName: '김서현' },
      { apprTitle: '환경 인증', flowNo: '56', createDate: '2025.06.16', creatorName: '이준서' },
      { apprTitle: 'AI 도입 계획', flowNo: '57', createDate: '2025.06.15', creatorName: '박채원' },
      { apprTitle: '모바일 앱 개발', flowNo: '58', createDate: '2025.06.14', creatorName: '김도윤' },
      { apprTitle: '공급망 관리', flowNo: '59', createDate: '2025.06.13', creatorName: '이서진' },
      { apprTitle: '블록체인 연구', flowNo: '60', createDate: '2025.06.12', creatorName: '박예린' },
      { apprTitle: 'ESG 전략 수립', flowNo: '61', createDate: '2025.06.11', creatorName: '김건우' },
      { apprTitle: '원격근무 정책', flowNo: '62', createDate: '2025.06.10', creatorName: '이하린' },
      { apprTitle: '스마트팩토리 구축', flowNo: '63', createDate: '2025.06.09', creatorName: '박시연' },
      { apprTitle: '사이버보안 강화', flowNo: '64', createDate: '2025.06.08', creatorName: '김윤서' },
      { apprTitle: '빅데이터 활용', flowNo: '65', createDate: '2025.06.07', creatorName: '이준혁' }
    ];

    return mockApprovals;
    // return [];
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchNotifications(): Promise<NotificationModel[]> {
  try {
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock API call with realistic notice data
    const mockNotifications: NotificationModel[] = [
      {
        notifyNo: '001',
        title: '경비정산 결재 요청',
        content: '[출장비] 서울 본사 출장비 결재가 요청되었습니다. (김영수)',
        readYn: 'N',
        popupYn: 'Y',
        link: 'EXP001/20240115001'
      },
      {
        notifyNo: '002',
        title: '휴가신청 승인 완료',
        content: '2024.01.20 ~ 2024.01.22 연차휴가 신청이 승인되었습니다.',
        readYn: 'N',
        popupYn: 'N',
        link: 'VAC001/20240115002'
      },
      {
        notifyNo: '003',
        title: '구매요청 반려',
        content: '[사무용품] 구매요청이 반려되었습니다. 사유: 예산 초과',
        readYn: 'Y',
        popupYn: 'N',
        link: 'PUR001/20240114001'
      },
      {
        notifyNo: '004',
        title: '교육신청 마감 임박',
        content: 'AWS 클라우드 교육 신청 마감이 3일 남았습니다.',
        readYn: 'Y',
        popupYn: 'N',
        link: 'TRN001/20240113001'
      },
      {
        notifyNo: '005',
        title: '초과근무 신청 승인',
        content: '1월 2주차 초과근무 신청이 승인되었습니다. (12시간)',
        readYn: 'N',
        popupYn: 'N',
        link: 'OT001/20240112001'
      },
      {
        notifyNo: '006',
        title: '시스템 점검 안내',
        content: '1월 20일 02:00 ~ 06:00 시스템 점검이 예정되어 있습니다.',
        readYn: 'Y',
        popupYn: 'N',
        link: ''
      }
    ];

    return mockNotifications;
    // set({ menuAreas: mockAreas });
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchNotices(): Promise<NoticeModel[]> {
  try {
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock API call with realistic notice data
    const mockNotices: NoticeModel[] = [
      {
        id: 'NOTICE_001',
        title: 'iFlow 시스템 업데이트 안내 (v2.1.0)',
        content: '새로운 기능이 추가되었습니다.\n\n1. 모바일 알림 개선\n2. 결재선 설정 기능 강화\n3. 파일 첨부 용량 확대 (50MB → 100MB)\n4. UI/UX 개선\n\n업데이트는 1월 15일 자동으로 적용됩니다.',
        isNew: true
      },
      {
        id: 'NOTICE_002',
        title: '2024년 연차/휴가 신청 안내',
        content: '2024년도 연차 및 각종 휴가 신청에 대한 안내사항입니다.\n\n- 연차 신청: 최소 3일 전 신청\n- 병가 신청: 진단서 첨부 필수\n- 경조사 휴가: 관련 서류 제출\n\n자세한 사항은 인사팀에 문의바랍니다.',
        isNew: true
      },
      {
        id: 'NOTICE_003',
        title: '설날 연휴 업무 중단 안내',
        content: '2024년 설날 연휴 기간 중 업무 중단을 안내드립니다.\n\n■ 휴무 기간: 2024.02.09(금) ~ 2024.02.12(월)\n■ 정상 업무: 2024.02.13(화) 09:00부터\n■ 응급상황 연락처: 02-XXXX-XXXX\n\n즐거운 설날 연휴 보내세요.',
        isNew: false
      },
      {
        id: 'NOTICE_004',
        title: '보안 강화를 위한 비밀번호 정책 변경',
        content: '정보보안 강화를 위해 비밀번호 정책이 변경됩니다.\n\n■ 시행일: 2024.01.20\n■ 주요 변경사항:\n- 최소 8자 이상 (기존 6자)\n- 특수문자 포함 필수\n- 90일마다 변경 권장\n\n시행일 이후 로그인 시 비밀번호 변경이 안내됩니다.',
        isNew: false
      },
      {
        id: 'NOTICE_005',
        title: '직장 내 괴롭힘 신고센터 운영 안내',
        content: '임직원 여러분의 건전한 직장 문화 조성을 위해 신고센터를 운영합니다.\n\n■ 신고 방법:\n- 온라인: company-report.co.kr\n- 전화: 02-XXXX-XXXX (24시간)\n- 이메일: report@company.com\n\n모든 신고는 익명으로 처리되며, 신고자 보호가 보장됩니다.',
        isNew: false
      },
      {
        id: 'NOTICE_006',
        title: 'AWS 교육과정 수강생 모집',
        content: 'AWS 클라우드 전문가 과정 수강생을 모집합니다.\n\n■ 교육 기간: 2024.02.01 ~ 2024.02.29\n■ 교육 시간: 매주 화,목 19:00-21:00\n■ 모집 인원: 20명\n■ 신청 마감: 2024.01.25\n\n수료 시 AWS 자격증 응시비용을 지원합니다.',
        isNew: false
      }
    ];

    return mockNotices;
    // set({ menuAreas: mockAreas });
  } catch (error: any) {
    console.error(error);
    return error;
  }
}
