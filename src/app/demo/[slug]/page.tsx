import DemoTemplateClient from '@/components/demo/DemoTemplateClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DemoStorePage({ params }: PageProps) {
  const { slug } = await params;
  return <DemoTemplateClient slug={slug} />;
}
