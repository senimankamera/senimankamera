import { redirect } from "next/navigation";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";
import { TestimonialManager } from "@/src/modules/gallery/components/testimonial-manager";
import { createClient } from "@/src/infrastructure/supabase/server";

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const repo = new TestimonialRepository();
  const testimonials = await repo.findAll();

  const serializedTestimonials = JSON.parse(JSON.stringify(testimonials));

  return (
    <TestimonialManager initialTestimonials={serializedTestimonials} />
  );
}
