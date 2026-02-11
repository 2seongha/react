import axios from "axios";
import useAppStore from "./appStore";
import { UserModel, ApprovalModel, AreaModel, NoticeModel, NotificationModel } from "./types";

// axios 인스턴스 생성
const createApiInstance = () => {
  const corp = useAppStore.getState().corp;
  if (!corp?.SYSTEM?.apiEndpoint || !corp?.SYSTEM?.apiKey) {
    throw new Error('API endpoint or key is not defined in store.');
  }

  return axios.create({
    baseURL: corp?.SYSTEM?.apiEndpoint,
    headers: {
      'x-api-key': corp?.SYSTEM?.apiKey
    }
  });
};

export async function getUser(LOGIN_ID: string): Promise<UserModel> {
  try {
    const api = createApiInstance();
    const res = await api.get(`/v1/api/user/${encodeURIComponent(LOGIN_ID)}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getAreas(P_AREA_CODE: string): Promise<AreaModel[]> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/menus?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&P_AREA_CODE=${P_AREA_CODE}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getApprovals(P_AREA_CODE: string, AREA_CODE: string, FLOWCODE: string, FLOWNO: string): Promise<ApprovalModel> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/approvals?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&P_AREA_CODE=${P_AREA_CODE}&AREA_CODE=${AREA_CODE}&FLOWCODE=${FLOWCODE}&FLOWNO=${FLOWNO}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function postApprovals(ACTIVITY: string | undefined, SEPARATE: boolean | undefined, LIST: Array<any> | undefined): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;

    const api = createApiInstance();
    const payload = {
      LOGIN_ID,
      ACTIVITY,
      SEPARATE,
      LIST
    }

    const res = await api.post(`/v1/api/confirm`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getNotifications(): Promise<NotificationModel[]> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/notify?LOGIN_ID=${LOGIN_ID}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function patchNotifications(NOTIFY_NO: string, READ_YN: string, DELETE_YN: string): Promise<NotificationModel[]> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;

    const api = createApiInstance();
    const payload = {
      LOGIN_ID,
      NOTIFY_NO,
      READ_YN,
      DELETE_YN,
    }
    const res = await api.patch(`/v1/api/notify?LOGIN_ID=${LOGIN_ID}`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getStart(FLOWCODE: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/start?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&FLOWCODE=${FLOWCODE}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getSearchHelp(ENTITYSET: string, FLOWCODE?: string, INPUT1?: string, INPUT2?: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/searchHelp?ENTITYSET=${ENTITYSET}&LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&FLOWCODE=${FLOWCODE ?? ''}&INPUT1=${INPUT1 ?? ''}&INPUT2=${INPUT2 ?? ''}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

// 임직원 개인 경비 상신
export async function postStartPersonalExpense(APPROVAL: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = APPROVAL;

    const res = await api.post(`/v1/api/start/personalExpense`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

// 법인카드 상신
export async function postStartCreditCard(APPROVAL: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = APPROVAL;

    const res = await api.post(`/v1/api/start/creditCard`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function postAttach(ATTACH: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = ATTACH;

    const res = await api.post(`/v1/api/attach`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function deleteAttach(GUID: string, FILE_NO: string, FILE_TYPE: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();

    const res = await api.delete(`/v1/api/attach?GUID=${GUID}&FILE_NO=${FILE_NO}&FILE_TYPE=${FILE_TYPE}&BUKRS=${BUKRS}&LOGIN_ID=${LOGIN_ID}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function postExtraFieldUse(APPROVAL: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = APPROVAL;

    const res = await api.post(`/v1/api/extra`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function postFcmToken(DELETE_TOKENS: [string?], INSERT_TOKENS: [string?], DEVICE_INFO: string | null): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    if (!LOGIN_ID) return; // 토큰 리프레쉬일때만 여기 값이 있음

    const api = createApiInstance();
    const payload = {
      LOGIN_ID,
      DELETE_TOKENS,
      INSERT_TOKENS,
      DEVICE_INFO
    };

    const res = await api.post(`/v1/api/token`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getPsuhAllow(): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;

    const deviceToken = localStorage.getItem('deviceToken');
    if (!deviceToken) throw new Error('No device token~~~!');

    const api = createApiInstance();
    const payload = {
      LOGIN_ID,
      TOKEN: deviceToken,
    };

    const res = await api.post(`/v1/api/push_allow`, payload);
    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function patchPsuhAllow(PERSONAL_ALLOW: string, NOTICE_ALLOW: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;

    const deviceToken = localStorage.getItem('deviceToken');
    // if (!deviceToken) throw new Error('No device token~~~!');

    const api = createApiInstance();
    const payload = {
      LOGIN_ID,
      TOKEN: deviceToken,
      PERSONAL_ALLOW,
      NOTICE_ALLOW,
    };

    const res = await api.patch(`/v1/api/push_allow`, payload);
    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getCardNo(FLOWCODE?: string, BUKRS?: string, VENDA?: string, VBEDA?: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    // const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/cardNo?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&FLOWCODE=${FLOWCODE ?? ''}&VENDA=${VENDA ?? ''}&VBEDA=${VBEDA ?? ''}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getCardList(FLOWCODE?: string, BUKRS?: string, CARDNO?: string, START_DATE?: string, END_DATE?: string): Promise<any> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    // const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/cardList?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}&FLOWCODE=${FLOWCODE ?? ''}&CARDNO=${CARDNO ?? ''}&START_DATE=${START_DATE ?? ''}&END_DATE=${END_DATE ?? ''}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getNotices(): Promise<NoticeModel[]> {
  try {
    const user = useAppStore.getState().user;
    const LOGIN_ID = user?.LOGIN_ID;
    const BUKRS = user?.BUKRS;

    const api = createApiInstance();
    const res = await api.get(`/v1/api/notice?LOGIN_ID=${LOGIN_ID}&BUKRS=${BUKRS}`);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function getCardVatCode(APPROVAL: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = APPROVAL;

    const res = await api.post(`/v1/api/card/vatCode`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

export async function postCardSave(APPROVAL: any): Promise<any> {
  try {
    const api = createApiInstance();
    const payload = APPROVAL;

    const res = await api.post(`/v1/api/card/save`, payload);

    return res.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}