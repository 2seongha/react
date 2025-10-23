import axios from "axios";
import useAppStore from "./appStore";
import { UserModel, ApprovalModel, AreaModel, NoticeModel, NotificationModel } from "./types";

// axios 인스턴스 생성
const createApiInstance = () => {
  const corp = useAppStore.getState().corp;

  return axios.create({
    baseURL: corp?.system.apiEndpoint,
    headers: {
      'x-api-key': corp?.system.apiKey
    }
  });
};

export async function fetchUser(LOGIN_ID: string): Promise<UserModel> {
  try {
    const api = createApiInstance();
    const res = await api.get(`/user/${encodeURIComponent(LOGIN_ID)}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchAreas(P_AREA_CODE: string): Promise<AreaModel[]> {
  try {
    const user = useAppStore.getState().user;
    // const LOGIN_ID = user?.LOGIN_ID;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/menus?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&P_AREA_CODE=${P_AREA_CODE}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchApprovals(P_AREA_CODE: string, AREA_CODE: string): Promise<ApprovalModel> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    // const LOGIN_ID = user?.MAIL;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/approvals?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&P_AREA_CODE=${P_AREA_CODE}&AREA_CODE=${AREA_CODE}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function fetchNotifications(): Promise<NotificationModel[]> {
  try {
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Function to get random TYPE and corresponding TITLE
    const getRandomTypeAndTitle = () => {
      const types = ['START', 'APPROVE', 'REJECT'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const titleMap = {
        START: '결재 요청이 도착했습니다.',
        APPROVE: '결재 요청이 승인되었습니다.',
        REJECT: '결재 요청이 반려되었습니다.'
      };
      
      return { type, title: titleMap[type] };
    };

    // Mock API call with realistic notice data
    const mockNotifications: NotificationModel[] = [
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '001',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[출장비] 서울 본사 출장비 결재가 요청되었습니다. (김영수)',
          READ_YN: 'N',
          POPUP_YN: 'Y',
          LINK: 'EXP001/20240115001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '002',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '2024.01.20 ~ 2024.01.22 연차휴가 신청이 승인되었습니다.',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'VAC001/20240115002',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '003',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[사무용품] 구매요청이 반려되었습니다. 사유: 예산 초과',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'PUR001/20240114001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '004',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: 'AWS 클라우드 교육 신청 마감이 3일 남았습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'TRN001/20240113001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '005',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 2주차 초과근무 신청이 승인되었습니다. (12시간)',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'OT001/20240112001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '006',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 20일 02:00 ~ 06:00 시스템 점검이 예정되어 있습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: '',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '007',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[출장비] 서울 본사 출장비 결재가 요청되었습니다. (김영수)',
          READ_YN: 'N',
          POPUP_YN: 'Y',
          LINK: 'EXP001/20240115001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '008',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '2024.01.20 ~ 2024.01.22 연차휴가 신청이 승인되었습니다.',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'VAC001/20240115002',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '009',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[사무용품] 구매요청이 반려되었습니다. 사유: 예산 초과',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'PUR001/20240114001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '010',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: 'AWS 클라우드 교육 신청 마감이 3일 남았습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'TRN001/20240113001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '011',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 2주차 초과근무 신청이 승인되었습니다. (12시간)',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'OT001/20240112001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '012',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 20일 02:00 ~ 06:00 시스템 점검이 예정되어 있습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: '',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '013',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[출장비] 서울 본사 출장비 결재가 요청되었습니다. (김영수)',
          READ_YN: 'N',
          POPUP_YN: 'Y',
          LINK: 'EXP001/20240115001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '014',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '2024.01.20 ~ 2024.01.22 연차휴가 신청이 승인되었습니다.',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'VAC001/20240115002',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '015',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[사무용품] 구매요청이 반려되었습니다. 사유: 예산 초과',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'PUR001/20240114001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '016',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: 'AWS 클라우드 교육 신청 마감이 3일 남았습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'TRN001/20240113001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '017',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 2주차 초과근무 신청이 승인되었습니다. (12시간)',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'OT001/20240112001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '018',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 20일 02:00 ~ 06:00 시스템 점검이 예정되어 있습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: '',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '019',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[출장비] 서울 본사 출장비 결재가 요청되었습니다. (김영수)',
          READ_YN: 'N',
          POPUP_YN: 'Y',
          LINK: 'EXP001/20240115001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '020',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '2024.01.20 ~ 2024.01.22 연차휴가 신청이 승인되었습니다.',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'VAC001/20240115002',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '021',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '[사무용품] 구매요청이 반려되었습니다. 사유: 예산 초과',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'PUR001/20240114001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '022',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: 'AWS 클라우드 교육 신청 마감이 3일 남았습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: 'TRN001/20240113001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '023',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 2주차 초과근무 신청이 승인되었습니다. (12시간)',
          READ_YN: 'N',
          POPUP_YN: 'N',
          LINK: 'OT001/20240112001',
          ERDAT: '2025-10-17',
        };
      })(),
      (() => {
        const typeAndTitle = getRandomTypeAndTitle();
        return {
          NOTIFY_NO: '024',
          TYPE: typeAndTitle.type,
          TITLE: typeAndTitle.title,
          CONTENT: '1월 20일 02:00 ~ 06:00 시스템 점검이 예정되어 있습니다.',
          READ_YN: 'Y',
          POPUP_YN: 'N',
          LINK: '',
          ERDAT: '2025-10-17',
        };
      })()
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
    await new Promise(resolve => setTimeout(resolve, 100));

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
