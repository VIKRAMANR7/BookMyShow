import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Loading() {
  const { nextUrl } = useParams<{ nextUrl: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!nextUrl) return;

    // Delay navigation for 8 seconds (Stripe return → loading page)
    const timer = setTimeout(() => {
      navigate(`/${nextUrl}`);
    }, 8000);

    return () => clearTimeout(timer);
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full size-14 border-2 border-t-primary" />
    </div>
  );
}
