import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'
//import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export const initFaro = () => {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    initializeFaro({
      url: process.env.NEXT_PUBLIC_FARO_ENDPOINT + process.env.NEXT_PUBLIC_FARO_INSTRUMENTATION_KEY,
      app: {
        name: 'getmentor_dev',
        version: '1.0.0',
        environment: 'production',
      },

      instrumentations: [
        // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
        ...getWebInstrumentations(),

        // Initialization of the tracing package.
        // This packages is optional because it increases the bundle size noticeably. Only add it if you want tracing data.
        //new TracingInstrumentation(),
      ],
    })
  }
}
