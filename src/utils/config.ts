interface ConfigObj {
  timestampServerHostname: string;
  timestampServerPort: number;
  isTimestampServerSecure: boolean;
  backendServerHostname: string;
  backendServerPort: number | undefined;
  isBackendServerSecure: boolean;
}

export const defaultShortRouteId = '370';

/**
 * Get hostnames and ports of different infra.
 * Rerun `yarn build` on frontend after changing this.
 */
export function getConfig(): ConfigObj {
  return {
    timestampServerHostname: 'transportstatus-1.duckdns.org',
    isTimestampServerSecure: false,
    timestampServerPort: 5001,
    // backendServerHostname: "localhost",

    backendServerHostname: "api.sydneytransitgraph.com",
    // backendServerHostname: "localhost",
    isBackendServerSecure: true,
    backendServerPort: 443
    // backendServerPort: 5000
  }
}
