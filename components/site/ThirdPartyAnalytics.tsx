"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GA4_ID, META_PIXEL_ID } from "@/lib/env";
import { privacyOptOut } from "@/lib/client/tracking";

// GA4 and Meta Pixel load only when their IDs are configured — by env var, or
// else by an enabled, verified integration in the CRM (passed in as props) —
// and never for visitors sending Global Privacy Control / Do Not Track. Events
// from lib/client/tracking.ts are mirrored into them automatically.
export function ThirdPartyAnalytics({ ga4Id: crmGa4, pixelId: crmPixel }: { ga4Id?: string; pixelId?: string } = {}) {
  const GA4 = GA4_ID || crmGa4 || "";
  const PIXEL = META_PIXEL_ID || crmPixel || "";
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    // Read after mount: privacy signals only exist in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(!privacyOptOut());
  }, []);
  if (!allowed || (!GA4 && !PIXEL)) return null;

  return (
    <>
      {GA4 ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4)}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(GA4)});`}
          </Script>
        </>
      ) : null}
      {PIXEL ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(PIXEL)});fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
