import { useEffect } from 'react';
import { BareMuxConnection } from '@mercuryworkshop/bare-mux';
import { useOptions } from '/src/utils/optionsContext';
import { fetchW as returnWServer } from './findWisp';
import store from './useLoaderStore';

export default function useReg() {
  const { options } = useOptions();
  const ws = `${location.protocol == 'http:' ? 'ws:' : 'wss:'}//${location.host}/wisp/`;
  const bareServer = `${location.origin}/seal/`;
  const sws = [{ path: '/uv/sw.js' }, { path: '/s_sw.js', scope: '/scramjet/' }];
  const setWispStatus = store((s) => s.setWispStatus);

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.scr) {
          const script = document.createElement('script');
          script.src = '/scram/scramjet.all.js';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const { ScramjetController } = $scramjetLoadController();

        window.scr = new ScramjetController({
          files: {
            wasm: '/scram/scramjet.wasm.wasm',
            all: '/scram/scramjet.all.js',
            sync: '/scram/scramjet.sync.js',
          },
          flags: { rewriterLogs: false, scramitize: false, cleanErrors: true, sourcemaps: true },
        });

        window.scr.init();
      } catch (err) {
        console.warn('Scramjet bootstrap failed, UV will still be initialized:', err);
      }

      for (const sw of sws) {
        try {
          await navigator.serviceWorker.register(
            sw.path,
            sw.scope ? { scope: sw.scope } : undefined,
          );
        } catch (err) {
          console.warn(`SW reg err (${sw.path}):`, err);
        }
      }

      const connection = new BareMuxConnection('/baremux/worker.js');
      isStaticBuild && setWispStatus('init');
      let socket = isStaticBuild ? await returnWServer() : null;
      isStaticBuild && (!socket ? setWispStatus(false) : setWispStatus(true));

      const activeWisp =
        options.wServer != null && options.wServer !== ''
          ? options.wServer
          : isStaticBuild
            ? socket
            : ws;

      try {
        await connection.setTransport('/libcurl/index.mjs', [{ wisp: activeWisp }]);
      } catch (err) {
        console.warn('libcurl transport failed, falling back to bare server transport:', err);
        try {
          await connection.setTransport('/baremod/index.mjs', [bareServer]);
        } catch (fallbackErr) {
          console.error('Failed to initialize bare transports:', fallbackErr);
        }
      }
    };

    init();
  }, [options.wServer]);
}
