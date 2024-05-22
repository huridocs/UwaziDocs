/* eslint-disable max-statements */
import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { globalMatomoAtom, settingsAtom } from 'V2/atoms';

const buildScript = ({
  globalUrl,
  globalId,
  userUrl,
  userId,
}: {
  globalUrl?: string;
  globalId?: string;
  userUrl?: string;
  userId?: string;
}) => {
  const userMatomoUrl = userUrl?.replace(/\/?$/, '/');
  const globalMatomoUrl = globalUrl?.replace(/\/?$/, '/');

  const mainUrl = globalMatomoUrl || userMatomoUrl;
  const mainId = globalId || userId;
  const filename = globalMatomoUrl ? 'tenant' : 'matomo';

  return `
  var _paq = _paq || [];
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
  (function () {
    var url = "${mainUrl}";
    _paq.push(["setTrackerUrl", url + "${filename}.php"]);
    _paq.push(["setSiteId", "${mainId}"]);
    ${userMatomoUrl && globalMatomoUrl ? `_paq.push(["addTracker", "${userMatomoUrl}matomo.php", "${userId}"]);` : ''}
    var d = document,
      g = d.createElement("script"),
      s = d.getElementsByTagName("script")[0];
    g.type = "text/javascript";
    g.async = true;
    g.defer = true;
    g.src = url + "${filename}.js";
    s.parentNode.insertBefore(g, s);
  })();`;
};

const Matomo = () => {
  const scriptIsPresent = useRef(false);
  const { matomoConfig } = useAtomValue(settingsAtom);
  const globalMatomo = useAtomValue(globalMatomoAtom);
  const { id: globalId, url: globalUrl } = globalMatomo || {};
  let id: string | undefined;
  let url: string | undefined;

  try {
    ({ id, url } = JSON.parse(matomoConfig || '{}') as { id?: string; url?: string });
    //silent fail
    // eslint-disable-next-line no-empty
  } catch (e) {}

  useEffect(() => {
    if (!scriptIsPresent.current) {
      const script = document.createElement('script');
      const hasUserMatomo = Boolean(id && url);
      const hasGlobalMatomo = Boolean(globalUrl && globalId);

      let scriptContent = '';

      switch (true) {
        case hasGlobalMatomo && !hasUserMatomo:
          scriptContent = buildScript({ globalUrl, globalId });
          break;

        case !hasGlobalMatomo && hasUserMatomo:
          scriptContent = buildScript({ userUrl: url, userId: id });
          break;

        case hasGlobalMatomo && hasUserMatomo:
          scriptContent = buildScript({
            globalUrl,
            globalId,
            userUrl: url,
            userId: id,
          });
          break;

        default:
          break;
      }

      if (scriptContent) {
        script.innerHTML = scriptContent;
        document.body.appendChild(script);
        scriptIsPresent.current = true;
      }
    }
  }, []);

  return null;
};

export { Matomo };
