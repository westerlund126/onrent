import React from "react";

export default function RootHead() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <>
      <title>Horizon UI PRO NextJS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />

      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href={`${basePath}/manifest.json`} />
      <link
        rel="shortcut icon"
        type="image/x-icon"
        href={`${basePath}/favicon.ico`}
      />
    </>
  );
}
