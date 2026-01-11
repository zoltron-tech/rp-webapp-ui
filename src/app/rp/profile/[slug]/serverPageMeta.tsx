import type { Metadata } from "next";

type PageMetaProps = {
  params: { username: string };
};

export async function generateMetadata({
  params,
}: PageMetaProps): Promise<Metadata> {
  const { username } = params;

  // ⚠️ MUST be server-side fetch
  const res = await fetch(
    `https://api.novelist.world/users/${username}`,
    { cache: "no-store" }, // or revalidate
  );

  if (!res.ok) {
    return {
      title: "Novelist World",
    };
  }

  const novelist = await res.json();

  return {
    description: `Find ${username} at Novelist World`,
    openGraph: {
      description: `Find ${username} at Novelist World`,
      images: [
        {
          height: 630,
          url: novelist.image, // MUST be absolute HTTPS
          width: 1200,
        },
      ],
      title: `${novelist.firstName} ${novelist.lastName}`,
    },
    title: `${novelist.firstName} ${novelist.lastName}`,
    twitter: {
      card: "summary_large_image",
      description: `Find ${username} at Novelist World`,
      images: [novelist.image],
      title: `${novelist.firstName} ${novelist.lastName}`,
    },
  };
}
