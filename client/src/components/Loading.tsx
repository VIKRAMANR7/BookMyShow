import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const REDIRECT_DELAY_MS = 8000;

export default function Loading() {
  const { nextUrl } = useParams<{ nextUrl: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!nextUrl) return;

    const timer = setTimeout(() => {
      navigate(`/${nextUrl}`);
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full size-14 border-2 border-t-primary" />
    </div>
  );
}
