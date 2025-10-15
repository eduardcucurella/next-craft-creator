export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'unknown';
  let browserVersion = '0.0.0.0';

  // Chrome
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browserName = 'chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  // Edge
  else if (userAgent.indexOf('Edg') > -1) {
    browserName = 'edge';
    const match = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserVersion = `${match[1]}.0.0`;
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) browserVersion = `${match[1]}.0.0`;
  }

  return {
    clientId: browserName,
    clientVersion: browserVersion,
  };
};

export const FRONTEND_VERSION = '5.2539.0';
