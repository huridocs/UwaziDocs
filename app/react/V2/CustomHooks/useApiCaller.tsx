import React from 'react';
import { useSetRecoilState } from 'recoil';
import { Translate } from 'app/I18N';
import { notificationAtom } from 'V2/atoms';
import { RequestParams } from 'app/utils/RequestParams';

const getData = async (res: Response) => (res.json ? res.json() : res);
const getError = async (res: Response) => {
  const json = res.json ? await res.json() : undefined;
  return json && json.error ? json.error : new Error('An error occurred');
};

const useApiCaller = () => {
  const setNotifications = useSetRecoilState(notificationAtom);

  const handleSuccess = async (res: Response, successAction: string) => {
    setNotifications({
      type: 'success',
      text: <Translate>{successAction}</Translate>,
    });
    return getData(res);
  };

  const handleError = async (e: Error) => {
    setNotifications({
      type: 'error',
      text: <Translate>An error occurred</Translate>,
      details: <span>{e.message}</span>,
    });
    return e.message;
  };

  const requestAction = async (
    action: (params: RequestParams) => Promise<Response>,
    requestParams: RequestParams,
    successAction: string
  ) => {
    let data;
    let error;
    try {
      const res: Response = await action(requestParams);
      if (!res.status || res.status === 200) {
        data = handleSuccess(res, successAction);
      } else {
        error = handleError(await getError(res));
      }
    } catch (e) {
      error = handleError(e);
    }
    return { data, error };
  };

  return { requestAction };
};

export { useApiCaller };
