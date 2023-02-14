import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useSearchParams } from 'react-router-dom';
import { has } from 'lodash';
import { ErrorFallback } from 'app/App/ErrorHandling/ErrorFallback';
import { RequestError } from 'app/App/ErrorHandling/ErrorUtils';
import Footer from 'app/App/Footer';
import { searchParamsFromSearchParams } from 'app/utils/routeHelpers';
import { t } from 'app/I18N';

const handledErrors: { [k: string]: RequestError } = {
  400: {
    title: 'Bad Request',
    summary: 'Bad Request',
    name: 'The request could not be processed.',
    message: '',
    code: '400',
  },
  404: {
    title: 'Not Found',
    summary: '',
    name: "We can't find the page you're looking for.",
    message: '',
    code: '404',
  },
  500: {
    title: 'Unexpected error',
    summary: 'Unexpected error',
    name: '',
    message: '',
    code: '500',
  },
};

const GeneralError = () => {
  const { errorCode } = useParams();
  const [searchParams] = useSearchParams();

  const { requestId } = searchParamsFromSearchParams(searchParams);
  const { code } =
    errorCode && has(handledErrors, errorCode) ? handledErrors[errorCode] : handledErrors[404];
  const safeRequestId = /^[0-9-]{4}$/.exec(requestId);
  const error = handledErrors[code!];
  error.requestId = safeRequestId ? safeRequestId[0] : undefined;
  const errorTitle = t('System', error.title, null, false);
  return (
    <div>
      <Helmet>
        <title>{errorTitle}</title>
      </Helmet>
      <ErrorFallback error={error} />
      <Footer />
    </div>
  );
};

export default GeneralError;
