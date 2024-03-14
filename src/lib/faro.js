import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'
//import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export const initFaro = () => {
  var faro = initializeFaro({
    url: 'https://faro-collector-prod-eu-west-3.grafana.net/collect/ff89ecdffa24839797cd050e86b0dbbd',
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
