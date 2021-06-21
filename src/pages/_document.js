import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap"
            rel="stylesheet"
          />

          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />

          {process.env.APP_ENV === 'production' && (
            <>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-NBGRPCZ');
              `,
                }}
              ></script>

              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
                      ;r.type="text/javascript"
                      ;r.integrity="sha384-xwN6OCSgIf1SF9jtD6pouaSwCvpobyV3lanBGQ1d33MwTxLarbQxUif0Slt0npCM"
                      ;r.crossOrigin="anonymous";r.async=true
                      ;r.src="https://cdn.amplitude.com/libs/amplitude-8.3.0-min.gz.js"
                      ;r.onload=function(){if(!e.amplitude.runQueuedFunctions){
                      console.log("[Amplitude] Error: could not load SDK")}}
                      ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
                      ;function s(e,t){e.prototype[t]=function(){
                      this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
                      var o=function(){this._q=[];return this}
                      ;var a=["add","append","clearAll","prepend","set","setOnce","unset","preInsert","postInsert","remove"]
                      ;for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[]
                      ;return this}
                      ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
                      ;for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u
                      ;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"]
                      ;function v(e){function t(t){e[t]=function(){
                      e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
                      for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
                      e=(!e||e.length===0?"$default_instance":e).toLowerCase()
                      ;if(!Object.prototype.hasOwnProperty.call(n._iq,e)){n._iq[e]={_q:[]};v(n._iq[e])
                    }return n._iq[e]};e.amplitude=n})(window,document);
                    amplitude.getInstance().init('c29b20eabc19a4518a22eaa29f8bbe74');
                  `,
                }}
              ></script>

              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
                    for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
                    MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
                    mixpanel.init('1c04f9a84a4fff822921c249bbc3dc7b');
                  `,
                }}
              ></script>
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
