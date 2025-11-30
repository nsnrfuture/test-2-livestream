"use client";

import GoogleAd from "./GoogleAd";

/** 🔷 1. Responsive Display Ad (e.g. sidebar, between sections) */
export function DisplayAdResponsive() {
  return (
    <GoogleAd
      slot="1234567890" // TODO: replace with your display ad slot
      format="auto"
      className="my-4"
      style={{ display: "block" }}
    />
  );
}

/** 🔶 2. In-feed Ad (inside list / feed) */
export function InFeedAd() {
  return (
    <GoogleAd
      slot="2345678901" // TODO: replace with your in-feed slot
      layout="in-article"
      format="fluid"
      className="my-4"
      style={{ display: "block", textAlign: "center" }}
    />
  );
}

/** 🟥 3. Multiplex Ad (grid / box style) */
export function MultiplexAd() {
  return (
    <GoogleAd
      slot="3456789012" // TODO: replace with your multiplex slot
      format="fluid"
      layoutKey="-gw-3+1f-3d+2z" // example layout key, use the one from AdSense
      className="my-4"
      style={{ display: "block" }}
    />
  );
}
