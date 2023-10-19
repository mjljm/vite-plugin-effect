interface vitePluginEffectOptions {
	/**
	 * Path to the Effect server. If relative, relative to Vite's root
	 */
	serverEntry: string;
}

const vitePluginEffect = (options: vitePluginEffectOptions): PluginOption => {
	return {
		name: 'vite-plugin-effect',
		async configureServer(viteServer) {
			try {
				const httpServer = viteServer.httpServer;

				if (!httpServer) throw Error('vitePluginEffect: Vite server not created in dev');
				// Compile and launch the server entry
				const createServerModule = await viteServer.ssrLoadModule(options.serverEntry);
				const createEffectServer = createServerModule['createEffectServer'] as unknown;
				if (typeof createEffectServer === 'function' && createEffectServer.length === 1) {
					// Create a proxy of the http server that disables the listen function (but the
					// callback, if any, gets called)
					const httpServerProxy = new Proxy(httpServer, {
						get(target, prop, receiver) {
							if (prop === 'listen') {
								return (...args: Array<unknown>) => {
									pipe(
										args,
										RA.last,
										O.match({
											onNone: () => {},
											onSome: (a) => (typeof a === 'function' ? (a() as unknown) : {})
										})
									);

									return receiver as unknown;
								};
							}
							return Reflect.get(target, prop, receiver) as unknown;
						}
					});
					createEffectServer(httpServerProxy);
				} else
					throw Error(
						`vitePluginEffect: ${options.serverEntry} does not contain a createServer function`
					);
			} catch (e) {
				const err =
					e instanceof Error
						? e
						: typeof e === 'object' && e && 'message' in e && typeof e.message === 'string'
						? Error(e.message)
						: Error('Unknown error');
				viteServer.ssrFixStacktrace(err);
			}
		}
	};
};