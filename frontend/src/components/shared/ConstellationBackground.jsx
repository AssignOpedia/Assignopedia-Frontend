const backgroundVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_030633_1712fc71-4979-4e14-98f9-9f95702ab3da.mp4";

function ConstellationBackground({ variant = "services" }) {
  return (
    <div className={`constellation-bg ${variant}`} aria-hidden="true">
      <video
        className="constellation-video"
        src={backgroundVideoUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="constellation-overlay" />
    </div>
  );
}

export default ConstellationBackground;
