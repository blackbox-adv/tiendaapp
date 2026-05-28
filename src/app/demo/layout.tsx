import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo Store - TiendApp',
  description: 'Vista previa de tienda demo',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
