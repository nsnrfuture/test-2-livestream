"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type GoogleAdProps = {
  /** Your AdSense slot ID */
  slot: string;
  /** Display / In-feed / Multiplex can use different styles */
  style?: React.CSSProperties;
  /** For responsive display ads */
  format?: string;
  layout?: string;
  layoutKey?: string;
  className?: string;
};

export default function GoogleAd({
  slot,
  style,
  format,
  layout,
  layoutKey,
  className,
}: GoogleAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // silent fail
      console.warn("AdSense push error", e);
    }
  }, [slot]);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style ?? { display: "block" }}
        data-ad-client="ca-pub-9849368971031716" // TODO: replace with your ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
}
