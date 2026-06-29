import { PublicLayoutWrapper } from "@/components/public-main-container";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayoutWrapper>{children}</PublicLayoutWrapper>;
}
