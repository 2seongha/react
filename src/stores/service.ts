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
      { apprTitle: '초과근무 신청', createDate: '2025.08.10', creatorName: '홍길동' },
      { apprTitle: '휴가 신청', createDate: '2025.08.09', creatorName: '김영희' },
      { apprTitle: '출장비 정산', createDate: '2025.08.08', creatorName: '박민수' },
      { apprTitle: '교육 신청', createDate: '2025.08.07', creatorName: '이수진' },
      { apprTitle: '구매 요청', createDate: '2025.08.06', creatorName: '최태영' },
      { apprTitle: '회의실 예약', createDate: '2025.08.05', creatorName: '정소연' },
      { apprTitle: '장비 신청', createDate: '2025.08.04', creatorName: '임동현' },
      { apprTitle: '계약 승인', createDate: '2025.08.03', creatorName: '윤미정' },
      { apprTitle: '예산 승인', createDate: '2025.08.02', creatorName: '강호철' },
      { apprTitle: '인사 발령', createDate: '2025.08.01', creatorName: '송지혜' },
      { apprTitle: '프로젝트 승인', createDate: '2025.07.31', creatorName: '한상우' },
      { apprTitle: '급여 정산', createDate: '2025.07.30', creatorName: '오세영' },
      { apprTitle: '경비 정산', createDate: '2025.07.29', creatorName: '배수진' },
      { apprTitle: '시설 보수', createDate: '2025.07.28', creatorName: '남궁민' },
      { apprTitle: '외부 교육', createDate: '2025.07.27', creatorName: '서미경' }
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
